import router from 'express';
import userController from '../controllers/user.controller.js'
import { checkAuth } from '../middlewares/auth.middleware.js';

const userRouter = router.Router();

userRouter
.route('/signup')
.post(userController.signup);

userRouter
.route('/login')
.post(userController.login);

userRouter
.route('/logout')
.get(checkAuth, userController.logout);

userRouter
.route('/forget-password')
.post(userController.forgetPassword);

userRouter
.route('/reset-password/:token')
.patch(userController.resetPassword);

userRouter
.route('/update-password')
.patch(checkAuth, userController.updatePassword);

userRouter
.route('/update-my-data')
.patch(checkAuth, userController.updateUserData);

userRouter
.route('/')
.delete(checkAuth, userController.deleteUser);

userRouter
.route('/deactivate-account')
.get(checkAuth, userController.deactivateUser);

userRouter
.route('/activate-account')
.patch(userController.activateUser);

export default userRouter;