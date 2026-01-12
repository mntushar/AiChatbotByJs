import dataValidation from "@/library/data_validator";
import Errors from "@/library/error_handler";
import { CollectionInputViewModel } from "@/repository/view_model/collections/collections";
import { AiChatService } from "@/service/ai_chat";

export async function POST(request: Request) {
  try {
    const validData = await dataValidation
      .apiData(CollectionInputViewModel, request);

    const result = await new AiChatService()
      .setData(validData);

    return new Response(JSON.stringify(result), { status: 200 });
  }
  catch (error) {
    return Errors.throwError(error as Errors);
  }
}