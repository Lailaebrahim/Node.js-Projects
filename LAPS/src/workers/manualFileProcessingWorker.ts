import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { readFileSync } from "fs";
import pdfParser from "pdf-parse";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import PineconeClient from "../utils/pineconeClient.js";
import EmbeddingClient from "../utils/embeddingClient.js";
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
      // embed the text using the embedding client
      const embeddingClient = new EmbeddingClient(
        String(process.env.GEMINI_API_KEY),
        String(process.env.EMBEDDING_MODEL)
      );
      const response = await embeddingClient.embedText(data.text);

      // init pinecone client and get the index
      const index = await new PineconeClient(
        String(process.env.PINECONE_API_KEY)
      ).getIndex(String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME));

      // upsert the embedded data into pinecone
      const records = [
        {
          id: ID,
          values: response,
          metadata: { fileName, id: ID, text: data.text },
        },
      ];
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
      host: String(process.env.REDIS_HOST) || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
);

manualFileProcessingWorker.on("completed", (job) => {
  console.log(`file processing ${job.id} has completed!`);
});

manualFileProcessingWorker.on("failed", (job, err) => {
  console.log(`file processing ${job?.id} has failed with ${err.message}`);
});

export default manualFileProcessingWorker;
