import mongoose from 'mongoose';

const sleepLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  hoursSlept: {
    type: Number,
    required: [true, 'Hours slept is required']
  },
  quality: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Excellent'],
    required: [true, 'Sleep quality is required']
  },
  timestamp: {
    type: Date,
    default: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
  }
});

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);

export default SleepLog;