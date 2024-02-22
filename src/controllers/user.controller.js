// src/controllers/userController.js

import { getUserProfile, updateUserProfile, manageRoles } from '../services/userService.js';

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user; // Assuming userId is extracted from the JWT token
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user; // Assuming userId is extracted from the JWT token
    const updatedUser = await updateUserProfile(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ error: 'Update profile failed' });
  }
};

const manageRoles = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newRoles = req.body.roles;
    await manageRoles(userId, newRoles);
    res.json({ message: 'Roles updated successfully' });
  } catch (error) {
    console.error('Error managing roles:', error);
    res.status(400).json({ error: 'Manage roles failed' });
  }
};

export { getUserProfile, updateUserProfile, manageRoles };