import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

const router = Router();

router.post('/login', async (request, response) => {
  const { identifier, password } = request.body;
  if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
    return response.status(400).json({ message: 'Username/email and password are required.' });
  }

  const admin = await AdminUser.findOne({ $or: [{ email: identifier.trim().toLowerCase() }, { username: identifier.trim() }] });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return response.status(401).json({ message: 'Invalid credentials.' });

  const token = jwt.sign({ sub: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  response.json({ token, admin: { username: admin.username, email: admin.email } });
});

export default router;
