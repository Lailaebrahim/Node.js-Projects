import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";
import { signToken } from "../utils/authTokens.js";
import AppError from "../utils/appError.js";

class UserController {
  signup = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });
      // const user = await User.create(req.body);

      const token = signToken({ id: user.id }, { expiresIn: "7d" });

      const { role, ...sendUser } = user;
      res
        .status(201)
        .json({ status: "success", token, data: { user: sendUser } });
    }
  );

  login = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError("You Must Insert Email and Password !", 400));
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await (user as any).validatePassword(password))) {
        return next(new AppError("Invalid Email or Password!", 401));
      }

      const token = signToken({ id: user.id }, { expiresIn: "7d" });

      res.status(200).json({ status: "success", token });
    }
  );
}

const userController = new UserController();
export default userController;
