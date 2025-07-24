import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User.js'; // Adjust path as needed
import Counsellor from '../models/Counsellor.js'; // Adjust path as needed
import JournalEntry from '../models/JournalEntry.js'; // Adjust path as needed
import SleepLog from '../models/SleepLog.js'; // Adjust path as needed
import Session from '../models/Session.js'; // Adjust path as needed
import Notification from '../models/Notification.js'; // Adjust path as needed
import Chat from '../models/Chat.js'; // Adjust path as needed

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Function to delete User or Counsellor by email
const deleteByEmail = async () => {
  try {
    // Prompt for email
    const email = await new Promise(resolve => {
      rl.question('Enter the email address to delete (User or Counsellor): ', resolve);
    });

    if (!isValidEmail(email)) {
      console.error('Invalid email format');
      rl.close();
      process.exit(1);
    }

    // Initialize deletion counts
    let deletedUsers = 0;
    let deletedCounsellors = 0;
    let deletedJournalEntries = 0;
    let deletedSleepLogs = 0;
    let deletedSessions = 0;
    let deletedNotifications = 0;
    let deletedChats = 0;

    // Delete User by email
    const user = await User.findOne({ email });
    if (user) {
      // Delete referenced documents
      deletedJournalEntries = (await JournalEntry.deleteMany({ _id: { $in: user.journalEntries } })).deletedCount;
      deletedSleepLogs = (await SleepLog.deleteMany({ _id: { $in: user.sleepLogs } })).deletedCount;
      deletedSessions = (await Session.deleteMany({ _id: { $in: user.sessions } })).deletedCount;
      deletedNotifications = (await Notification.deleteMany({ _id: { $in: user.notifications } })).deletedCount;
      deletedChats = (await Chat.deleteMany({ _id: { $in: user.chats } })).deletedCount;

      // Delete the User
      await User.deleteOne({ _id: user._id });
      deletedUsers = 1;
      console.log(`Deleted User: ${email}`);
    }

    // Delete Counsellor by email
    const counsellor = await Counsellor.findOne({ email });
    if (counsellor) {
      // Delete referenced documents
      deletedSessions += (await Session.deleteMany({ _id: { $in: counsellor.sessions } })).deletedCount;
      deletedNotifications += (await Notification.deleteMany({ _id: { $in: counsellor.notifications } })).deletedCount;

      // Delete the Counsellor
      await Counsellor.deleteOne({ _id: counsellor._id });
      deletedCounsellors = 1;
      console.log(`Deleted Counsellor: ${email}`);
    }

    // Log results
    if (deletedUsers === 0 && deletedCounsellors === 0) {
      console.log(`No User or Counsellor found with email: ${email}`);
    } else {
      console.log(`Summary:
        - Deleted ${deletedUsers} User(s)
        - Deleted ${deletedCounsellors} Counsellor(s)
        - Deleted ${deletedJournalEntries} JournalEntry(s)
        - Deleted ${deletedSleepLogs} SleepLog(s)
        - Deleted ${deletedSessions} Session(s)
        - Deleted ${deletedNotifications} Notification(s)
        - Deleted ${deletedChats} Chat(s)`);
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error deleting User or Counsellor:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the deletion function
deleteByEmail();