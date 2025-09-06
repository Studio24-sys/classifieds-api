// authRoutes.js

import express from 'express';
import { register, login, resetPassword, verifyEmail } from '../controllers/auth.Controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

export default router;