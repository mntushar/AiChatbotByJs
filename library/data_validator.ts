import { z } from "zod";
import Errors from "./error_handler";

async function apiData<T extends z.ZodTypeAny>(
    schema: T,
    request: Request
): Promise<z.infer<T>> {
    try {
        const data = await request.json();
        const validData = schema.parse(data);
        return validData;
    } catch (error) {
        throw new Errors(error as Error, 400, 'Validation error.');
    }
}

const dataValidation = {
    apiData,
}

export default dataValidation;