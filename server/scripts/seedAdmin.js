import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../src/config/db.js';
import AdminUser from '../src/models/AdminUser.js';
import mongoose from 'mongoose';

const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error('Set ADMIN_USERNAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in .env.');
}

try {
  await connectDatabase();
  if (await AdminUser.exists({})) throw new Error('An admin already exists. Use the future dashboard password flow instead of reseeding.');
  await AdminUser.create({ username: ADMIN_USERNAME, email: ADMIN_EMAIL, passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) });
  console.log('Admin created. Remove ADMIN_PASSWORD from .env when finished.');
} finally {
  await mongoose.disconnect();
}
