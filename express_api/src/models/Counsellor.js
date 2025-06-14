import mongoose from 'mongoose';

const counsellorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  chargePerHour: {
    type: Number,
    required: [true, 'Charge per hour is required']
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  eSewaAccountId: String,
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Counsellor = mongoose.model('Counsellor', counsellorSchema);

export default Counsellor; 