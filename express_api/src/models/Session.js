import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counsellor',
    required: [true, 'Counsellor reference is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  noteTitle: {
    type: String,
    required: [true, 'Counsellor note title is required']
  },
  noteDescription: {
    type: String,
    required: [true, 'Counsellor note description is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'no-show'],
    default: 'pending'
  },
  rejectionMessage: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  complaint: {
    message: String,
    submitted: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });  

const Session = mongoose.model('Session', sessionSchema);

export default Session;
