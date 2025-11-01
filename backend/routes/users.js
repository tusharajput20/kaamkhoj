const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Upload resume
router.post('/upload-resume/:id', upload.single('resume'), async (req, res) => {
  try {
    console.log('Resume upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get relative path for storage in database
    const resumePath = `/uploads/${path.basename(req.file.path)}`;
    console.log('Resume path:', resumePath);
    
    // Update user with resume path
    user.resume = resumePath;
    await user.save();
    console.log('Resume saved to user profile');

    res.status(200).json({ 
      message: 'Resume uploaded successfully',
      resume: user.resume
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error during resume upload: ' + error.message });
  }
});

module.exports = router;
