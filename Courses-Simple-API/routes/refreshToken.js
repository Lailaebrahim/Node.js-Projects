const express = require('express');
const refreshAccessToken = require('../controller/refreshToken');


const refreshRouter = express.Router();

refreshRouter.route('/').get(refreshAccessToken);

module.exports = refreshRouter;