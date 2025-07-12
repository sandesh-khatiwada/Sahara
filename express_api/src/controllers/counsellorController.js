import Counsellor from '../models/Counsellor.js';
import Session from '../models/Session.js';

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

// Get all pending booking requests for the authenticated counsellor
export const getBookingRequests = async (req, res) => {
  try {
    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: 'pending'
    }).sort({ dateTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking requests', error: error.message });
  }
};

// Get all accepted bookings for the authenticated counsellor
export const getAcceptedBookings = async (req, res) => {
  try {
    const sessions = await Session.find({
      counsellor: req.counsellor._id,
      status: 'accepted'
    }).sort({ dateTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching accepted bookings', error: error.message });
  }
};

// Accept a booking request by id
export const acceptBookingRequest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Booking request id is required.' });
    }
    // Find the session and ensure it belongs to this counsellor
    const session = await Session.findOne({ _id: id, counsellor: req.counsellor._id });
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
    session.status = 'accepted';
    await session.save();
    res.status(200).json({ success: true, message: 'Booking request accepted.', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting booking request', error: error.message });
  }
}; 