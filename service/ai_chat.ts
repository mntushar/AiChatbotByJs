import { hnswPgVectorStore } from "@/repository/db/db_connection_langchain";
import { AiChatContentViewModelInterface } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { CollectionViewModelInterface } from "@/repository/view_model/collections/collections";
import { DocumentInterface } from "@langchain/core/documents";
import { ChatOllama } from "@langchain/ollama";
import { createAgent, HumanMessage } from "langchain";

export class AiChatService {
    private langChainAgentModel: ChatOllama;

    constructor() {
        this.langChainAgentModel = new ChatOllama({
            model: process.env.AI_MODEL,
            temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
            baseUrl: process.env.AI_URL,
        });
    }

    async setData(datas: CollectionViewModelInterface[]): Promise<boolean> {
        const store = await hnswPgVectorStore();
        await store.addDocuments(datas);
        return true;
    }

    async getData(
        data: string,
        isDeepReserch: boolean): Promise<DocumentInterface<Record<string, any>>[]> {
        const store = await hnswPgVectorStore();
        const result = await store.similaritySearch(
            data, isDeepReserch ? parseInt(process.env.DEEP_REFRESH_LIMIT || "3") : 3);
        return result;
    }

    async getReadableStream(
        stream: AsyncIterable<any>,
        isDeepReserch: boolean): Promise<ReadableStream<Uint8Array>> {
        const encoder = new TextEncoder();

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                try {
                    for await (const item of stream) {
                        const token = Array.isArray(item) ? item[0] : item;
                        const metadata = Array.isArray(item) ? item[1] : undefined;

                        const content =
                            typeof token === "string"
                                ? token
                                : typeof token?.content === "string"
                                    ? token.content
                                    : "";

                        const payload = {
                            role: "assistant",
                            content,
                            node: metadata?.langgraph_node ?? null,
                            deepResearch: isDeepReserch,
                        };

                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
                        );
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }


    async getReadableStreamForAgent(
        stream: AsyncIterable<any>,
        isDeepReserch: boolean): Promise<ReadableStream<Uint8Array>> {
        const encoder = new TextEncoder();

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const node =
                            chunk?.metadata?.langgraph_node ??
                            chunk?.langgraph_node ??
                            chunk?.node ??
                            null;

                        const token =
                            typeof chunk === "string"
                                ? chunk
                                : typeof chunk?.content === "string"
                                    ? chunk.content
                                    : typeof chunk?.token?.content === "string"
                                        ? chunk.token.content
                                        : typeof chunk?.token === "string"
                                            ? chunk.token
                                            : "";

                        const transformed = {
                            role: "assistant",
                            content: token,
                            node,
                            deepResearch: isDeepReserch,
                        };

                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify(transformed)}\n\n`)
                        );
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
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

        return await this.getReadableStreamForAgent(stream, data.deepReserch);
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

        return await this.getReadableStream(stream, data.deepReserch);
    }
}