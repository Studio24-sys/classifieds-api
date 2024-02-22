// src/controllers/authController.js

import { registerUser, loginUser, resetPassword, verifyEmail } from '../services/authService.js';

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const token = await loginUser(req.body);
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    await resetPassword(email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ error: 'Password reset failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const email = req.body.email;
    await verifyEmail(email);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ error: 'Email verification failed' });
  }
};

export { register, login, resetPassword, verifyEmail };