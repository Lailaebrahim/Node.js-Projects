const express = require('express');
const coursesRouter = require('./routes/courses');
const usersRouter = require('./routes/users');
const refreshRouter = require('./routes/refreshToken');
const bodyParser = require('body-parser');
const jsend = require('jsend');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

const url = process.env.MONGO_URL;
var app = express();

dotenv.config();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(jsend.middleware);
app.use(cookieParser());
app.use(cors());


app.use('/uploads/userAvatar/', express.static(path.join(__dirname, 'uploads', 'userAvatar')));
app.use('/api/courses/', coursesRouter);
app.use('/api/users/', usersRouter);
app.use('/api/refreshToken/', refreshRouter);


// not found router handler
app.use('*', (req, res, next) => {
  res.status(404).jsend.fail({ message: 'Url Not Found' });
});

// error handler
app.use((error, req, res, next) => {
  if (error.statusCode >= 400 && error.statusCode < 500) {
    res.status(error.statusCode|| 400).jsend.fail({ message: error.message || 'Client Error' });
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
