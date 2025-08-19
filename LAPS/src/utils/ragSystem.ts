import PineconeClient from "./pineconeClient.js";
import EmbeddingClient from "./embeddingClient.js";
import promptTemplates from "./promptTemplates.js";
import AIClient from "./aiClient.js";

interface RAGConfig {
  apiKey: string;
  embeddingModel: string;
  llmModel: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
}

class RAGSystem {
  private embeddingClient: EmbeddingClient;
  private pineconeClient: PineconeClient;
  private llmClient: AIClient;

  constructor(config: RAGConfig) {
    this.embeddingClient = new EmbeddingClient(
      config.apiKey,
      config.embeddingModel
    );
    this.llmClient = new AIClient(config.llmModel, config.apiKey);
    this.pineconeClient = new PineconeClient(config.pineconeApiKey);
  }

  async answerLaptopQuestion(question: string): Promise<string> {
    // create the pinecone vector store
    const pineconeStore = await this.pineconeClient.createPineconeVectorStore(
      String(process.env.LAPTOPS_MANUAL_FILES_INDEX_NAME),
      this.embeddingClient.embeddings
    );

    // retrive top k similar documents from the vector store
    const retrievedDocs = await pineconeStore.similaritySearch(
      question,
      process.env.LAPTOPS_MANUAL_TOP_K
        ? parseInt(process.env.LAPTOPS_MANUAL_TOP_K)
        : 1
    );
    // concat the content of the retrieved documents
    const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("\n");

    // create the messages for the LLM from the laptopQuestion prompt template
    const messages = await promptTemplates.laptopQuestion.invoke({
      question: question,
      context: docsContent,
    });

    // invoke the LLM with the messages
    const answer = await this.llmClient.llm.invoke(messages);
    return answer.content.toString();
  }

}
export default RAGSystem;
