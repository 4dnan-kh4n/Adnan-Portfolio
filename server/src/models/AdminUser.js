import mongoose from 'mongoose';

export default mongoose.model('AdminUser', new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true }));
