const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { 
      email, password, name, title, location, phone, about,
      skills, languages, certifications 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Parse arrays if they are sent as strings
    let parsedSkills = skills;
    let parsedLanguages = languages;
    let parsedCertifications = certifications;

    if (typeof skills === 'string') {
      try { parsedSkills = JSON.parse(skills); } catch (e) { parsedSkills = []; }
    }
    
    if (typeof languages === 'string') {
      try { parsedLanguages = JSON.parse(languages); } catch (e) { parsedLanguages = []; }
    }
    
    if (typeof certifications === 'string') {
      try { parsedCertifications = JSON.parse(certifications); } catch (e) { parsedCertifications = []; }
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      name,
      title: title || '',
      location: location || '',
      phone: phone || '',
      about: about || '',
      skills: parsedSkills || [],
      languages: parsedLanguages || [],
      certifications: parsedCertifications || [],
      experience: [],
      education: [],
      projects: []
    });

    // Save user to database
    await newUser.save();

    // Return user data (excluding password)
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Upload profile image (separate endpoint)
router.post('/upload-profile-image/:id', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with profile image path
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ 
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
