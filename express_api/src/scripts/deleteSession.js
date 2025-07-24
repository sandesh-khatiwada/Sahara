import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Session from '../models/Session.js'; // Adjust path as needed

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://khatiwadasandesh01:aHMQIqc3X9b1LVYW@cluster0.xwcq4o0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Delete sessions with status "pending" or missing noteTitle/noteDescription
const deleteSessions = async () => {
  try {
    // Delete sessions matching the criteria
    const result = await Session.deleteMany({
      $or: [
        { status: 'pending' },
        { noteTitle: { $in: [null, '', undefined] } },
        { noteDescription: { $in: [null, '', undefined] } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} sessions with status "pending" or missing noteTitle/noteDescription`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting sessions:', error);
    process.exit(1);
  }
};

deleteSessions();