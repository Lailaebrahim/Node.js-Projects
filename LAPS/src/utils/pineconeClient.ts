import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

class PineconeClient {
  public pinecone: Pinecone;

  constructor(pineconeKey: string) {
    this.pinecone = new Pinecone({
      apiKey: String(pineconeKey),
    });
  }

  async getIndex(indexName: string) {
    const indexList = await this.pinecone.listIndexes();
    if (!indexList.indexes?.some((index) => index.name === indexName)) {
      await this.pinecone.createIndex({
        name: indexName,
        dimension: parseInt(process.env.EMBEDDING_DIMENSION || "768"), //matches the embedding dimension of embedding model used
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
    }
    return this.pinecone.Index(indexName);
  }

  async createPineconeVectorStore(
    indexName: string,
    embeddingService: EmbeddingsInterface,
    pineconeStoreOptions: any = {}
  ) {
    const pineconeIndex = this.pinecone.Index(String(indexName));
    return new PineconeStore(embeddingService, {
      pineconeIndex,
      ...pineconeStoreOptions,
    });
  }
}
export default PineconeClient;
