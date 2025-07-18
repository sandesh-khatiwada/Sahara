import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters long']
  },
  content: {
    type: String,
    required: [true, 'Journal entry cannot be empty']
  },
  explicitEmotion: {
    type: String,
    required: [true, 'Please share your mood for today']
  },
  emotionalTone: {
    type: {
      max_confidence: {
        type: Number,
        required: true
      },
      predictions: [{
        confidence: {
          type: Number,
          required: true
        },
        emotion: {
          type: String,
          required: true
        }
      }],
      text: {
        type: String,
        required: true
      }
    },
    required: false // Set to false if emotionalTone is optional
  },

  predictedEmotion:String,
  
  confidenceScore: Number,
  timestamp: {
    type: Date,
    default: Date.now
  },
  shareStatus: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;