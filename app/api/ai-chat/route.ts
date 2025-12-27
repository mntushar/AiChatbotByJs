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

    const transformStream = new TransformStream<{
      model_request: {
        messages: { content: string }[];
      };
    }, string>({
      async transform(
        chunk: { model_request: { messages: { content: string }[] } },
        controller
      ) {
        const transformed = {
          messages: chunk.model_request.messages.map(msg => ({
            role: "assistant",
            content: msg.content
          })),
          deepReserch: false
        };

        controller.enqueue(JSON.stringify(transformed));
      }
    });

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }
  catch (error) {
    return Errors.throwError(error as Errors);
  }
}