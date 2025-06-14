import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counsellor',
    required: [true, 'Counsellor reference is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileType: {
    type: String,
    enum: ['PDF', 'JPEG'],
    required: [true, 'File type is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

export default Document; 