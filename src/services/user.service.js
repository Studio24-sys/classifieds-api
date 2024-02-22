// src/services/userService.js

import prisma from '../prismaClient.js';

const getUserProfile = async (userId) => {
  // Input validation
  if (!userId) {
    throw new Error('User ID is required to fetch user profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const updateUserProfile = async (userId, updatedData) => {
  // Input validation
  if (!userId || !updatedData) {
    throw new Error('User ID and updated data are required to update user profile');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });

  return user;
};

const manageRoles = async (userId, newRoles) => {
    // Input validation
    if (!userId || !newRoles) {
      throw new Error('User ID and new roles are required to manage roles');
    }
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    // Update user roles
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: newRoles,
      },
    });
  
    return updatedUser;
  };
  
  export { getUserProfile, updateUserProfile, manageRoles };