import express from 'express';
import * as userController from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/forget-password', userController.forgetPassword);
userRouter.post('/reset-password/:token', userController.resetPassword);

export default userRouter;