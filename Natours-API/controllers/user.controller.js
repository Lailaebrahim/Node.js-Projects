import crypto from 'crypto';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/emails.js';
import { generateToken } from "./auth.controller.js";

const createSendToken = (user, statusCode, res) => {
    const token = generateToken(user._id);
    res.cookie('jwt', {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(statusCode).json({
        status: 'success',
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photo: user.photo
            }
        }
    });
};

export const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        role: req.body.role,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangeAt: req.body.passwordChangeAt
    });
    // const token = generateToken(newUser._id);

    createSendToken(newUser, 201, res);
    // res.status(201).json({
    //     status: 'success',
    //     data: {
    //         token,
    //         user: {
    //             id: newUser._id,
    //             name: newUser.name,
    //             email: newUser.email,
    //             photo: newUser.photo
    //         }
    //     }
    // });
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.validatePassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
    // const token = generateToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         token
    //     }
    // });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Please provide email', 400));
    }

    const user = await User.findOne({ email });
    if (!user) { return next(new AppError('No user found with this email', 404)); }

    const resetToken = user.generateResetPasswordToken();
    // the changes of the instances method are not saved to the database until we call save() method
    // call save() method with the option validateBeforeSave set to false to avoid validation errors
    // as calling save() method will run the validation
    // and any field set as required in the schema and is missing from this user instance will cause validation error
    // as the confirmPassword field that we set to undefined in user creation
    await user.save({ validateBeforeSave: false });

    const restURL = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;

    // await sendEmail({
    //     email: user.email,
    //     subject: 'Reset Password',
    //     message: `If you forget your password, please submit a PATCH request with your new password and passwordConfirm to: ${restURL}`
    // });

    res.status(200).json({
        status: 'success',
        message: `If you forget your password, please submit a PATCH request with your new password and passwordConfirm to: ${restURL}`
    });

});

export const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
    // const newToken = generateToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         token: newToken
    //     }
    // });

});

export const updateMyPassword = catchAsync(async (req, res, next) => {
    const { password, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.validatePassword(password))) {
        return next(new AppError("Incorrect password", 401));
    }
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save();

    createSendToken(user, 200, res);
    // const token = generateToken(user._id);
    // res.status(200).json({
    //     status: "success",
    //     data: {
    //         token,
    //     },
    // });
});

export const updateMe = catchAsync(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true, runValidators: true }
    );
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

export const deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    return res.status(204).json({
        status: "success",
        data: null,
    });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});