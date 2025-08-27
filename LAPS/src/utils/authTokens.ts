import jwt from "jsonwebtoken";
import { Response } from "express";

export const signToken = (payload: Object, options?: jwt.SignOptions) => {
  return jwt.sign({ ...payload }, String(process.env.JWT_SECRET), options);
};

export const verfiyToken = (token: string, options?: jwt.VerifyOptions) => {
  const res = jwt.verify(token, String(process.env.JWT_SECRET), options);
  return res;
};

export const setJWTCookie = (res: Response, token: string) => {
  res.cookie("JWT", token, {
    expires: new Date(
      Date.now() +
        parseInt(String(process.env.JWT_COOKIE_EXPIRES_IN)) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    secure: process.env.NODE_END == "production" ? true : false,
  });
};

export const removeJWTCookie = (res: Response) => {
  res.clearCookie("JWT", {
    httpOnly: true,
    secure: process.env.NODE_END == "production" ? true : false,
  });
};
