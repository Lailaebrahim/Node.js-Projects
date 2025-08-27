import crypto from "crypto";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";
import { signToken, setJWTCookie, removeJWTCookie } from "../utils/authTokens.js";
import AppError from "../utils/appError.js";
import IUser from "../types/user.interface.js";
import { forgetPassword } from "../helpers/emailTemplates.js";
import sendEmail from "../utils/emailClient.js";
import filterObject from "../helpers/filterObject.js";

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

      // const token = signToken({ id: user.id }, { expiresIn: "7d" });

      const { role, password, ...sendUser } = user;
      res
        .status(201)
        .json({ status: "success", message: "You Signed Up Successfully! Login with your credentials", data: { user: sendUser } });
    }
  );

  login = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError("You Must Insert Email and Password !", 400));
      }

      const user = (await User.findOne({ email }).select("+password")) as IUser;
      if (!user || !(await user.validatePassword(password))) {
        return next(new AppError("Invalid Email or Password!", 401));
      }

      const jwtToken = signToken({ id: user.id }, { expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d" });

      setJWTCookie(res, jwtToken);

      res.status(200).json({ status: "success", message: "Login successful" });
    }
  );

  // for the logout it's not logical to not expire the jwt token after logging out there must be some way to enhnace this
  logout = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const currUser = (await User.findById(req.user?.id).select(
        "+password"
      )) as IUser;
      if (!currUser)
        return next(
          new AppError("You Don't Have Access to Do This Action!", 401)
        );

      req.user = undefined;
      removeJWTCookie(res);
      
      res.status(200).json({
        status: "success",
        data: {},
      });
    }
  );

  forgetPassword = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = (await User.findOne({ email: req.body.email })) as IUser;
      if (!user)
        return next(new AppError("No User With Email Was Found!!", 404));

      const userToken = await user?.resetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const resetLink = `${req.protocol}://${req.host}/api/v1/reset-password/${userToken}`;
      const message = forgetPassword.replace(/{{resetLink}}/g, resetLink);

      // try {
      //   await sendEmail({
      //     to: user.email,
      //     subject: "Password Reset Request",
      //     html: message,
      //   });

      //   res
      //     .status(200)
      //     .json({ status: "success", message: "Password reset email sent!" });
      // } catch (err) {
      //   user.passwordResetToken = undefined;
      //   user.passwordResetExpires = undefined;

      //   next(new AppError("Couldn't Send Password Reset Email!", 500));
      // }

      res.status(200).json({
        status: "success",
        data: {
          resetToken: (process.env.NODE_ENV === "development" && userToken) || "Check Your Email to Reset Your Password", 
        },
      });
    }
  );

  resetPassword = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { password, confirmPassword } = req.body;
      const token = req.params.token;
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = (await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gte: Date.now() },
      })) as IUser;

      if (!user)
        return next(new AppError("Token Is Invalid Or Expired!!", 403));

      user.password = password;
      user.confirmPassword = confirmPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      res.status(200).json({
        status: "success",
        message: "Password Changed Successfully ! You Can Login Now."
      });
    }
  );

  updatePassword = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.body.currentPassword ||
        !req.body.newPassword ||
        !req.body.newPasswordConfirm
      ) {
        return next(new AppError("All password fields are required!", 400));
      }
      // selecting password as by in schema i defined them with select false for security
      const currUser = (await User.findById(req.user?.id).select(
        "+password"
      )) as IUser;
      if (!currUser)
        return next(
          new AppError("You Don't Have Access to Do This Action!", 401)
        );

      if (!(await currUser.validatePassword(req.body.currentPassword))) {
        return next(new AppError("Invalid Password !", 401));
      }

      currUser.password = req.body.newPassword;
      currUser.confirmPassword = req.body.newPasswordConfirm;
      await currUser.save();

      req.user = undefined;
      removeJWTCookie(res);

      res.status(200).json({
        status: "success",
        message: "Your Password Updated Successfully! Login Again!",
      });
    }
  );

  updateUserData = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.password || req.body.confirmPassword)
        return next(
          new AppError("This endpoint is not for updating the password", 400)
        );

      const filteredBody = filterObject(req.body, "name", "email");

      const currUser = (await User.findByIdAndUpdate(
        req.user?.id,
        filteredBody,
        { new: true }
      )) as IUser;

      if (!currUser)
        return next(
          new AppError("You Don't Have Access to Do This Action!", 401)
        );

      res.status(200).json({
        status: "success",
        message: "User data updated successfully",
      });
    }
  );

  deleteUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const currUser = (await User.findByIdAndDelete(req.user?.id)) as IUser;

      if (!currUser)
        return next(
          new AppError("You Don't Have Access to Do This Action!", 401)
        );

      req.user = undefined;
      removeJWTCookie(res);

      res.status(204).json({
        status: "success",
      });
    }
  );

  deactivateUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const currUser = (await User.findByIdAndUpdate(req.user?.id, {
        active: false,
      })) as IUser;

      if (!currUser)
        return next(
          new AppError("You Don't Have Access to Do This Action!", 401)
        );

      req.user = undefined;
      removeJWTCookie(res);

      res.status(204).json({
        status: "success",
        message: "Your Account Has Been Deactivated Sucessfully ! Login Again to Activate it.",
      });
    }
  );

  activateUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError("You Must Insert Email and Password !", 400));
      }

      const user = (await User.findOne({ email }, null, {
        includeInactive: true,
      }).select("+password")) as IUser;
      if (!user || !(await user.validatePassword(password))) {
        return next(new AppError("Invalid Email or Password!", 401));
      }

      if (user.active) {
        res.status(200).json({
          status: "success",
          message: "Your Account is Already Active!",
        });
        return;
      }

      user.active = true;
      await user.save({ validateBeforeSave: false });

      res.status(204).json({
        status: "success",
        message: "Your Account Has Been Activate Sucessfully ! Login Again.",
      });
    }
  );
}

const userController = new UserController();
export default userController;
