import mongoose from 'mongoose';

const factSchema = new mongoose.Schema({ label: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } }, { _id: false });

export default mongoose.model('About', new mongoose.Schema({
  singletonKey: { type: String, default: 'about', unique: true, immutable: true },
  bio: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  location: { type: String, trim: true },
  quickFacts: { type: [factSchema], default: [] },
  heading: { type: String, trim: true },
  ctaLabel: { type: String, trim: true },
  ctaUrl: { type: String, trim: true },
  visualEyebrow: { type: String, trim: true },
  visualTitle: { type: String, trim: true },
  visualCaption: { type: String, trim: true },
  visualImage: { type: String, trim: true }
}, { timestamps: true }));
