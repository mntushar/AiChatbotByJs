import { hnswPgVectorStore } from "@/repository/db/db_connection_langchain";
import { AiChatContentViewModelInterface } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { DocumentInterface } from "@langchain/core/documents";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { ChatOllama } from "@langchain/ollama";
import { createAgent, HumanMessage, tool, ToolRuntime } from "langchain";

export class AiChatService {
    private langChainAgentModel: ChatOllama;

    constructor() {
        this.langChainAgentModel = new ChatOllama({
            model: process.env.AI_MODEL,
            temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
            baseUrl: process.env.AI_URL,
        });
    }

    async getData(
        data: string,
        isDeepReserch: boolean): Promise<DocumentInterface<Record<string, any>>[]> {
        const store = await hnswPgVectorStore();
        const result = await store.similaritySearch(
            data, isDeepReserch ? parseInt(process.env.DEEP_REFRESH_LIMIT || "3") : 3);
        return result;
    }

    async getReadableStream(stream: IterableReadableStream<any>): Promise<ReadableStream> {
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

    async getAgentChatResponse(data: AiChatContentViewModelInterface): Promise<ReadableStream> {
        const messages = data?.messages || [];
        const query = messages[messages.length - 1]?.content || "";
        const contextDocs = await this.getData(query, data.deepReserch);

        let prompt: string;
        if (contextDocs.length !== 0) {
            const context = contextDocs.map(doc => doc.pageContent).join("\n\n");
            prompt = `Context: ${context}\n\nUser: ${query}\n\nAnswer using the context only:`;
        } else {
            prompt = query;
        }

        // Use HumanMessage for proper chat format
        const stream = await this.langChainAgentModel.stream([new HumanMessage(prompt)]);

        return await this.getReadableStream(stream);
    }

    // async getAgentChatResponse(data: AiChatContentViewModelInterface): Promise<ReadableStream> {
    //     const messages = data?.messages || [];
    //     const query = messages[messages.length - 1]?.content || "";
    //     const contextDocs = await this.getData(query, data.deepReserch);

    //     const context = contextDocs.map(doc => doc.pageContent).join("\n\n");

    //     let prompt: string = "";
    //     if(contextDocs.length !== 0) {
    //         prompt = `Context: ${context}\n\nUser: ${query}\n\nAnswer using the context:`;
    //     }
    //     else{
    //         prompt = `User: ${query}`;
    //     }


    //     const stream = await this.langChainAgentModel.stream(prompt);

    //     return await this.getReadableStream(stream);
    // }

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

        return await this.getReadableStream(stream);
    }
}