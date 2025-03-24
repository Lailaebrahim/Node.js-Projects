import express from "express";
import * as userController from "../controllers/user.controller.js";
import * as authController from "../controllers/auth.controller.js";

const userRouter = express.Router();

userRouter.get('/', userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/forget-password", userController.forgetPassword);
userRouter.patch("/reset-password/:token", userController.resetPassword);
userRouter.patch(
    "/update-my-password",
    authController.protect,
    userController.updateMyPassword
);
userRouter.patch(
    "/update-me",
    authController.protect,
    userController.updateMe
);
userRouter.delete(
    "/delete-me",
    authController.protect,
    userController.deleteMe
);

export default userRouter;