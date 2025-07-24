import JournalEntry from '../models/JournalEntry.js';
import Counsellor from '../models/Counsellor.js';
import Session from '../models/Session.js';
import moment from 'moment-timezone';
import SleepLog from '../models/SleepLog.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';


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

    console.log("AI Response:", aiResponse);

    const emotionalTone = {
  max_confidence: aiResponse.max_confidence,
  predictions: Object.entries(aiResponse.probabilities).map(([emotion, percentage]) => ({
    emotion,
    confidence: parseFloat(percentage.replace('%', '')) / 100  // Convert "92.83%" => 0.9283
  })),
  text: content
};

  const predictedEmotion = aiResponse.predicted_emotion;


    // Create journal entry
    const journalEntry = await JournalEntry.create({
      user: req.user._id,
      title,
      explicitEmotion,
      emotionalTone,
      predictedEmotion,
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
          nmcNo:1,
          qualification:1,
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
    limit = Math.min(parseInt(limit) || 10, 100); // Increased max limit to 100

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
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } } }, ' years'] },
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } } }, '+ years'] },
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
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } } }, ' months'] },
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } } }, '+ months'] },
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
          nmcNo:1,
          qualification:1,
          documents: 1,
          averageRating: 1,
          reviewsCount: 1,
          patientsCount: 1,
          experience: 1,
        },
      },
    ];
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
      pipeline.push({ $project: { _avgRatingForFilter: 0 } });
    }
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    let counsellors = await Counsellor.aggregate(pipeline);
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

    // Fetch accepted sessions for the counsellor
    const acceptedSessions = await Session.find({
      counsellor: { $in: await Counsellor.find({ email, isActive: true }).distinct('_id') },
      status: 'accepted'
    }).select('dateTime').lean();

    // Map sessions to their day and time
    const bookedSlots = acceptedSessions.map(session => {
      const date = new Date(session.dateTime);
      const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
      const time = date.toISOString().split('T')[1].slice(0, 5); // e.g., '18:00'
      return { dayOfWeek, time };
    });

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
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } } }, ' years'] },
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInYear'] } } }, '+ years'] },
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
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } } }, ' months'] },
                          { $concat: [{ $toString: { $toInt: { $divide: ['$$diffInMs', '$$msInMonth'] } } }, '+ months'] },
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
        $addFields: {
          availability: {
            $map: {
              input: '$availability',
              as: 'avail',
              in: {
                dayOfWeek: '$$avail.dayOfWeek',
                slots: {
                  $map: {
                    input: '$$avail.slots',
                    as: 'slot',
                    in: {
                      period: '$$slot.period',
                      times: {
                        $filter: {
                          input: '$$slot.times',
                          as: 'time',
                          cond: {
                            $not: {
                              $in: [
                                { dayOfWeek: '$$avail.dayOfWeek', time: '$$time' },
                                bookedSlots.map(slot => ({
                                  dayOfWeek: slot.dayOfWeek,
                                  time: slot.time
                                }))
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          designation: 1,
          chargePerHour: 1,
          esewaAccountId: 1,
          nmcNo:1,
          qualification:1,
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
      const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Map JS getDay to daysOfWeek (Monday=0, ..., Sunday=6)
      const startIdx = dayMap[todayIdx];
      const orderedDays = [];
      for (let i = 0; i < 7; i++) {
        orderedDays.push(daysOfWeek[(startIdx + i) % 7]);
      }
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
    const { counsellorEmail, day, time, noteTitle, noteDescription } = req.body;
    if (!counsellorEmail || !day || !time || !noteTitle || !noteDescription) {
      return res.status(400).json({ success: false, message: 'counsellorEmail, day, and time and notes for counsellor are required.' });
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
      noteTitle: noteTitle,
      noteDescription: noteDescription,
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
    })
      .populate('counsellor', 'fullName email phone designation chargePerHour esewaAccountId profilePhoto')
      .sort({ dateTime: 1 })
      .lean();

    // Transform the response to separate date and time
    const formattedSessions = sessions.map(session => ({
      ...session,
      date: session.dateTime.toISOString().split('T')[0],
      time: session.dateTime.toISOString().split('T')[1].split('.')[0],
      counsellor: {
        fullName: session.counsellor.fullName,
        email: session.counsellor.email,
        phone: session.counsellor.phone,
        designation: session.counsellor.designation,
        chargePerHour: session.counsellor.chargePerHour,
        esewaAccountId: session.counsellor.esewaAccountId,
        profilePhoto: session.counsellor.profilePhoto
      }
    }));

    res.status(200).json({ success: true, data: formattedSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending appointments', error: error.message });
  }
};


export const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch upcoming sessions
    const upcomingSessions = await Session.find({
      user: userId,
      status: 'accepted',
    })
      .populate('counsellor', 'fullName email phone designation chargePerHour esewaAccountId profilePhoto')
      .sort({ dateTime: 1 }) // Earliest upcoming first (today before tomorrow)
      .lean();

    // Fetch past sessions
    const pastSessions = await Session.find({
      user: userId,
      status: 'completed',
    })
      .populate('counsellor', 'fullName email phone designation chargePerHour esewaAccountId profilePhoto')
      .sort({ dateTime: -1 }) // Latest completed first
      .lean();

    // Format both sets of sessions
    const formatSessions = (sessions) =>
      sessions.map((session) => ({
        ...session,
        date: session.dateTime.toISOString().split('T')[0],
        time: session.dateTime.toISOString().split('T')[1].split('.')[0],
        counsellor: {
          fullName: session.counsellor.fullName,
          email: session.counsellor.email,
          phone: session.counsellor.phone,
          designation: session.counsellor.designation,
          chargePerHour: session.counsellor.chargePerHour,
          esewaAccountId: session.counsellor.esewaAccountId,
          profilePhoto: session.counsellor.profilePhoto,
        },
      }));

    res.status(200).json({
      success: true,
      upcomingAppointments: formatSessions(upcomingSessions),
      pastAppointments: formatSessions(pastSessions),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message,
    });
  }
};


export const addFeedbackAndRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, feedback, rating } = req.body;

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
    }

    // Find the session with provided sessionId that belongs to the user and is completed
    const session = await Session.findOne({
      _id: sessionId,
      user: userId,
      status: 'completed',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No completed session found for this user with the provided session ID',
      });
    }

    // Check if feedback and rating already exist
    if (session.feedback || session.rating) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback to the counsellor',
      });
    }

    // Update feedback and rating
    session.feedback = feedback;
    session.rating = rating;
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback and rating submitted successfully',
      data: {
        sessionId: session._id,
        feedback: session.feedback,
        rating: session.rating,
      },
    });
  } catch (error) {
    console.error('Error in addFeedbackAndRating:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding feedback and rating',
      error: error.message,
    });
  }
};


export const addSleepLog = async (req, res) => {
    try {
        const { hoursSlept, quality } = req.body;
        const userId = req.user._id;

        // Validate quality field manually
        const allowedQualities = ['Poor', 'Fair', 'Good', 'Excellent'];
        if (!allowedQualities.includes(quality)) {
            return res.status(400).json({
                success: false,
                message: 'Quality must be one of: Poor, Fair, Good or Excellent.'
            });
        } 

        const timezone = 'Asia/Kathmandu';
        const startOfDay = moment().tz(timezone).startOf('day').toDate();
        const endOfDay = moment().tz(timezone).endOf('day').toDate();

        const existingLog = await SleepLog.findOne({
            user: userId,
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingLog) {
            return res.status(400).json({
                success: false,
                message: 'You have already added a sleep log for today.'
            });
        }

        const newLog = await SleepLog.create({
            user: userId,
            hoursSlept,
            quality
        });

        // Update user's sleepLogs list
        await User.findByIdAndUpdate(userId, {
            $push: { sleepLogs: newLog._id }
        });

        res.status(201).json({
            success: true,
            message: 'Sleep log added successfully.',
            data: newLog
        });
    } catch (error) {
        console.error('Error in addSleepLog:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add sleep log.',
            error: error.message
        });
    }
};


export const getSleepLogHistory = async (req, res) => {
    try {
        const userId = req.user._id;
       

        let limit = 7; // default is weekly
      
        const sleepLogs = await SleepLog.find({ user: userId })
            .sort({ timestamp: -1 }) // Latest first
            .limit(limit)
            .lean();

        const timezone = 'Asia/Kathmandu';
        const formattedLogs = sleepLogs.map(log => {
            const dateInNepal = moment(log.timestamp).tz(timezone);
            return {
                date: dateInNepal.format('MM/DD/YYYY'),
                day: dateInNepal.format('dddd'),
                hoursSlept: log.hoursSlept,
                quality: log.quality
            };
        });

        res.status(200).json({
            success: true,
            data: formattedLogs
        });
    } catch (error) {
        console.error('Error in getSleepLogHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sleep log history.',
            error: error.message
        });
    }
};


export const providePrompt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required.'
            });
        }

        // Call Flask API for AI Response
        const response = await fetch('http://localhost:8000/api/bot/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch response from AI chatbot API.'
            });
        }

        const flaskResponse = await response.json();
        const aiResponse = flaskResponse.response;

        // Save to Chat model
        const chatEntry = await Chat.create({
            user: userId,
            prompt,
            aiResponse
        });

        // Respond with the created Chat document
        res.status(201).json({
            success: true,
            data: chatEntry
        });

    } catch (error) {
        console.error('Error in providePrompt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to provide prompt.',
            error: error.message
        });
    }
};


export const getProfileDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch specific fields only
    const user = await User.findById(userId).select('fullName email createdAt emailVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Error fetching profile details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile details',
      error: error.message,
    });
  }
};


export const editProfileDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName } = req.query;

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true, runValidators: true }
    ).select('fullName email createdAt emailVerified');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};


export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch chats sorted by oldest first
    const chats = await Chat.find({ user: userId }).sort({ timestamp: 1 });

    // Convert timestamp to Nepal Time and overwrite timestamp field
    const chatsWithNepalTime = chats.map(chat => {
      const chatObj = chat.toObject();
      chatObj.timestamp = moment(chat.timestamp)
        .tz('Asia/Kathmandu')
        .format('YYYY-MM-DD HH:mm:ss');
      return chatObj;
    });

    res.status(200).json({
      success: true,
      data: chatsWithNepalTime
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};


export const setUserJoinedTrue = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Validate sessionId
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID is required' 
      });
    }

    // Update the session's userJoinStatus
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { $set: { userJoinStatus: true } },
      { new: true } // Return the updated document
    );

    if (!updatedSession) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User join status updated successfully',
      session: updatedSession
    });

  } catch (error) {
    console.error('Error updating user join status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating session status', 
      error: error.message 
    });
  }
};