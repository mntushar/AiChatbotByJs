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
        });

        const stream = await agent.stream(
            {
                messages: data.messages,
            },
            {
                streamMode: "messages"
            }
        );

        return new ReadableStream({
            async start(controller) {
                try {
                    for await (const [token, metadata] of stream) {
                        const chunk = {
                            node: metadata.langgraph_node,
                            token: token
                        };

                        controller.enqueue(chunk);
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });
    }
}