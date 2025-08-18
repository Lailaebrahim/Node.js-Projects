
import { PromptTemplate } from "@langchain/core/prompts";


const promptTemplates = {
  laptopQuestion: new PromptTemplate({
    inputVariables: ["question", "context"],
    template: `
      You are an assistant to answer questions about laptops. Answer the question based on the context provided which is a data about the laptop read from its manual file. If you don't know the answer, say that you didn't find the exact answer to the question and provide a general answer based on your knowledge.

      Important: Provide your response as plain text only, without any markdown formatting, bold text, italics, or special characters.

      Context: {context}
      Question: {question}
    `,
  }),
};

export default promptTemplates;
