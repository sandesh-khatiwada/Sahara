import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const counsellorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  chargePerHour: {
    type: Number,
    required: [true, 'Charge per hour is required'],
    min: 0
  },
  esewaAccountId: {
    type: String,
    required: true
  },
  profilePhoto: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  }],

  bio:{
    type:String
  },
  nmcNo:{
      type: String
  },
  qualification:{
    type:String
  },
  passwordChangeStatus: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  availability: [
    {
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      slots: [
        {
          period: {
            type: String,
            enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
            required: true
          },
          times: [String] // e.g., ['08:00', '09:00', '11:00']
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
counsellorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
counsellorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Counsellor = mongoose.model('Counsellor', counsellorSchema);

export default Counsellor; 