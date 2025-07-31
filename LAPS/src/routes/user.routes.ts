import router from 'express';
import userController from '../controllers/user.controller.js'

const userRouter = router.Router();

userRouter
.route('/signup')
.post(userController.signup);


userRouter
.route('/login')
.post(userController.login);


export default userRouter;