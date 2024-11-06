const express = require('express');
const { registerUser, loginUser , getAllUsers} = require('../controller/users');
const { validateUser , validateLogin} = require('../middleware/validator/users');
const allowedTo = require('../middleware/auth/checkRole');
const userRoles = require('../utils/userRoles');
const {uploadAvatar} = require("../utils/fileUpload");


const usersRouter = express.Router();

usersRouter.get('/', allowedTo(userRoles.ADMIN), getAllUsers);

/* register user */
usersRouter.post('/register',validateUser, uploadAvatar.single('avatar'),registerUser);

/* login user */
usersRouter.post('/login', validateLogin, loginUser);


module.exports = usersRouter;
