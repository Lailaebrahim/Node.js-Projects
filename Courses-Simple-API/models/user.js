const mongoose = require('mongoose');
const validator = require('validator');
const userRoles = require('../utils/userRoles');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email",
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  token: {
    type: String,
    default: "Login To Get Authorization Token",
  },
  role :{
    type: String,
    enum: userRoles,
    default : userRoles.USER
  }, 
  avatar: {
    type: String,
    default: "uploads/userAvatar/default.jpg",
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
