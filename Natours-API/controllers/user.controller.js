import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { generateToken } from "./auth.controller.js";

export const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });
    const token = generateToken(newUser._id);
    res.status(201).json({
        status: 'success',
        data: {
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                photo: newUser.photo
            }
        }
    });
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    const check = bcrypt.compare(password, user.password);
    if (!user || !check) {
        return next(new AppError('Incorrect email or password', 401));
    }
    const token = generateToken(user._id);
    res.status(200).json({
        status: 'success',
        data: {
            token
        }
    });
});