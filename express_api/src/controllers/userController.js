import JournalEntry from '../models/JournalEntry.js';
import Counsellor from '../models/Counsellor.js';
import Session from '../models/Session.js';

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

// Fetch all counsellors with advanced filtering and aggregation
export const getAllCounsellors = async (req, res) => {
  try {
    const { name, ratingRange, chargePerHourRange } = req.query;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 10); // max 10 per page

    const matchStage = { isActive: true };
    if (name) {
      matchStage.fullName = { $regex: name, $options: 'i' };
    }
    if (chargePerHourRange) {
      const [min, max] = chargePerHourRange.split('-').map(Number);
      matchStage.chargePerHour = { $gte: min, $lte: max };
    }

    // Count total matching counsellors (before pagination)
    const countPipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
    ];
    // Add ratingRange filter to countPipeline if present
    if (ratingRange) {
      const [min, max] = ratingRange.split('-').map(Number);
      countPipeline.push(
        {
          $lookup: {
            from: 'sessions',
            localField: '_id',
            foreignField: 'counsellor',
            as: 'sessions',
          },
        },
        {
          $addFields: {
            reviews: {
              $filter: {
                input: '$sessions',
                as: 'session',
                cond: { $ne: ['$$session.rating', null] },
              },
            },
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: '$reviews' }, 0] },
                {
                  $round: [
                    {
                      $avg: {
                        $map: {
                          input: '$reviews',
                          as: 'review',
                          in: '$$review.rating',
                        },
                      },
                    },
                    1,
                  ],
                },
                null,
              ],
            },
          },
        },
        {
          $addFields: {
            _avgRatingForFilter: {
              $cond: [
                { $ifNull: ['$averageRating', true] },
                0,
                '$averageRating',
              ],
            },
          },
        },
        {
          $match: {
            _avgRatingForFilter: { $gte: min, $lte: max },
          },
        }
      );
    }
    const total = await Counsellor.aggregate([
      ...countPipeline,
      { $count: 'count' },
    ]);
    const totalCount = total[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Aggregation pipeline for data
    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'sessions',
          localField: '_id',
          foreignField: 'counsellor',
          as: 'sessions',
        },
      },
      {
        $addFields: {
          reviews: {
            $filter: {
              input: '$sessions',
              as: 'session',
              cond: { $ne: ['$$session.rating', null] },
            },
          },
          uniquePatients: {
            $setUnion: {
              $map: {
                input: '$sessions',
                as: 'session',
                in: '$$session.user',
              },
            },
          },
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              {
                $round: [
                  {
                    $avg: {
                      $map: {
                        input: '$reviews',
                        as: 'review',
                        in: '$$review.rating',
                      },
                    },
                  },
                  1,
                ],
              },
              null,
            ],
          },
          reviewsCount: { $size: '$reviews' },
          patientsCount: { $size: '$uniquePatients' },
        },
      },
      {
        $addFields: {
          experience: {
            $let: {
              vars: {
                diffInMs: { $subtract: [new Date(), '$createdAt'] },
                msInYear: 1000 * 60 * 60 * 24 * 365,
                msInMonth: 1000 * 60 * 60 * 24 * 30,
              },
              in: {
                $cond: [
                  { $gte: ['$$diffInMs', '$$msInYear'] },
                  {
                    $cond: [
                      { $lte: [{ $divide: ['$$diffInMs', '$$msInYear'] }, 1.1] },
                      '1 year',
                      {
                        $cond: [
                          { $lte: [{ $mod: [{ $divide: ['$$diffInMs', '$$msInYear'] }, 1] }, 0.1] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } }, ' years'] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } }, '+ years'] },
                        ],
                      },
                    ],
                  },
                  {
                    $cond: [
                      { $lte: [{ $divide: ['$$diffInMs', '$$msInMonth'] }, 1.1] },
                      '1 month',
                      {
                        $cond: [
                          { $lte: [{ $mod: [{ $divide: ['$$diffInMs', '$$msInMonth'] }, 1] }, 0.1] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } }, ' months'] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } }, '+ months'] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          designation: 1,
          chargePerHour: 1,
          esewaAccountId: 1,
          profilePhoto: 1,
          documents: 1,
          averageRating: 1,
          reviewsCount: 1,
          patientsCount: 1,
          experience: 1,
        },
      },
    ];
    // Filter by ratingRange if provided
    if (ratingRange) {
      const [min, max] = ratingRange.split('-').map(Number);
      pipeline.push({
        $addFields: {
          _avgRatingForFilter: {
            $cond: [
              { $ifNull: ['$averageRating', true] },
              0,
              '$averageRating',
            ],
          },
        },
      });
      pipeline.push({
        $match: {
          _avgRatingForFilter: { $gte: min, $lte: max },
        },
      });
      // Only add a $project stage to exclude _avgRatingForFilter if there is no existing $project stage
      const hasProject = pipeline.some(stage => stage.$project);
      if (!hasProject) {
        pipeline.push({ $project: { _avgRatingForFilter: 0 } });
      }
    }
    // Pagination: skip and limit
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    let counsellors = await Counsellor.aggregate(pipeline);
    // Set averageRating to 0 if null in the response
    counsellors = counsellors.map(c => ({
      ...c,
      averageRating: c.averageRating == null ? 0 : c.averageRating,
    }));
    res.status(200).json({
      success: true,
      data: counsellors,
      total: totalCount,
      totalPages,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get all counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counsellors',
      error: error.message,
    });
  }
};

export const getCounsellorByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required in query.' });
    }
    const pipeline = [
      { $match: { email: email, isActive: true } },
      {
        $lookup: {
          from: 'sessions',
          localField: '_id',
          foreignField: 'counsellor',
          as: 'sessions',
        },
      },
      {
        $addFields: {
          reviews: {
            $filter: {
              input: '$sessions',
              as: 'session',
              cond: { $ne: ['$$session.rating', null] },
            },
          },
          uniquePatients: {
            $setUnion: {
              $map: {
                input: '$sessions',
                as: 'session',
                in: '$$session.user',
              },
            },
          },
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              {
                $round: [
                  {
                    $avg: {
                      $map: {
                        input: '$reviews',
                        as: 'review',
                        in: '$$review.rating',
                      },
                    },
                  },
                  1,
                ],
              },
              0,
            ],
          },
          reviewsCount: { $size: '$reviews' },
          patientsCount: { $size: '$uniquePatients' },
        },
      },
      {
        $addFields: {
          experience: {
            $let: {
              vars: {
                diffInMs: { $subtract: [new Date(), '$createdAt'] },
                msInYear: 1000 * 60 * 60 * 24 * 365,
                msInMonth: 1000 * 60 * 60 * 24 * 30,
              },
              in: {
                $cond: [
                  { $gte: ['$$diffInMs', '$$msInYear'] },
                  {
                    $cond: [
                      { $lte: [{ $divide: ['$$diffInMs', '$$msInYear'] }, 1.1] },
                      '1 year',
                      {
                        $cond: [
                          { $lte: [{ $mod: [{ $divide: ['$$diffInMs', '$$msInYear'] }, 1] }, 0.1] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } }, ' years'] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } }, '+ years'] },
                        ],
                      },
                    ],
                  },
                  {
                    $cond: [
                      { $lte: [{ $divide: ['$$diffInMs', '$$msInMonth'] }, 1.1] },
                      '1 month',
                      {
                        $cond: [
                          { $lte: [{ $mod: [{ $divide: ['$$diffInMs', '$$msInMonth'] }, 1] }, 0.1] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } }, ' months'] },
                          { $concat: [{ $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } }, '+ months'] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          designation: 1,
          chargePerHour: 1,
          esewaAccountId: 1,
          profilePhoto: 1,
          documents: 1,
          patientsCount: 1,
          experience: 1,
          averageRating: 1,
          reviewsCount: 1,
          availability: 1,
        },
      },
    ];
    const result = await Counsellor.aggregate(pipeline);
    if (!result.length) {
      return res.status(404).json({ success: false, message: 'Counsellor not found.' });
    }
    const counsellor = result[0];
    // Reorder availability to start from today
    if (counsellor.availability && Array.isArray(counsellor.availability)) {
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayIdx = new Date().getDay(); // 0=Sunday, 1=Monday, ...
      // Map JS getDay to our daysOfWeek (Monday=0, ..., Sunday=6)
      const dayMap = [6, 0, 1, 2, 3, 4, 5];
      const startIdx = dayMap[todayIdx];
      // Create ordered days array
      const orderedDays = [];
      for (let i = 0; i < 7; i++) {
        orderedDays.push(daysOfWeek[(startIdx + i) % 7]);
      }
      // Sort availability by this order
      counsellor.availability = orderedDays
        .map(day => counsellor.availability.find(a => a.dayOfWeek === day))
        .filter(Boolean);
    }
    res.status(200).json({ success: true, data: counsellor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching counsellor', error: error.message });
  }
};

export const bookCounsellorSession = async (req, res) => {
  try {
    const { counsellorEmail, day, time } = req.body;
    if (!counsellorEmail || !day || !time) {
      return res.status(400).json({ success: false, message: 'counsellorEmail, day, and time are required.' });
    }
    // Find counsellor
    const counsellor = await Counsellor.findOne({ email: counsellorEmail, isActive: true });
    if (!counsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found.' });
    }
    // Check if requested day and time is in counsellor's availability
    const availability = counsellor.availability || [];
    const dayAvailability = availability.find(a => a.dayOfWeek === day);
    if (!dayAvailability) {
      return res.status(400).json({ success: false, message: 'Counsellor is not available on the requested day.' });
    }
    // Find if any slot includes the requested time
    let isAvailable = false;
    for (const slot of dayAvailability.slots) {
      if (slot.times && slot.times.includes(time)) {
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Counsellor is not available at the requested time.' });
    }
    // Calculate next date for the requested day
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayIdx = today.getDay();
    const requestedDayIdx = daysOfWeek.indexOf(day);
    if (requestedDayIdx === -1) {
      return res.status(400).json({ success: false, message: 'Invalid day provided.' });
    }
    let daysToAdd = requestedDayIdx - todayIdx;
    // Validation: can't book in the past (for today, time must be after now)
    if (daysToAdd === 0) {
      const now = new Date();
      const nowTime = now.getHours() * 60 + now.getMinutes();
      const [hours, minutes] = time.split(':').map(Number);
      const reqTime = hours * 60 + minutes;
      if (reqTime <= nowTime) {
        return res.status(400).json({ success: false, message: "You can't add booking prior to current time" });
      }
    }
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    // Compose the requested date (local time)
    const requestedDate = new Date(today);
    requestedDate.setHours(0,0,0,0);
    requestedDate.setDate(today.getDate() + daysToAdd);
    // Set the requested time (local time)
    const [hours, minutes] = time.split(':').map(Number);
    requestedDate.setHours(hours, minutes, 0, 0);
    // Convert to UTC
    const utcDate = new Date(requestedDate.getTime() - (requestedDate.getTimezoneOffset() * 60000));
    // Check if session already exists for this counsellor at this dateTime (only if status is 'accepted')
    const existingSession = await Session.findOne({
      counsellor: counsellor._id,
      dateTime: utcDate,
      status: 'accepted'
    });
    if (existingSession) {
      return res.status(400).json({ success: false, message: 'Counsellor is already booked for the requested day and time' });
    }
    // Create new session
    const session = await Session.create({
      user: req.user._id,
      counsellor: counsellor._id,
      dateTime: utcDate,
      status: 'pending',
      paymentStatus: 'pending'
    });
    res.status(201).json({ success: true, message: 'Booking request created successfully', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating booking', error: error.message });
  }
};

// Get all pending booking requests for the authenticated user
export const getPendingAppointments = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      status: 'pending'
    }).sort({ dateTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending appointments', error: error.message });
  }
};

// Get all accepted (upcoming) booking requests for the authenticated user
export const getUpcomingAppointments = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      status: 'accepted'
    }).sort({ dateTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching upcoming appointments', error: error.message });
  }
}; 