import mongoose from 'mongoose';

export default mongoose.model('Project', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  techStack: { type: [String], default: [] },
  images: { type: [String], default: [] },
  liveLink: { type: String, trim: true },
  githubLink: { type: String, trim: true },
  featured: { type: Boolean, default: false },
  category: { type: String, required: true, trim: true }
}, { timestamps: true }));
