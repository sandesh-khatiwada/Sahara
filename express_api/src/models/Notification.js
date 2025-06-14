import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient reference is required'],
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: [true, 'Recipient model is required'],
    enum: ['User', 'Counsellor']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['booking_accepted', 'booking_rejected', 'payment_received', 'approval_status']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 