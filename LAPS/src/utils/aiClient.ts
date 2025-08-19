import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

class AIClient {
    public llm: any;

    constructor(llmModel: string, apiKey: string) {
        this.llm = new ChatGoogleGenerativeAI({
            model: llmModel,
            apiKey: apiKey,
        });
    }
}

export default AIClient;