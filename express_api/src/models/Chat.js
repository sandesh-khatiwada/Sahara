import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: [true, 'Prompt is required']
  },
  aiResponse: {
    type: String,
    required: [true, 'AI response is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 