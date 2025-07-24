import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SleepLog from '../models/SleepLog.js'; // Adjust path as needed

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://khatiwadasandesh01:aHMQIqc3X9b1LVYW@cluster0.xwcq4o0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Delete sleep logs for yesterday and today
const deleteSleepLogs = async () => {
  try {
    // Calculate date range
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Start of yesterday
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow (exclusive)

    // Delete sleep logs within the date range
    const result = await SleepLog.deleteMany({
      timestamp: {
        $gte: yesterday, // From start of yesterday
        $lt: tomorrow    // Up to (but not including) start of tomorrow
      }
    });

    console.log(`Deleted ${result.deletedCount} sleep logs from yesterday and today`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting sleep logs:', error);
    process.exit(1);
  }
};

deleteSleepLogs();