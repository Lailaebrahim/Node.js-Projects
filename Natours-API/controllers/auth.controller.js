import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

export const protect = catchAsync(async (req, res, next) => {
    // get token and check existance
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('No Authorization', 401));
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401));
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currUser = await User.findById(decoded.id);
    if (!currUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    // check if user changed password after token was issued
    if (currUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again', 401));
    }

    req.user = currUser;

    next()
});

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user);
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}