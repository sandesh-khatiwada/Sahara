import JournalEntry from '../models/JournalEntry.js';
import Counsellor from '../models/Counsellor.js';

// Add journal entry
export const addJournal = async (req, res) => {
  try {
    const { title, explicitEmotion, content, shareStatus } = req.body;

    console.log("Title:", title);
    console.log("Explicit Emotion:", explicitEmotion);
    console.log("Content:", content);   
    console.log("Share Status:", shareStatus);

    // Validation
    if (!title || !explicitEmotion || !content || shareStatus === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate title length
    if (title.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long'
      });
    }

    // Check if user has already created a journal entry today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to start of next day

    const existingEntry = await JournalEntry.findOne({
      user: req.user._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // To be uncommented later 
    // if (existingEntry) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You have already recorded your journal entry for today, See you tomorrow'
    //   });
    // }

    //Get AI Prediction


    // Make API call to Flask API
    const response = await fetch('http://localhost:8000/api/predict', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content, // Pass the journal content for prediction
      }),
    }); 

    console.log("Response from AI API:", response);

    if (!response.ok) {
      console.log("Could not fetch data from AI API");
    }
    
    const aiResponse = await response.json();
    const emotionalTone = aiResponse;

    console.log("AI Response:", aiResponse);

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      user: req.user._id,
      title,
      explicitEmotion,
      emotionalTone,
      confidenceScore: aiResponse.max_confidence, // Assuming max_confidence is part
      content,
      shareStatus: shareStatus === true
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });

  } catch (error) {
    console.error('Add journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating journal entry',
      error: error.message
    });
  }
};

// Get user's journal entries
export const getJournals = async (req, res) => {
  try {
    // Find all journal entries for the user
    const journals = await JournalEntry.find({ user: req.user._id })
      .select('title content explicitEmotion emotionalTone confidenceScore shareStatus createdAt')
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    // Transform the journals to include separate date and time
    const formattedJournals = journals.map(journal => {
      const journalObj = journal.toObject();
      const date = new Date(journalObj.createdAt);
      
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Format time as HH:MM:SS
      const formattedTime = date.toTimeString().split(' ')[0];

      return {
        ...journalObj,
        date: formattedDate,
        time: formattedTime
      };
    });

    res.status(200).json({
      success: true,
      message: 'Journal entries retrieved successfully',
      data: formattedJournals
    });

  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving journal entries',
      error: error.message
    });
  }
};

// Get user's mood history
export const getMoodHistory = async (req, res) => {
  try {
    // Get last 7 journal entries for the user, sorted by date (oldest first)
    const moodHistory = await JournalEntry.find({ user: req.user._id })
      .select('explicitEmotion createdAt')
      .sort({ createdAt: -1 })  // Sort by date ascending (oldest first)
      .limit(7);

    // Transform the data to include day and mood
    const formattedHistory = moodHistory.map(entry => {
      const date = new Date(entry.createdAt);
      // Get day abbreviation (Sun, Mon, Tue, etc.)
      const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayAbbr,
        mood: entry.explicitEmotion
      };
    });

    // Calculate feltBetterCount
    const feltBetterCount = moodHistory.filter(entry => {
      const mood = entry.explicitEmotion.toLowerCase();
      return mood === 'good' || mood === 'great';
    }).length;

    res.status(200).json({
      success: true,
      message: 'Mood history retrieved successfully',
      data: {
        history: formattedHistory,
        feltBetterCount
      }
    });

  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mood history',
      error: error.message
    });
  }
};

// Get counsellor details
export const getCounsellors = async (req, res) => {
  try {
    // Get random 15 counsellors using aggregation
    const counsellors = await Counsellor.aggregate([
      { $match: { isActive: true } }, // Only get active counsellors
      { $sample: { size: 15 } }, // Randomly select 15 counsellors
      {
        $project: {
          fullName: 1,
          designation: 1,
          email: 1,
          chargePerHour: 1,
          profilePhoto: 1,
          _id: 0 // Exclude _id from the result
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counsellors,
        total: counsellors.length
      }
    });
  } catch (error) {
    console.error('Get counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counsellors',
      error: error.message
    });
  }
}; 