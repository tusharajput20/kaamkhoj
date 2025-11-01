const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  experience: [{
    role: String,
    company: String,
    location: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    duration: String,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  languages: [{
    type: String
  }],
  certifications: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
