import prisma from '../prisma/dbConnection';
import APIFeatures from '../utils/apiFeatures';

export const getAllBook = async (req, res) => {
    try{
        const filters = req.query;
        // .sort().limitFields().paginate()
        const query = new APIFeatures(filters).filter().sort().selectFields().paginate().query;

        const books = await prisma.book.findMany(
            {
                ...query
            }
        );
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBookById = async (req, res) => {
    const { id } = req.params;
    try{
        const book = await prisma.book.findUnique({
            where: { id: id },
        });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCourse = async(req, res)=>{
    const {title, authorId, genre, year} = req.body;
    try{
        const newBook = await prisma.book.create({
            data:{
                title,
                authorId,
                genre,
                year
            },
            include:{
                author: true,
            }
        });
        res.status(201).json({status: "success", data: newBook});
    } catch(e){
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }

};

export const updateCourse = async(req, res)=>{
    const id = req.params.id;
    const {title, authorId, genre, year} = req.body;
    try{
        const newBook = await prisma.book.update({
            where:{ id: id},
            data: {
                title,
                authorId,
                genre,
                year
            },
            include:{
                author: true
            }
        });
        res.status(200).json({status: "success", data: newBook});
    } catch(e){
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }

};

export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try{
        const book = await prisma.book.delete({
            where: { id: id },
        });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json(null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};