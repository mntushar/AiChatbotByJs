import dataValidation from "@/library/data_validator";
import Errors from "@/library/error_handler";
import { AiChatContentViewModel } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { AiChatService } from "@/service/ai_chat";

export async function POST(request: Request) {
  try {
    const validData = await dataValidation
      .apiData(AiChatContentViewModel, request);

    const stream = await new AiChatService()
      .getChatResponse(validData);

    const transformStream = new TransformStream({
      async transform(chunk: any, controller) {
        const content = chunk.token?.content || "";
        
        const transformed = {
          role: "assistant",
          content: content,
          node: chunk.node,
          deepResearch: false
        };
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(transformed)}\n\n`)
        );
      }
    });

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }
  catch (error) {
    return Errors.throwError(error as Errors);
  }
}