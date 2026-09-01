import mongoose from 'mongoose';

export default mongoose.model('Contact', new mongoose.Schema({
  singletonKey: { type: String, default: 'contact', unique: true, immutable: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  linkedIn: { type: String, trim: true },
  github: { type: String, trim: true },
  socials: { type: [{ platform: { type: String, required: true, trim: true }, url: { type: String, required: true, trim: true } }], default: [] },
  heading: { type: String, trim: true },
  highlightedWord: { type: String, trim: true },
  intro: { type: String, trim: true },
  footerCopyright: { type: String, trim: true }
}, { timestamps: true }));
