import express from 'express';

const userRouter = express.Router();

userRouter.route('/')
    .get((req, res) => {
        res.send('Hello from the user routes');
    })
    .post((req, res) => {
        res.send('You can post to this endpoint');
    });

export default userRouter;