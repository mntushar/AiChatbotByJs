import dataValidation from "@/library/data_validator";
import Errors from "@/library/error_handler";
import { AiChatContentViewModel } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { AiChatService } from "@/service/ai_chat";
import { convertToModelMessages, streamText } from 'ai';

export async function POST(request: Request) {
  try {
    const validData = await dataValidation
      .apiData(AiChatContentViewModel, request);

    const stream = await new AiChatService()
      .getChatResponse(validData);

    // const reader = stream.getReader();
    // let result: { role: string, content: string }[] = [];
    // let done = false;

    // while (!done) {
    //   const { value, done: streamDone } = await reader.read();
    //   done = streamDone;
    //   if (value) {
    //     result.push({ role: 'assistant', content: value.model_request.messages[0].content });
    //   }

    //   return new Response(JSON.stringify({
    //     id: '1',
    //     messages: result,
    //     deepReserch: false,
    //   }), {
    //     status: 200,
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Cache-Control": "no-cache",
    //     }
    //   });
    // }

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const transformed = {
          messages: chunk.model_request.messages.map((msg: any) => ({
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