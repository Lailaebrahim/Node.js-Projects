const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const User = require('../../models/user');
const appError = require('../../utils/error');

const checkAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new appError().createError(401, "Unauthorized no token provided"));
    }
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
        return next(new appError().createError(401, "Unauthorized no token provided"));
    }
    try {
        const decodedJwt = jwt.verify(accessToken, process.env.Access_JWT_SECRET);
        const user = await User.findById(decodedJwt._id);
        if (!user) {
            return next(new appError().createError(401, "Unauthorized no user found"));
        }
        req.user = user;
        next();
    } catch(err){
        if (err.name === 'TokenExpiredError') {
            return next(new appError().createError(401, "Token expired, please refresh the access token"));
        } else {
            return next(new appError().createError(403, "Forbidden"));
        }
    }
});


module.exports = checkAuth;
