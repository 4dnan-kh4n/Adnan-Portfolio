import mongoose from 'mongoose';

export default mongoose.model('Experience', new mongoose.Schema({
  role: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  present: { type: Boolean, default: false },
  description: { type: String, required: true, trim: true },
  companyLogo: { type: String, trim: true }
}, { timestamps: true }));
