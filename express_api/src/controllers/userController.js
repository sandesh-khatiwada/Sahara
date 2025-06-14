import JournalEntry from '../models/JournalEntry.js';

// Add journal entry
export const addJournal = async (req, res) => {
  try {
    const { title, explicitEmotion, content, shareStatus } = req.body;

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

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      user: req.user._id,
      title,
      explicitEmotion,
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