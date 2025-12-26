import dataValidation from "@/library/data_validator";
import Errors from "@/library/error_handler";

export async function POST(request: Request) {
  try {
    const validData = await dataValidation
    .apiData(BrandViewModel, request);

    const result = await new Service(request)
    .insert(validData);

    return new Response(JSON.stringify(result.id), { status: 200 });
  }
  catch (error) {
    return Errors.throwError(error as Errors);
  }
}