import { AiChatContentViewModelInterface } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";


export class AiChatService {
    private langChainAgentModel: ChatOllama;

    constructor() {
        this.langChainAgentModel = new ChatOllama({
            model: process.env.AI_MODEL,
            temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
            baseUrl: process.env.AI_URL,
        });
    }

    async getChatResponse(data: AiChatContentViewModelInterface): Promise<ReadableStream> {
        const agent = createAgent({
            model: this.langChainAgentModel,
            // tools: [],
            // systemPrompt: ""
        });

        const stream = await agent.stream(
            {
                messages: data.messages,
            },
            {
                streamMode: "updates"  // Streams after each agent step (model → tools → model)
            });

        // for await (const chunk of stream) {
        //     const [, content] = Object.entries(chunk)[0];
        //     console.log(content);
        // }

        return stream;
    }
}