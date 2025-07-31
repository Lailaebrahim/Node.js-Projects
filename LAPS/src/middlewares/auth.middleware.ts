import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";
import {verfiyToken} from "../utils/authTokens.js";
import User from "../models/user.model.js";


export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    // token existenance
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('No Authorization', 401));
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return next(new AppError('Please login to get access 1', 401));
    }

    const decoded = verfiyToken(token, {});
    
    // user existance
    const currUser = await User.findById((decoded as any).id);
    if(!currUser) return next(new AppError("Non-existent User !", 401));

    // check if password changed after issuing the jwt
    if((currUser as any).changedPasswordAfter((decoded as any).iat)){
        return next(new AppError("Login Session Expired, Login Again !", 401));
    }

    next();
}