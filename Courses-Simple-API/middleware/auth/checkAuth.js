const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const User = require('../../models/user');

const checkAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new appError().createError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decodedJwt.email });
    if (!user) {
        return next(new appError().createError(401, "Unauthorized"));
    }
    req.user = user;
    next();
});


module.exports = checkAuth;
