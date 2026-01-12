import dataValidation from "@/library/data_validator";
import Errors from "@/library/error_handler";
import { AiChatContentViewModel } from "@/repository/view_model/collections/ai_chat_content_view_model";
import { AiChatService } from "@/service/ai_chat";

export async function POST(request: Request) {
  try {
    const validData = await dataValidation
      .apiData(AiChatContentViewModel, request);

    const stream = await new AiChatService()
      .getAgentChatResponse(validData);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }
  catch (error) {
    return Errors.throwError(error as Errors);
  }
}