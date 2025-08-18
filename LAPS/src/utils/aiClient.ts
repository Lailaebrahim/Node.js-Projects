import { GoogleGenAI } from "@google/genai";

class AIClient {
  private apiKey: string;
  private GoogleGenAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.GoogleGenAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async embedText(text: string): Promise<number[]> {
    const response = await this.GoogleGenAI.models.embedContent({
        model: String(process.env.EMBEDDING_MODEL),
        contents: text,
      });
    return response?.embeddings?.[0]?.values || [];
  }

}
export default AIClient;
