const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const User = require('../../models/user');
const appError = require('../../utils/error');

const allowedTo = (roles) => {
    return asyncHandler (async (req, res, next) => {
    const user = req.user;
    if (!user) return next(new appError().createError(401, "Unauthorized"));
    if (!roles.includes(user.role)){
        return next(new appError().createError(401, "Unauthorized"));
    }
    next();
    });
}



module.exports = allowedTo;
