import jwt from "jsonwebtoken";

export const signToken = (payload: Object, options?: jwt.SignOptions)=>{
    return jwt.sign({...payload}, String(process.env.JWT_SECRET), options);
}

export const verfiyToken = (token: string, options?: jwt.VerifyOptions)=>{
    const res = jwt.verify(token, String(process.env.JWT_SECRET), options);
    return res;
}