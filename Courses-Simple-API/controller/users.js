const  User = require("../models/user");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const appError = require("../utils/error");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateTokens = require("../utils/token");
const { log } = require("console");
const jwt = require("jsonwebtoken");


const getAllUsers = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty())
        return next(new appError().createError(400, result.array()));
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find({}, { __v: 0 }).limit(limit).skip(skip);
    res.jsend.success(users);
});

const registerUser = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty())
        return next(new appError().createError(400, result.array()));
    const { firstName, lastName, email, password, role } = req.body;
    const oldUser = await User.findOne({ email });
    if (oldUser)
        return next(new appError().createError(400, "User already exists"));
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarPath = req.file ? path.join('uploads/userAvatar', req.file.filename) : "uploads/userAvatar/default.png";
    const user = new User({ firstName, lastName, email, password: hashedPassword, role, avatar: avatarPath });
    await user.save();
    res.jsend.success(user);
});

const loginUser = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty())
        return next(new appError().createError(400, result.array()));
    const { email, password } = req.body;
    const user = await User.findOne({ email});
    if (!user)
        return next(new appError().createError(404, "User does not exist"));
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
        return next(new appError().createError(400, "Invalid password"));
    const { accesstoken, refreshtoken } = generateTokens(user);
    user.refreshToken = refreshtoken;
    user.save();
    res.cookie("refreshToken", refreshtoken, { httpOnly: true});
    res.jsend.success({ email: user.email, accessToken: accesstoken});
});

const logoutUser = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    if (!refreshToken)
        return next(new appError().createError(403, "Forbidden"));
    try{
        const decodedJwt = jwt.verify(refreshToken, process.env.Refresh_JWT_SECRET);
        const user = await User.findById(decodedJwt._id);
        if (!user)
            return next(new appError().createError(403, "Forbidden"));
        user.refreshToken = "";
        user.save();
        res.clearCookie("refreshToken", { httpOnly: true});
        res.jsend.success("Logged out successfully");
    } catch(err) {
        if (err.name === 'TokenExpiredError') {
            return next(new appError().createError(401, "Refresh token expired , So You are logged out"));
        } else {
            return next(new appError().createError(403, "Forbidden"));
        }
    }
});

module.exports = { getAllUsers, registerUser, loginUser, logoutUser };