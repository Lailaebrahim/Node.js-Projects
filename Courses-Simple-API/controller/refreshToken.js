const jwt = require('jsonwebtoken');
const User = require('../models/user');
const appError = require('../utils/error');
const asyncHandler = require('express-async-handler');
const generateTokens = require('../utils/token');

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return next(new appError().createError(403, "Forbidden"));
    try {
        const decodedJwt = jwt.verify(refreshToken, process.env.Refresh_JWT_SECRET);
        const user = await User.findById(decodedJwt._id);
        if (!user)
            return next(new appError().createError(403, "Forbidden"));
        const { accesstoken, _ } = generateTokens(user);
        res.jsend.success({ email: user.email, accessToken: accesstoken});   
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new appError().createError(401, "Refresh token expired please login again"));
        } else {
            return next(new appError().createError(403, "Forbidden"));
        }
    } 
});

module.exports = refreshAccessToken;