import express from 'express';
import * as bookController from "../controllers/books.controller";
const router = express.Router();


router.route('/')
       .get(bookController.getAllBook)
       .post(bookController.createCourse);


router.route('/:id')
.get(bookController.getBookById)
.put(bookController.updateCourse)
.delete(bookController.deleteCourse);

export default router;