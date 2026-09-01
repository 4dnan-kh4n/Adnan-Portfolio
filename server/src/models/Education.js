import mongoose from 'mongoose';

export default mongoose.model('Education', new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  university: { type: String, trim: true },
  startYear: { type: Number, required: true, min: 1900 },
  endYear: { type: Number, min: 1900 },
  description: { type: String, trim: true }
}, { timestamps: true }));
