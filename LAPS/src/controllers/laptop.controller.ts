import expressAsyncHandler from "express-async-handler";
import Laptop from "../models/laptop.model.js";
import { Request, Response, NextFunction } from "express";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import AIClient from "../utils/aiClient.js";
import PineconeClient from "../utils/pineconeClient.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

class LaptopController {
  getAllLaptops = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("Fetching all laptops with query:", req.query);

      // using APIFeatures to handle filtering, sorting, limiting fields, and pagination
      const features = new APIFeatures(Laptop.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      // executing the query
      const laptops = await features.query;
      console.log("Laptops fetched successfully:", laptops.length);

      res.status(200).json({
        status: "success",
        results: laptops.length,
        data: laptops,
      });
    }
  );

  getLaptopById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.findById(req.params.id);
      if (!laptop) {
        return next(new AppError("No Laptop found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: laptop,
      });
    }
  );

  createLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.create({
        model_name: req.body.model_name,
        brand: req.body.brand,
        processor_name: req.body.processor_name,
        ram: req.body.ram,
        ssd: req.body.ssd,
        hard_disk: req.body.hard_disk,
        operating_system: req.body.operating_system,
        graphics: req.body.graphics,
        screen_size_inches: req.body.screen_size_inches,
        resolution_pixels: req.body.resolution_pixels,
        no_of_cores: req.body.no_of_cores,
        no_of_threads: req.body.no_of_threads,
        spec_score: req.body.spec_score,
        price: req.body.price,
      });

      if (req.file?.filename) {
        laptop.manual = {
          fileName: String(req.file?.filename),
          vectorized: false,
        };
        laptop.save();
      }

      res.status(201).json({
        status: "success",
        data: laptop,
      });
    }
  );

  updateLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const allowedFields: Partial<{
        model_name: string;
        brand: string;
        processor_name: string;
        ram: number;
        ssd: number;
        hard_disk: number;
        operating_system: string;
        graphics: string;
        screen_size_inches: number;
        resolution_pixels: string;
        no_of_cores: number;
        no_of_threads: number;
        spec_score: number;
        price: number;
      }> = {};

      const allowedFieldNames = [
        "model_name",
        "brand",
        "processor_name",
        "ram",
        "ssd",
        "hard_disk",
        "operating_system",
        "graphics",
        "screen_size_inches",
        "resolution_pixels",
        "no_of_cores",
        "no_of_threads",
        "spec_score",
        "price",
      ];

      allowedFieldNames.forEach((field) => {
        if (req.body[field] !== undefined) {
          allowedFields[field as keyof typeof allowedFields] = req.body[field];
        }
      });

      const laptop = (await Laptop.findByIdAndUpdate(
        req.params.id,
        allowedFields,
        {
          new: true,
          runValidators: true,
        }
      )) as any;

      // there is no overlapping in accessing laptop doc and adding both deletion job and file processing job (by calling save method on document)
      // as the worker process don't access or change anython in the database
      // only the file processing job changed the laptop.manual.vectorized filed to true after adding the vectorized doc to pincone index successfully
      if (req.file?.filename && laptop) {
        if (
          laptop.manual.fileName &&
          laptop.manual.fileName !== req.file.filename
        ) {
          await laptop.triggerFileDeletion();
        }
        laptop.manual = {
          fileName: String(req.file.filename),
          vectorized: false,
        };
        await laptop.save();
      }

      if (!laptop) {
        return next(new AppError("No Laptop found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: laptop,
      });
    }
  );

  deleteLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.deleteOne({ _id: req.params.id });
      if (laptop.deletedCount == 0) {
        return next(new AppError("No Laptop found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: {},
      });
    }
  );

  getLaptopsStats = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await Laptop.aggregate([
        {
          $group: {
            // _id is the criteria for grouping the documents
            // in this case, we are grouping by brand
            _id: { brand: "$brand" },
            // the fields below are the aggregated values on the grouped documents
            averageSpecScore: { $avg: "$spec_score" },
            count: { $sum: 1 },
            averagePrice: { $avg: "$price" },
            maxPrice: { $max: "$price" },
            minPrice: { $min: "$price" },
            maxRam: { $max: "$ram" },
            minRam: { $min: "$ram" },
          },
        },
        {
          // the addFields stage is used to add a new field to the output
          // the new field is the brand name to later reomve _id field as a way to rename it
          $addFields: {
            brand: "$_id.brand",
          },
        },
        {
          // the project stage is used to format the output, 0 means exclude the field
          // 1 means include the field
          $project: {
            _id: 0,
          },
        },
        {
          // sorting the output by averageSpecScore in descending order
          // and by brand in ascending order
          // this is the final output of the aggregation pipeline
          // the aggregated fields and the added ones is available in this stage so can be used for sorting
          $sort: { brand: 1, averageSpecScore: -1 },
        },
      ]);
      res.status(200).json({
        status: "success",
        data: stats,
      });
    }
  );

  askAboutLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // 1- question is in the req.body.question
      // 2- question need to be emdedded through the ai client gemini api
      // 3- then the question vector is used to do similarity search to find the vector that semantically contain the answer about that specific laptop
      // 4- write the prompt template the contain the question and the context
      // 5- prompt the llm to get the answer
      // 6- send it back to the user
      const question = String(req.body.question);
      // console.log(question);

      // const aiClient = new AIClient(String(process.env.GEMINI_API_KEY));
      // const questionVector = await aiClient.embedText(question);

      // create pinecone vector store for doing the similarity search
      const pineconeClient = new PineconeClient(
        String(process.env.PINECONE_API_KEY)
      );
      const pineconeIndex = pineconeClient.pinecone.Index(
        String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME)
      );

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: String(process.env.GEMINI_API_KEY),
        model: String(process.env.EMBEDDING_MODEL),
      });

      const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
      });

      const retrievedDocs = await vectorStore.similaritySearch(question, 1);
      const docsContent = retrievedDocs
        .map((doc) => doc.pageContent)
        .join("\n");
      console.log("Raw retrieved doc content:", docsContent);

      // create llm
      const llm = new ChatGoogleGenerativeAI({
        apiKey: String(process.env.GEMINI_API_KEY),
        model: String(process.env.LLM_MODEL),
        temperature: 0,
      });

      // define prompt
      const promptTemplate = new PromptTemplate({
        inputVariables: ["question", "context"],
        template: `
          You are an assistant to answer questions about laptops. Answer the question based on the context provided which is a data about the laptop read from its manual file. If you don't know the answer, say that you didn't find the exact answer to the question and provide a general answer based on your knowledge.
          
          Important: Provide your response as plain text only, without any markdown formatting, bold text, italics, or special characters.
          
          Context: {context}
          Question: {question}
        `,
      });

      // create the template
      const messages = await promptTemplate.invoke({
        question: question,
        context: docsContent,
      });

      const answer = await llm.invoke(messages);

      res.status(200).json({
        status: "success",
        data: answer.content,
      });
    }
  );
}

const laptopController = new LaptopController();
export default laptopController;
