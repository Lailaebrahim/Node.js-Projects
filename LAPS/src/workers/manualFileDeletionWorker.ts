import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import PineconeClient from "../utils/pineconeClient.js";


const manualFileDeletionQueue = new Worker(
  "manualFileDeletionQueue",
  async (job) => {
    console.log("deletion job excuting");
    const { fileName, ID } = job.data;
    const dirPath = fileURLToPath(dirname(import.meta.url));
    
    if (!process.env.MANUAL_FILES_PATH) {
      throw new Error("MANUAL_FILES_PATH environment variable is not defined");
    }
    
    const filePath = join(
      dirPath,
      `../${process.env.MANUAL_FILES_PATH}/laptops/`,
      fileName
    );

    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log("file deleted");
      } else {
        console.log("File Do Not Exist");
      }

      // init pinecone client and check if index exists
      const pineconeClient = new PineconeClient(
        String(process.env.PINECONE_API_KEY)
      );
      const indexList = await pineconeClient.pinecone.listIndexes();
      const indexName = String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME);
      if (!indexList.indexes?.some((index) => index.name === indexName)) {
            console.log("Pinecone Do Not Exist");
      }

      const index = pineconeClient.pinecone.index(indexName);
      await index.deleteOne(ID);

      console.log("Vector deleted successfully.");

      // return the processed fileName and status
      return { status: "processed" };
    } catch (error: any) {
      console.error("Error processing file:", error);
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

manualFileDeletionQueue.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

manualFileDeletionQueue.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

export default manualFileDeletionQueue;
