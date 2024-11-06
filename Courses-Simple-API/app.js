const express = require('express');
const coursesRouter = require('./routes/courses');
const usersRouter = require('./routes/users');
const bodyParser = require('body-parser');
const jsend = require('jsend');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const url = "mongodb+srv://Lailaebrahim:MPrFuQS8PaaShkho@lailacluster0.hm1b0.mongodb.net/?retryWrites=true&w=majority&appName=LailaCluster0";
var app = express();

dotenv.config();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(jsend.middleware);
app.use(cors());
app.use('/uploads/userAvatar/', express.static(path.join(__dirname, 'uploads', 'userAvatar')));
app.use('/api/courses/', coursesRouter);
app.use('/api/users/', usersRouter);
// not found router handler
app.use('*', (req, res, next) => {
  res.status(404).jsend.fail({ message: 'Url Not Found' });
});
// error handler
app.use((error, req, res, next) => {
  if (error.statusCode >= 400 && error.statusCode < 500) {
    res.status(error.statusCode).jsend.fail({ message: error.message || 'Client Error' });
  } else {
    res.status(error.statusCode || 500).jsend.error({ message: error.message || 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

try {
  mongoose.connect(url);
  console.log("Connected to the database");
}
catch (error) {
  console.log("Could not connect to the database");
}

module.exports = app;
