import { GoogleGenAI } from "@google/genai";

class AIClient {
  private apiKey: string;
  public GoogleGenAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.GoogleGenAI = new GoogleGenAI({ apiKey: this.apiKey });
  }
}
export default AIClient;
