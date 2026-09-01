import mongoose from 'mongoose';

export default mongoose.model('Achievement', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  date: Date,
  description: { type: String, required: true, trim: true },
  certificateUrl: { type: String, trim: true }
}, { timestamps: true }));
