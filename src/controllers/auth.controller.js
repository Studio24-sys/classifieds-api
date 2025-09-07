// src/controllers/auth.controller.js
import {
  registerUser,
  loginUser,
  resetPassword as resetPasswordSvc,
  verifyEmail as verifyEmailSvc,
} from '../services/auth.service.js';

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    console.error('Register error:', error);
    const msg = typeof error?.message === 'string' ? error.message : String(error);
    const status = error?.code === 'EMAIL_TAKEN' ? 409 : 500;
    return res.status(status).json({ error: 'Registration failed', detail: msg });
  }
}

export async function login(req, res) {
  try {
    const data = await loginUser(req.body);
    return res.json(data);
  } catch (error) {
    console.error('Login error:', error);
    const msg = typeof error?.message === 'string' ? error.message : String(error);
    const status = error?.code === 'INVALID_CREDENTIALS' ? 401 : 500;
    return res.status(status).json({ error: 'Login failed', detail: msg });
  }
}

export async function resetPassword(req, res) {
  try {
    await resetPasswordSvc(req.body?.email);
    return res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Reset error:', error);
    const msg = typeof error?.message === 'string' ? error.message : String(error);
    return res.status(400).json({ error: 'Password reset failed', detail: msg });
  }
}

export async function verifyEmail(req, res) {
  try {
    await verifyEmailSvc(req.body?.email);
    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify error:', error);
    const msg = typeof error?.message === 'string' ? error.message : String(error);
    return res.status(400).json({ error: 'Email verification failed', detail: msg });
  }
}