import jwt from 'jsonwebtoken';

export default function requireAuth(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ message: 'Authentication required.' });

  try {
    request.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired token.' });
  }
}
