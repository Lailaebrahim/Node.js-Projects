import express from 'express';
import * as bookRoutes from './book.route';
const router = express.Router();


router.use('/books', bookRoutes.default);
export default router;