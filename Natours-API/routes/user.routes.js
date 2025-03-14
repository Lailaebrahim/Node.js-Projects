import express from 'express';
import * as userController from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);

export default userRouter;