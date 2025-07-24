import Counsellor from '../models/Counsellor.js';
import Session from '../models/Session.js';
import {sendAppointmentAcceptanceEmail, sendAppointmentDeclineEmail} from "../utils/emailConfig.js";
import mongoose from 'mongoose';
import moment from 'moment-timezone';
import Document from '../models/Document.js';
import { DateTime } from 'luxon';
import User from '../models/User.js';
import SleepLog from '../models/SleepLog.js';
import JournalEntry from '../models/JournalEntry.js';
import PDFDocument from 'pdfkit';
import pdfMake from 'pdfmake';

// Function to initialize pdfMake with VFS
const initializePdfMake = () => {
  return new Promise((resolve, reject) => {
    import('pdfmake/build/vfs_fonts.js').then((vfsFonts) => {
      if (pdfMake && typeof pdfMake.createPdf === 'function') {
        pdfMake.vfs = vfsFonts.default || {};
        resolve(pdfMake);
      } else {
        console.warn('pdfMake not properly initialized, falling back to empty VFS.');
        pdfMake.vfs = {};
        resolve(pdfMake);
      }
    }).catch((err) => {
      console.error('Failed to load VFS fonts:', err);
      pdfMake.vfs = {};
      resolve(pdfMake); // Resolve with fallback even on error
    });
  });
};


// Add or update availability for a counsellor
export const addAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array.' });
    }
    const counsellorId = req.counsellor._id;
    const updated = await Counsellor.findByIdAndUpdate(
      counsellorId,
      { availability },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Counsellor not found.' });
    }
    res.status(200).json({ success: true, message: 'Availability updated successfully.', data: updated.availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating availability', error: error.message });
  }
};

export const getBookingRequests = async (req, res) => {
  try {
    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: 'pending'
    })
      .populate('user', 'fullName email')
      .sort({ dateTime: 1 })
      .lean();

    const timezone = 'Asia/Kathmandu';

    const formattedSessions = sessions.map(session => {
      // Convert dateTime to the timezone and format to ISO string first
      const dateTimeInTZ = moment(session.dateTime).tz(timezone).toISOString();

      return {
        ...session,
        createdAt: moment(session.createdAt).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(session.updatedAt).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
        dateTime: session.dateTime,
        date: dateTimeInTZ.split('T')[0], // 'YYYY-MM-DD'
        time: dateTimeInTZ.split('T')[1].split('.')[0], // 'HH:mm:ss'
        user: {
          fullName: session.user.fullName,
          email: session.user.email
        }
      };
    });

    res.status(200).json({ success: true, data: formattedSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking requests', error: error.message });
  }
};


export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: { $in: ['accepted', 'completed'] }
    })
      .populate('user', 'fullName email')
      .lean();

    // Separate sessions by status
    const acceptedSessions = sessions
      .filter(session => session.status === 'accepted')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const completedSessions = sessions
      .filter(session => session.status === 'completed')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // Combine sessions: accepted first, then completed
    const sortedSessions = [...acceptedSessions, ...completedSessions];

    // Transform the response to include date and time separately
    const formattedSessions = sortedSessions.map(session => ({
      ...session,
      date: session.dateTime.toISOString().split('T')[0],
      time: session.dateTime.toISOString().split('T')[1].split('.')[0],
      user: {
        fullName: session.user.fullName,
        email: session.user.email
      }
    }));

    res.status(200).json({ success: true, data: formattedSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sessions', error: error.message });
  }
};

// Accept a booking request by id

export const acceptBookingRequest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Booking request id is required.' });
    }

    // Find the session and ensure it belongs to this counsellor, populate user and counsellor
    const session = await Session.findOne({ _id: id, counsellor: req.counsellor._id })
      .populate('user', 'email fullName')
      .populate('counsellor', 'fullName');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ success: false, message: "The requested booking request can't be accepted, status not pending" });
    }

    // Do not accept if dateTime is prior to now
    if (session.dateTime < new Date()) {
      return res.status(400).json({ success: false, message: "The requested booking request can't be accepted, date/time is in the past" });
    }

    // Check if another session with status 'accepted' exists for the same dateTime
    const alreadyAccepted = await Session.findOne({
      _id: { $ne: session._id },
      counsellor: req.counsellor._id,
      dateTime: session.dateTime,
      status: 'accepted'
    });

    if (alreadyAccepted) {
      return res.status(400).json({ success: false, message: 'You are already booked for the provided date and time' });
    }

    // Update session status to accepted
    session.status = 'accepted';
    await session.save();

    // Format date and time for email (using UTC to match stored dateTime)
    const appointmentDate = session.dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
    const appointmentTime = session.dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });

    // Send email notification to user
    try {
      await sendAppointmentAcceptanceEmail(
        session.user.email,
        session.counsellor.fullName,
        appointmentDate,
        appointmentTime
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Note: Not failing the request due to email error to ensure booking is still accepted
    }

    // Format response with separated date and time
    const formattedSession = {
      ...session.toObject(),
      date: session.dateTime.toISOString().split('T')[0],
      time: session.dateTime.toISOString().split('T')[1].split('.')[0],
      user: {
        fullName: session.user.fullName,
        email: session.user.email
      },
      counsellor: {
        fullName: session.counsellor.fullName
      }
    };

    res.status(200).json({ success: true, message: 'Booking request accepted.', data: formattedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting booking request', error: error.message });
  }
};



export const declineBookingRequest = async (req, res) => {
  try {
    const { id, declineReason } = req.body;
    if (!id || !declineReason) {
      return res.status(400).json({ success: false, message: 'Booking request id and reason for decline is required.' });
    }

    // Find the session and ensure it belongs to this counsellor, populate user and counsellor
    const session = await Session.findOne({ _id: id, counsellor: req.counsellor._id })
      .populate('user', 'email fullName')
      .populate('counsellor', 'fullName');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ success: false, message: "The requested booking request can't be rejected, status not pending" });
    }

    // Update session status to rejected and set rejection message
    session.status = 'rejected';
    session.rejectionMessage = declineReason;
    await session.save();

    // Format date and time for email (using UTC to match stored dateTime)
    const appointmentDate = session.dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
    const appointmentTime = session.dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });

    // Send email notification to user
    try {
      await sendAppointmentDeclineEmail(
        session.user.email,
        session.counsellor.fullName,
        appointmentDate,
        appointmentTime,
        declineReason
      );
    } catch (emailError) {
      console.error('Failed to send decline email notification:', emailError);
      // Note: Not failing the request due to email error to ensure booking rejection is not affected
    }

    // Format response with separated date and time
    const formattedSession = {
      ...session.toObject(),
      date: session.dateTime.toISOString().split('T')[0],
      time: session.dateTime.toISOString().split('T')[1].split('.')[0],
      user: {
        fullName: session.user.fullName,
        email: session.user.email
      },
      counsellor: {
        fullName: session.counsellor.fullName
      }
    };

    return res.status(200).json({ success: true, message: 'Booking request rejected.', data: formattedSession });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error declining booking request', error: err.message });
  }
};

export const getTotalStatistics = async (req, res) => {
  try {
    // Get counsellor ID
    const counsellorId = req.counsellor._id;
    console.log('Counsellor ID:', counsellorId);

    // Get counsellor details including chargePerHour
    const counsellor = await Counsellor.findById(counsellorId).select('chargePerHour');
    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Count completed sessions
    const completedSessions = await Session.countDocuments({
      counsellor: counsellorId,
      status: 'completed',
    });

    // Count pending session requests
    const pendingSessions = await Session.countDocuments({
      counsellor: counsellorId,
      status: 'pending',
    });

    // Count unique users for completed or accepted sessions
    const uniqueUsers = await Session.aggregate([
      {
        $match: {
          counsellor: new mongoose.Types.ObjectId(counsellorId),
          status: { $in: ['completed', 'accepted'] },
        },
      },
      {
        $group: {
          _id: '$user',
        },
      },
      {
        $count: 'totalClients',
      },
    ]);

    // Calculate total revenue (completed sessions with completed payment * chargePerHour)
    const completedPaidSessions = await Session.countDocuments({
      counsellor: counsellorId,
      paymentStatus: 'completed',
    });

    const totalRevenue = completedPaidSessions * counsellor.chargePerHour;

    // Extract totalClients from aggregation result (handle case where no users exist)
    const totalClients = uniqueUsers.length > 0 ? uniqueUsers[0].totalClients : 0;

    // Log results for debugging
    console.log('Completed Sessions Count:', completedSessions);
    console.log('Pending Sessions Count:', pendingSessions);
    console.log('Unique Users Count:', totalClients);
    console.log('Total Revenue:', totalRevenue);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        completedSessions,
        pendingSessions,
        totalRevenue,
        totalClients,
      },
    });
  } catch (error) {
    console.error('Error in getTotalStatistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching total statistics',
      error: error.message,
    });
  }
};

export const getCounsellorProfile = async (req, res) => {
  try {
    // Fetch counsellor profile using counsellor ID
    const counsellor = await Counsellor.findById(req.counsellor._id).select(
      'fullName email phone bio designation chargePerHour profilePhoto documents nmcNo qualification'
    );

    if (!counsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found' });
    }

    // Format the response using documents from Counsellor model
    const profileData = {
      fullName: counsellor.fullName,
      email: counsellor.email,
      phone: counsellor.phone,
      bio: counsellor.bio || '', // Default to empty string if bio is not set
      designation: counsellor.designation,
      chargePerHour: counsellor.chargePerHour,
      profilePhoto: counsellor.profilePhoto || null, // Default to null if not set
      documents: counsellor.documents || [], // Use documents from Counsellor model
      nmcNo: counsellor.nmcNo,
      qualification: counsellor.qualification
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching counsellor profile', error: error.message });
  }
};



export const editCounsellorProfile = async (req, res) => {
  try {
    // Extract fields from request body
    const { fullName, email, phone, bio, designation, chargePerHour } = req.body;

    // Check if email or phone is included in the request
    if (email || phone) {
      return res.status(400).json({
        success: false,
        message: 'You can not edit email and phone number, please contact admin'
      });
    }

    // Create an object with only the provided editable fields
    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (bio !== undefined) updates.bio = bio; // Allow empty string for bio
    if (designation) updates.designation = designation.trim();
    if (chargePerHour !== undefined) updates.chargePerHour = chargePerHour;

    // If no valid fields provided, return error
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'At least one editable field must be provided to update' });
    }

    // Validate chargePerHour if provided
    if (chargePerHour !== undefined && (isNaN(chargePerHour) || chargePerHour < 0)) {
      return res.status(400).json({ success: false, message: 'Charge per hour must be a non-negative number' });
    }

    // Update counsellor profile
    const updatedCounsellor = await Counsellor.findByIdAndUpdate(
      req.counsellor._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('fullName email phone bio designation chargePerHour profilePhoto documents');

    if (!updatedCounsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found' });
    }

    // Format the response
    const profileData = {
      fullName: updatedCounsellor.fullName,
      email: updatedCounsellor.email,
      phone: updatedCounsellor.phone,
      bio: updatedCounsellor.bio || '',
      designation: updatedCounsellor.designation,
      chargePerHour: updatedCounsellor.chargePerHour,
      profilePhoto: updatedCounsellor.profilePhoto || null,
      documents: updatedCounsellor.documents || []
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating counsellor profile', error: error.message });
  }
};


//Get availability for authenticated counsellor

export const getCounsellorAvailability = async (req, res) => {
  try {
    // Fetch counsellor availability using counsellor ID
    const counsellor = await Counsellor.findById(req.counsellor._id).select('availability');

    if (!counsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found' });
    }

    // Format the response
    const availabilityData = counsellor.availability || [];

    res.status(200).json({
      success: true,
      data: availabilityData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching counsellor availability', error: error.message });
  }
};


// Get session history of authenticated counsellor
export const getSessionHistory = async (req, res) => {
  try {
    // Fetch sessions for the counsellor with status "completed" and "no-show"
    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: { $in: ['completed', 'no-show'] }
    })
      .populate('user', 'fullName') // Populate user field with fullName
      .select('_id user counsellor dateTime noteTitle noteDescription status rejectionMessage paymentStatus rating feedback complaint');

    // Format the response with separate date and time
    const sessionHistory = sessions.map(session => {
      const isoDateTime = session.dateTime.toISOString();
      return {
        _id: session._id,
        user: {
          fullName: session.user ? session.user.fullName : 'Unknown'
        },
        date: isoDateTime.split('T')[0],         // yyyy-mm-dd
        time: isoDateTime.split('T')[1].split('.')[0], // hh:mm:ss
        noteTitle: session.noteTitle,
        noteDescription: session.noteDescription,
        status: session.status,
        rejectionMessage: session.rejectionMessage || null,
        paymentStatus: session.paymentStatus,
        rating: session.rating || null,
        feedback: session.feedback || null,
        complaint: session.complaint || { message: null, submitted: false }
      };
    });

    res.status(200).json({
      success: true,
      data: sessionHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching session history', error: error.message });
  }
};


export const getPdfReport = async (req, res) => {
  let doc = null;
  
  try {
    const counsellorId = req.counsellor._id;
    const { sessionId } = req.body;

    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    // Fetch session and verify counsellor
    const session = await Session.findById(sessionId).populate('user');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
    if (session.counsellor.toString() !== counsellorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Session does not belong to this counsellor',
      });
    }

    const user = session.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Define date range (past 30 days)
    const endDate = DateTime.now();
    const startDate = endDate.minus({ days: 30 });

    // Fetch sleep logs
    const sleepLogs = await SleepLog.find({
      user: user._id,
      timestamp: {
        $gte: startDate.toJSDate(),
        $lte: endDate.toJSDate(),
      },
    }).select('hoursSlept quality timestamp');

    // Fetch journal entries (only shared ones)
    const journalEntries = await JournalEntry.find({
      user: user._id,
      timestamp: {
        $gte: startDate.toJSDate(),
        $lte: endDate.toJSDate(),
      },
      shareStatus: true,
    }).select('explicitEmotion predictedEmotion timestamp');

    // Create date range and filter days with data
    const dateRange = [];
    for (let i = 0; i < 30; i++) {
      const date = endDate.minus({ days: i });
      dateRange.push({
        date: date.toFormat('MM/dd/yyyy'),
        day: date.weekdayLong,
      });
    }
    dateRange.reverse(); // Chronological order

    // Map data to dates
    const sleepLogMap = new Map(
      sleepLogs.map(log => [
        DateTime.fromJSDate(log.timestamp).toFormat('MM/dd/yyyy'),
        { 
          hoursSlept: log.hoursSlept && !isNaN(log.hoursSlept) ? Number(log.hoursSlept) : 0, 
          quality: log.quality || 'N/A' 
        },
      ])
    );
    const journalMap = new Map(
      journalEntries.map(entry => [
        DateTime.fromJSDate(entry.timestamp).toFormat('MM/dd/yyyy'),
        { 
          explicitEmotion: entry.explicitEmotion || 'N/A', 
          predictedEmotion: entry.predictedEmotion || 'N/A' 
        },
      ])
    );

    // Filter date range for sleep and mood data
    const sleepDateRange = dateRange.filter(({ date }) => sleepLogMap.has(date));
    const moodDateRange = dateRange.filter(({ date }) => journalMap.has(date));

    // Calculate sleep summary
    let totalHours = 0;
    let sleepCount = 0;
    const qualityCounts = { Poor: 0, Fair: 0, Good: 0, Excellent: 0 };
    sleepLogs.forEach(log => {
      if (log.hoursSlept && !isNaN(log.hoursSlept)) {
        totalHours += Number(log.hoursSlept);
        sleepCount++;
      }
      if (log.quality && qualityCounts.hasOwnProperty(log.quality)) {
        qualityCounts[log.quality]++;
      }
    });
    const avgHours = sleepCount > 0 ? (totalHours / sleepCount).toFixed(2) : 'N/A';
    const mostCommonQuality = Object.entries(qualityCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['N/A', 0]
    )[0];

    // Calculate mood summary
    const explicitCounts = { Bad: 0, Low: 0, Neutral: 0, Good: 0, Great: 0 };
    const predictedCounts = { sadness: 0, joy: 0, love: 0, anger: 0, fear: 0, surprise: 0 };
    journalEntries.forEach(entry => {
      if (entry.explicitEmotion && explicitCounts.hasOwnProperty(entry.explicitEmotion)) {
        explicitCounts[entry.explicitEmotion]++;
      }
      if (entry.predictedEmotion && predictedCounts.hasOwnProperty(entry.predictedEmotion)) {
        predictedCounts[entry.predictedEmotion]++;
      }
    });
    const mostCommonExplicit = Object.entries(explicitCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['N/A', 0]
    )[0];
    const mostCommonPredicted = Object.entries(predictedCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['N/A', 0]
    )[0];

    // Initialize PDF document
    doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Generate unique filename with user's full name and timestamp
    const timestamp = DateTime.now().toFormat('yyyyMMdd-HHmmss');
    const sanitizedName = user.fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedName}_${timestamp}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Define layout constants
    const pageWidth = 495; // A4 width (595) minus margins (50 each side)
    const pageHeight = 742; // A4 height (842) minus margins (50 each side)
    const centerX = 297.5; // Center of page (595/2)
    
    // Table constants
    const tableWidth = 400;
    const tableLeft = (595 - tableWidth) / 2; // Center the table
    const colWidths = [80, 100, 80, 80, 60]; // Adjusted for better spacing
    const rowHeight = 20;
    
    // Chart constants
    const chartWidth = 350;
    const chartHeight = 120;
    const chartLeft = (595 - chartWidth) / 2; // Center the charts
    const maxHours = 12;
    
    let yPosition = 70; // Starting y position

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight) {
        doc.addPage();
        yPosition = 70; // Reset position for new page
      }
    };

    // Helper function for section divider
    const addSectionDivider = () => {
      yPosition += 20;
      doc.lineWidth(0.5)
         .moveTo(70, yPosition)
         .lineTo(525, yPosition)
         .strokeColor('#e0e0e0')
         .stroke();
      yPosition += 30;
    };

    // === HEADER SECTION ===
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .fillColor('#2c3e50')
       .text('Sahara: User Sleep and Mood Report', { align: 'center' });
    
    yPosition += 35;
    
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor('#34495e')
       .text(`Prepared for: ${user.fullName}`, { align: 'center' });
    
    yPosition += 20;
    
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text(`Date Range: ${startDate.toFormat('MMMM d, yyyy')} - ${endDate.toFormat('MMMM d, yyyy')}`, { align: 'center' });
    
    yPosition += 25;
    
    // Main header divider
    doc.lineWidth(1)
       .moveTo(50, yPosition)
       .lineTo(545, yPosition)
       .strokeColor('#3498db')
       .stroke();
    
    yPosition += 40;

    // === SLEEP LOG SECTION ===
    checkNewPage(200); // Ensure we have space for sleep section
    
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor('#2c3e50')
       .text('Sleep Log Summary (Past 30 Days)', 50, yPosition);
    
    yPosition += 25;

    if (sleepLogs.length > 0) {
      // Description
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#555')
         .text('The following table shows the user\'s sleep logs for days with recorded data.', 
               50, yPosition, { width: pageWidth, align: 'justify' });
      
      yPosition += 30;

      // Sleep Table
      checkNewPage(sleepDateRange.length * rowHeight + 80);
      
      const tableTop = yPosition;
      
      // Table border
      doc.rect(tableLeft, tableTop, tableWidth, (sleepDateRange.length + 1) * rowHeight)
         .strokeColor('#ddd')
         .stroke();

      // Table headers
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor('#2c3e50');
      
      let headerX = tableLeft + 10;
      doc.text('Date', headerX, tableTop + 8);
      headerX += colWidths[0];
      doc.text('Day', headerX, tableTop + 8);
      headerX += colWidths[1];
      doc.text('Hours Slept', headerX, tableTop + 8);
      headerX += colWidths[2];
      doc.text('Quality', headerX, tableTop + 8);

      // Header line
      doc.lineWidth(0.5)
         .moveTo(tableLeft, tableTop + rowHeight)
         .lineTo(tableLeft + tableWidth, tableTop + rowHeight)
         .strokeColor('#ccc')
         .stroke();

      // Table data
      doc.font('Helvetica').fontSize(9).fillColor('#333');
      
      sleepDateRange.forEach(({ date, day }, index) => {
        const sleep = sleepLogMap.get(date);
        const rowY = tableTop + (index + 1) * rowHeight + 8;
        
        let dataX = tableLeft + 10;
        doc.text(date, dataX, rowY);
        dataX += colWidths[0];
        doc.text(day, dataX, rowY);
        dataX += colWidths[1];
        doc.text(sleep.hoursSlept.toString(), dataX, rowY);
        dataX += colWidths[2];
        doc.text(sleep.quality, dataX, rowY);
      });

      yPosition = tableTop + (sleepDateRange.length + 1) * rowHeight + 25;

      // Sleep Summary
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor('#2c3e50')
         .text('Summary:', 50, yPosition);
      
      yPosition += 20;
      
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#555')
         .text(`Average Hours Slept: ${avgHours} hours`, 70, yPosition);
      
      yPosition += 15;
      
      doc.text(`Most Common Sleep Quality: ${mostCommonQuality}`, 70, yPosition);
      
      yPosition += 30;

      // Sleep Bar Chart with Quality
      checkNewPage(chartHeight + 60);
      
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#2c3e50')
         .text('Sleep Hours and Quality Chart (All 30 Days)', 50, yPosition);
      
      yPosition += 30;

      // Chart background
      doc.rect(chartLeft, yPosition, chartWidth, chartHeight)
         .strokeColor('#ddd')
         .stroke();

      // Y-axis labels and grid lines
      for (let i = 0; i <= maxHours; i += 2) {
        const gridY = yPosition + chartHeight - (i / maxHours) * (chartHeight - 20);
        
        // Grid line
        doc.lineWidth(0.2)
           .moveTo(chartLeft, gridY)
           .lineTo(chartLeft + chartWidth, gridY)
           .strokeColor('#f0f0f0')
           .stroke();
        
        // Y-axis label
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#666')
           .text(`${i}h`, chartLeft - 25, gridY - 4, { align: 'right' });
      }

      // Define quality colors
      const qualityColors = {
        'Poor': '#e74c3c',
        'Fair': '#f39c12', 
        'Good': '#2ecc71',
        'Excellent': '#27ae60',
        'N/A': '#e0e0e0'
      };

      // Bars for all 30 days
      const barWidth = Math.floor(chartWidth / 30) - 2;
      const barSpacing = chartWidth / 30;
      
      dateRange.forEach(({ date }, index) => {
        const sleep = sleepLogMap.get(date);
        const barX = chartLeft + index * barSpacing + (barSpacing - barWidth) / 2;
        
        if (sleep && sleep.hoursSlept > 0) {
          // Has data - show actual bar with quality color
          const barHeight = Math.max((sleep.hoursSlept / maxHours) * (chartHeight - 20), 1);
          const barY = yPosition + chartHeight - barHeight - 10;
          
          doc.rect(barX, barY, barWidth, barHeight)
             .fillColor(qualityColors[sleep.quality] || qualityColors['N/A'])
             .fill();
        } else {
          // No data - show gray placeholder
          const placeholderHeight = 3;
          const placeholderY = yPosition + chartHeight - placeholderHeight - 10;
          
          doc.rect(barX, placeholderY, barWidth, placeholderHeight)
             .fillColor('#e0e0e0')
             .fill();
        }
        
        // X-axis label - show every 5th day to avoid overcrowding
        if ((index + 1) % 5 === 0 || index === 0 || index === 29) {
          doc.font('Helvetica')
             .fontSize(6)
             .fillColor('#666')
             .text(`${index + 1}`, chartLeft + index * barSpacing + barSpacing/2, yPosition + chartHeight + 5, { 
               align: 'center',
               width: barSpacing
             });
        }
      });

      yPosition += chartHeight + 20;

      // Sleep Quality Legend
      doc.font('Helvetica-Bold')
         .fontSize(9)
         .fillColor('#2c3e50')
         .text('Sleep Quality Legend:', chartLeft, yPosition);
      
      yPosition += 15;
      
      const legendItems = [
        { quality: 'Excellent', color: '#27ae60' },
        { quality: 'Good', color: '#2ecc71' },
        { quality: 'Fair', color: '#f39c12' },
        { quality: 'Poor', color: '#e74c3c' }
      ];
      
      legendItems.forEach((item, index) => {
        const legendX = chartLeft + (index * 80);
        
        // Color box
        doc.rect(legendX, yPosition, 12, 8)
           .fillColor(item.color)
           .fill();
        
        // Label
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#666')
           .text(item.quality, legendX + 16, yPosition + 2);
      });

      yPosition += 25;

    } else {
      doc.font('Helvetica')
         .fontSize(11)
         .fillColor('#999')
         .text('No sleep log data available for the past 30 days.', { align: 'center' });
      yPosition += 30;
    }

    addSectionDivider();

    // === MOOD HISTORY SECTION ===
    checkNewPage(200);
    
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor('#2c3e50')
       .text('Mood History (Past 30 Days)', 50, yPosition);
    
    yPosition += 25;

    if (journalEntries.length > 0) {
      // Description
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#555')
         .text('The following table shows the user\'s self-reported and AI-predicted emotions for days with shared journal entries.', 
               50, yPosition, { width: pageWidth, align: 'justify' });
      
      yPosition += 30;

      // Mood Table
      checkNewPage(moodDateRange.length * rowHeight + 80);
      
      const moodTableTop = yPosition;
      
      // Table border
      doc.rect(tableLeft, moodTableTop, tableWidth, (moodDateRange.length + 1) * rowHeight)
         .strokeColor('#ddd')
         .stroke();

      // Table headers
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor('#2c3e50');
      
      let headerX = tableLeft + 10;
      doc.text('Date', headerX, moodTableTop + 8);
      headerX += colWidths[0];
      doc.text('Day', headerX, moodTableTop + 8);
      headerX += colWidths[1];
      doc.text('Explicit Emotion', headerX, moodTableTop + 8);
      headerX += colWidths[2];
      doc.text('Predicted Emotion', headerX, moodTableTop + 8);

      // Header line
      doc.lineWidth(0.5)
         .moveTo(tableLeft, moodTableTop + rowHeight)
         .lineTo(tableLeft + tableWidth, moodTableTop + rowHeight)
         .strokeColor('#ccc')
         .stroke();

      // Table data
      doc.font('Helvetica').fontSize(9).fillColor('#333');
      
      moodDateRange.forEach(({ date, day }, index) => {
        const mood = journalMap.get(date);
        const rowY = moodTableTop + (index + 1) * rowHeight + 8;
        
        let dataX = tableLeft + 10;
        doc.text(date, dataX, rowY);
        dataX += colWidths[0];
        doc.text(day, dataX, rowY);
        dataX += colWidths[1];
        doc.text(mood.explicitEmotion, dataX, rowY);
        dataX += colWidths[2];
        doc.text(mood.predictedEmotion, dataX, rowY);
      });

      yPosition = moodTableTop + (moodDateRange.length + 1) * rowHeight + 25;

      // Mood Summary
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor('#2c3e50')
         .text('Summary:', 50, yPosition);
      
      yPosition += 20;
      
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#555')
         .text(`Most Common Explicit Emotion: ${mostCommonExplicit}`, 70, yPosition);
      
      yPosition += 15;
      
      doc.text(`Most Common Predicted Emotion: ${mostCommonPredicted}`, 70, yPosition);
      
      yPosition += 30;

      // Helper function to create mood chart with fixed alignment
      const createMoodChart = (title, counts, yPos, isExplicit = true) => {
        // Title with proper left alignment and spacing
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor('#2c3e50')
           .text(title, 50, yPos);
        
        yPos += 30; // Proper vertical gap

        // Chart background
        doc.rect(chartLeft, yPos, chartWidth, chartHeight)
           .strokeColor('#ddd')
           .stroke();

        const maxCount = Math.max(...Object.values(counts), 1);
        
        // Define emotions and colors based on chart type
        let emotions, colors;
        if (isExplicit) {
          emotions = ['Bad', 'Low', 'Neutral', 'Good', 'Great'];
          colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
        } else {
          emotions = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise'];
          colors = ['#3498db', '#f1c40f', '#e91e63', '#e74c3c', '#9b59b6', '#ff9800'];
        }

        // Y-axis labels and grid lines
        const maxGridLines = Math.min(maxCount, 10);
        const gridStep = Math.max(Math.ceil(maxCount / maxGridLines), 1);
        
        for (let i = 0; i <= maxCount; i += gridStep) {
          if (i === 0 || i === maxCount || i % gridStep === 0) {
            const gridY = yPos + chartHeight - (i / maxCount) * (chartHeight - 20);
            
            // Grid line
            doc.lineWidth(0.2)
               .moveTo(chartLeft, gridY)
               .lineTo(chartLeft + chartWidth, gridY)
               .strokeColor('#f0f0f0')
               .stroke();
            
            // Y-axis label
            doc.font('Helvetica')
               .fontSize(8)
               .fillColor('#666')
               .text(`${i}`, chartLeft - 25, gridY - 4, { align: 'right' });
          }
        }

        // Calculate bar dimensions for perfect centering
        const barWidth = isExplicit ? 50 : 45; // Slightly smaller bars for 6 emotions
        const totalBarsWidth = emotions.length * barWidth;
        const totalSpacing = chartWidth - totalBarsWidth;
        const sideMargin = totalSpacing / 2;
        const barSpacing = totalBarsWidth / emotions.length;
        
        emotions.forEach((emotion, index) => {
          const count = counts[emotion] || 0;
          const barHeight = maxCount > 0 ? Math.max((count / maxCount) * (chartHeight - 20), 0) : 0;
          
          // Calculate exact center position for each bar
          const barCenterX = chartLeft + sideMargin + (index * barSpacing) + (barSpacing / 2);
          const barX = barCenterX - (barWidth / 2);
          const barY = yPos + chartHeight - barHeight - 10;
          
          // Only draw bar if count > 0
          if (count > 0 && barHeight > 0) {
            doc.rect(barX, barY, barWidth, barHeight)
               .fillColor(colors[index])
               .fill();
            
            // Count label on top of bar - centered
            doc.font('Helvetica-Bold')
               .fontSize(9)
               .fillColor('#333')
               .text(`${count}`, barCenterX, barY - 15, { 
                 align: 'center',
                 width: 0
               });
          }
          
          // X-axis label - perfectly centered under each bar
          // Capitalize first letter for better presentation
          const displayEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
          doc.font('Helvetica')
             .fontSize(8)
             .fillColor('#666')
             .text(displayEmotion, barCenterX, yPos + chartHeight + 5, { 
               align: 'center',
               width: 0
             });
        });

        return yPos + chartHeight + 50; // Increased bottom spacing
      };

      // User-Reported Emotion Chart
      checkNewPage(chartHeight + 100);
      yPosition = createMoodChart('User-Reported Emotion Distribution', explicitCounts, yPosition, true);

      // AI-Predicted Emotion Chart  
      checkNewPage(chartHeight + 100);
      yPosition = createMoodChart('AI-Predicted Emotion Distribution', predictedCounts, yPosition, false);

      yPosition -= 10; // Adjust spacing after charts

    } else {
      doc.font('Helvetica')
         .fontSize(11)
         .fillColor('#999')
         .text('No shared mood data available for the past 30 days.', { align: 'center' });
      yPosition += 30;
    }

    // === FOOTER ===
    // Calculate footer position
    const footerY = pageHeight + 20; // Bottom of page
    
    doc.lineWidth(0.5)
       .moveTo(50, footerY)
       .lineTo(545, footerY)
       .strokeColor('#ccc')
       .stroke();
    
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#666')
       .text(`Generated on: ${DateTime.now().toFormat('hh:mm a ZZZZ, dddd, MMMM d, yyyy')}`, 
             { align: 'center', y: footerY + 10 });

    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error in getPdfReport:', error.message);
    
    // Clean up PDF document if it exists
    if (doc) {
      try {
        doc.destroy();
      } catch (destroyError) {
        console.error('Error destroying PDF document:', destroyError.message);
      }
    }
    
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error generating PDF report',
        error: error.message,
      });
    }
  }
};