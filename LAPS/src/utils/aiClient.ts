import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import PineconeClient from "./pineconeClient.js";
import promptTemplates from "./promptTemplates.js";

class AIClient {
  private GoogleGenerativeAIEmbeddings: GoogleGenerativeAIEmbeddings;
  private llm: ChatGoogleGenerativeAI;

  constructor(apiKey: string, embeddingModel: string) {
    this.GoogleGenerativeAIEmbeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: String(apiKey),
      model: String(embeddingModel),
    });
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: String(process.env.GEMINI_API_KEY),
      model: String(process.env.LLM_MODEL),
      temperature: 0,
    });
  }

  // separate method to allow using different indexes if needed
  async createPineconeVectorStore(apiKey: string, indexName: string) {
    const pineconeIndex = new PineconeClient(String(apiKey)).pinecone.Index(
      String(indexName)
    );
    return new PineconeStore(this.GoogleGenerativeAIEmbeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
  }

  async embedText(text: string): Promise<number[]> {
    const response = await this.GoogleGenerativeAIEmbeddings.embedDocuments([
      text,
    ]);
    return response?.[0] || [];
  }

  async answerLaptopQuestion(question: string): Promise<string> {
    const pineconeStore = await this.createPineconeVectorStore(
      String(process.env.PINECONE_API_KEY),
      String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME)
    );

    const retrievedDocs = await pineconeStore.similaritySearch(question, 1);
    const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("\n");

    const messages = await promptTemplates.laptopQuestion.invoke({
      question: question,
      context: docsContent,
    });

    const answer = await this.llm.invoke(messages);
    return answer.content.toString();
  }
}
export default AIClient;
