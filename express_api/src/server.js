import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import counsellorRoutes from "./routes/counsellorRoutes.js";
import Session from './models/Session.js';
import cron from 'node-cron'; 

import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/counsellors', counsellorRoutes); 

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sahara API' });
});

// Schedule session status updates
const updateCompletedSessions = async () => {
  try {
    const now = new Date();
    console.log(`Running session status update at ${now}`);
    
    // Find all accepted sessions that have passed their dateTime
    const sessionsToUpdate = await Session.find({
      status: 'accepted',
      dateTime: { $lte: now }
    });

    let completedCount = 0;
    let noShowCount = 0;

    // Process each session individually to handle different conditions
    for (const session of sessionsToUpdate) {
      // Check if userJoinStatus exists and is false
    if (session.userJoinStatus === true) {
        session.status = 'completed';
        completedCount++;
        } else {
    session.status = 'no-show';
      noShowCount++;
}

      await session.save();
    }

    console.log(`Updated ${completedCount} sessions to completed status`);
    console.log(`Marked ${noShowCount} sessions as no-show`);

  } catch (error) {
    console.error('Error updating session statuses:', error);
  }
};

// Schedule the task to run every 1 minutes
cron.schedule('*/1 * * * *', updateCompletedSessions);

// Initial run when server starts
updateCompletedSessions();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port 5000'));