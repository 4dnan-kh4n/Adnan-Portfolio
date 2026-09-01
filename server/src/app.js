import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import requireAuth from './middleware/requireAuth.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin/upload', requireAuth, uploadRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
});

app.use((error, _request, response, _next) => {
  if (error.code === 'LIMIT_FILE_SIZE') return response.status(400).json({ message: 'Files must be 10 MB or smaller.' });
  if (error.name === 'ValidationError') return response.status(400).json({ message: Object.values(error.errors).map(({ message }) => message).join(' ') });
  if (error.name === 'CastError') return response.status(400).json({ message: 'One of the supplied values is invalid.' });
  console.error(error);
  response.status(500).json({ message: 'Something went wrong. Please try again.' });
});

export default app;
