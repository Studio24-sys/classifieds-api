// src/services/authService.js

import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService.js';

const registerUser = async (userData) => {
    const { name, email, password } = userData;
  
    // Input validation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required for registration');
    }
  
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
  
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  
    // Send welcome email
    sendEmail(email, 'Welcome to our platform', 'Thank you for registering!');
  
    return user;
  };
  
  const loginUser = async (credentials) => {
    const { email, password } = credentials;
  
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required for login');
    }
  
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new Error('Invalid credentials');
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }
  
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  
    return token;
  };
  
  const resetPassword = async (email) => {
    // Generate a password reset token
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    // Send password reset email with the token
    sendEmail(email, 'Password Reset Request', `Use this token to reset your password: ${resetToken}`);
  
    return { message: 'Password reset email sent' };
  };
  
  const verifyEmail = async (email) => {
    // Generate an email verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    // Send email verification email with the token
    sendEmail(email, 'Email Verification', `Use this token to verify your email: ${verificationToken}`);
  
    return { message: 'Email verification email sent' };
  };
  
  export { registerUser, loginUser, resetPassword, verifyEmail };