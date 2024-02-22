// authMiddleware.js

import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const authResetPasswordMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Additional validation logic for password reset token
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ error: 'Invalid token for password reset' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const authVerifyEmailMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Additional validation logic for email verification token
    if (decoded.purpose !== 'email_verification') {
      return res.status(401).json({ error: 'Invalid token for email verification' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export { authMiddleware, authResetPasswordMiddleware, authVerifyEmailMiddleware };