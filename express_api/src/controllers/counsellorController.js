import Counsellor from '../models/Counsellor.js';
import Session from '../models/Session.js';
import {sendAppointmentAcceptanceEmail, sendAppointmentDeclineEmail} from "../utils/emailConfig.js";
import mongoose from 'mongoose';
import moment from 'moment-timezone';
import Document from '../models/Document.js';



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


//Get booking request for authenticated counsellor
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

    // Transform the response to separate date and time, and format createdAt, updatedAt
    const formattedSessions = sessions.map(session => ({
      ...session,
      createdAt: moment(session.createdAt).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(session.updatedAt).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
      user: {
        fullName: session.user.fullName,
        email: session.user.email
      }
    }));

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



export const getDailyStatistics = async (req, res) => {
  try {
    const timezone = 'Asia/Kathmandu';
    const today = moment().tz(timezone);

    const startOfDayNepal = today.clone().startOf('day');
    const endOfDayNepal = today.clone().endOf('day');

    const startOfDayUTC = startOfDayNepal.clone().utc().toDate();
    const endOfDayUTC = endOfDayNepal.clone().utc().toDate();

    console.log('Querying sessions between:', startOfDayUTC.toISOString(), 'and', endOfDayUTC.toISOString());
    console.log('Counsellor ID:', req.counsellor._id);

    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      dateTime: {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC
      },
      status: { $in: ['accepted', 'pending'] }
    });

    console.log('Sessions matched:', sessions);

    const acceptedCount = sessions.filter(session => session.status === 'accepted').length;
    const pendingCount = sessions.filter(session => session.status === 'pending').length;

    res.status(200).json({
      success: true,
      data: {
        numberOfSessions: acceptedCount,
        newRequests: pendingCount,
        date: today.format('YYYY-MM-DD')
      }
    });
  } catch (error) {
    console.error('Error in getDailyStatistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily statistics',
      error: error.message
    });
  }
};


export const getCounsellorProfile = async (req, res) => {
  try {
    // Fetch counsellor profile using counsellor ID
    const counsellor = await Counsellor.findById(req.counsellor._id).select(
      'fullName email phone bio designation chargePerHour profilePhoto documents'
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
      documents: counsellor.documents || [] // Use documents from Counsellor model
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


//Get session history of authenticated counsellor
export const getSessionHistory = async (req, res) => {
  try {
    // Fetch sessions for the counsellor with status "completed" and "no-show"

    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: { $in: ['completed', 'no-show'] } 
    })
      .populate('user', 'fullName') // Populate user field with fullName
      .select('_id user counsellor dateTime noteTitle noteDescription status rejectionMessage paymentStatus rating feedback complaint');

    // Format the response
    const sessionHistory = sessions.map(session => ({
      _id: session._id,
      user: {
        fullName: session.user ? session.user.fullName : 'Unknown' // Fallback if user is missing
      },
      dateTime: session.dateTime,
      noteTitle: session.noteTitle,
      noteDescription: session.noteDescription,
      status: session.status,
      rejectionMessage: session.rejectionMessage || null,
      paymentStatus: session.paymentStatus,
      rating: session.rating || null,
      feedback: session.feedback || null,
      complaint: session.complaint || { message: null, submitted: false }
    }));

    res.status(200).json({
      success: true,
      data: sessionHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching session history', error: error.message });
  }
};

