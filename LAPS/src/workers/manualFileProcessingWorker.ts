import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { readFileSync } from "fs";
import pdfParser from "pdf-parse";
import { fileURLToPath } from "url";
import { extname, join, dirname } from "path";
import PineconeClient from "../utils/pineconeClient.js";
import AIClient from "../utils/aiClient.js";
import DatabaseClient from "../utils/dbClient.js";
import Laptop from "../models/laptop.model.js";

const manualFileProcessingWorker = new Worker(
  "manualFileProcessingQueue",
  async (job) => {
    console.log("manual file processing worker");
    const { fileName, ID } = job.data;
    const dirPath = fileURLToPath(dirname(import.meta.url));
    const filePath = join(
      dirPath,
      `../${process.env.MANUAL_FILES_PATH}/laptops/`,
      fileName
    );

    // read the PDF file
    const readBuffer = readFileSync(filePath);
    const data = await pdfParser(readBuffer);

    try {
      // init ai client and send text to gemini for embedding
      const aiClient = new AIClient(String(process.env.GEMINI_API_KEY));
      const response = await aiClient.GoogleGenAI.models.embedContent({
        model: "gemini-embedding-001",
        contents: data.text,
      });

      // init pinecone client and check if index exists
      const pineconeClient = new PineconeClient(
        String(process.env.PINECONE_API_KEY)
      );
      const indexList = await pineconeClient.pinecone.listIndexes();
      const indexName = String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME);
      if (!indexList.indexes?.some((index) => index.name === indexName)) {
        await pineconeClient.pinecone.createIndex({
          name: indexName,
          dimension: 3072, //matches the embedding dimension
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        });
      }

      // upsert the embedded data into pinecone
      const records = [
        {
          id: ID,
          values: response?.embeddings?.[0]?.values || [],
          metadata: { fileName, id: ID },
        },
      ];
      const index = pineconeClient.pinecone.Index(indexName);
      await index.upsert(records);
      // console.log("Data successfully processed and stored in Pinecone.");


      // update the database with the fileName and vectorized status
      const dbClient = new DatabaseClient(String(process.env.DB));
      await dbClient.connect();
      await Laptop.findByIdAndUpdate(ID, {
        manual: { fileName, vectorized: true },
      });
      await dbClient.disconnect();
      // console.log("Database updated successfully.");

      // return the processed fileName and status
      return { fileName, status: "processed" };

    } catch (error: any) {
      // console.error("Error processing file:", error);
      throw new Error(`Failed to process file ${fileName}: ${error.message}`);
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

manualFileProcessingWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

manualFileProcessingWorker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

export default manualFileProcessingWorker;
