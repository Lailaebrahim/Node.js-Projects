import { Pinecone } from "@pinecone-database/pinecone";

class PineconeClient {
  private pineconeKey: string;
  public pinecone: Pinecone;

  constructor(pineconeKey: string) {
    this.pineconeKey = pineconeKey;
    this.pinecone = new Pinecone({
      apiKey: this.pineconeKey,
    });
  }
}
export default PineconeClient;
