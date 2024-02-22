// userRoutes.js

import express from 'express';
import { getUserProfile, updateUserProfile, manageRoles } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/manage-roles/:userId', authMiddleware, manageRoles);

export default router;