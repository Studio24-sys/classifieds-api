import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const [, token] = hdr.split(' '); // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'NO_AUTH' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_AUTH' });
  }
}
