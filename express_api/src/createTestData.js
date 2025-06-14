import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import all models
import User from '../models/User.js';
import Counsellor from '../models/Counsellor.js';
import JournalEntry from '../models/JournalEntry.js';
import SleepLog from '../models/SleepLog.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import Document from '../models/Document.js';
import Admin from '../models/Admin.js';
import Chat from '../models/Chat.js';
import OTP from '../models/OTP.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Create test data
const createTestData = async () => {
  try {
    // Create Admin
    const admin = await Admin.create({
      email: 'admin@sahara.com',
      password: await hashPassword('admin123')
    });
    console.log('Admin created');

    // Create User
    const user = await User.create({
      fullName: 'Test User',
      email: 'user@test.com',
      password: await hashPassword('user123')
    });
    console.log('User created');

    // Create Counsellor
    const counsellor = await Counsellor.create({
      fullName: 'Dr. Test Counsellor',
      email: 'counsellor@test.com',
      password: await hashPassword('counsellor123'),
      chargePerHour: 1000,
      eSewaAccountId: 'TEST123'
    });
    console.log('Counsellor created');

    // Create Document for Counsellor
    const document = await Document.create({
      counsellor: counsellor._id,
      fileName: 'test_certificate.pdf',
      fileType: 'PDF',
      fileUrl: 'https://example.com/test_certificate.pdf'
    });
    console.log('Document created');

    // Create Journal Entry
    const journalEntry = await JournalEntry.create({
      user: user._id,
      content: 'This is a test journal entry',
      explicitEmotion: 'Happy',
      emotionalTone: 'Positive',
      confidenceScore: 0.85,
      shareStatus: false
    });
    console.log('Journal Entry created');

    // Create Sleep Log
    const sleepLog = await SleepLog.create({
      user: user._id,
      hoursSlept: 7.5,
      quality: 'Good'
    });
    console.log('Sleep Log created');

    // Create Session
    const session = await Session.create({
      user: user._id,
      counsellor: counsellor._id,
      dateTime: new Date(),
      status: 'pending',
      paymentStatus: 'pending'
    });
    console.log('Session created');

    // Create Payment
    const payment = await Payment.create({
      session: session._id,
      user: user._id,
      counsellor: counsellor._id,
      amount: 1000,
      status: 'pending'
    });
    console.log('Payment created');

    // Create Notification
    const notification = await Notification.create({
      recipient: user._id,
      recipientModel: 'User',
      message: 'Your session has been scheduled',
      type: 'booking_accepted'
    });
    console.log('Notification created');

    // Create Chat
    const chat = await Chat.create({
      user: user._id,
      title: 'Test Chat',
      messages: [{
        prompt: 'How are you feeling today?',
        aiResponse: 'I understand you might be feeling down. Would you like to talk about it?'
      }]
    });
    console.log('Chat created');

    // Create OTP
    const otp = await OTP.create({
      user: user._id,
      otp: 123456,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });
    console.log('OTP created');

    // Update User with references
    await User.findByIdAndUpdate(user._id, {
      $push: {
        journalEntries: journalEntry._id,
        sleepLogs: sleepLog._id,
        sessions: session._id,
        notifications: notification._id,
        chats: chat._id
      }
    });

    // Update Counsellor with references
    await Counsellor.findByIdAndUpdate(counsellor._id, {
      $push: {
        documents: document._id,
        sessions: session._id
      }
    });

    console.log('All test data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
};

// Run the script
createTestData();