import mongoose from 'mongoose';

export default mongoose.model('Skill', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  proficiency: { type: Number, min: 0, max: 100 },
  icon: { type: String, trim: true }
}, { timestamps: true }));
