import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

class EmbeddingClient {
    public embeddings: GoogleGenerativeAIEmbeddings;

    constructor(apiKey: string, embeddingModel: string) {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: String(apiKey),
            model: String(embeddingModel),
        });
    }

    async embedText(text: string): Promise<number[]> {
        const response = await this.embeddings.embedDocuments([text]);
        return response?.[0] || [];
    }

}

export default EmbeddingClient;
