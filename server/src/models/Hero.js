import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({ label: { type: String, required: true, trim: true }, url: { type: String, required: true, trim: true } }, { _id: false });

export default mongoose.model('Hero', new mongoose.Schema({
  singletonKey: { type: String, default: 'hero', unique: true, immutable: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  intro: { type: String, required: true, trim: true },
  headline: { type: String, trim: true },
  availabilityLabel: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  resumeUrl: { type: String, trim: true },
  ctas: { type: [linkSchema], default: [] }
}, { timestamps: true }));
