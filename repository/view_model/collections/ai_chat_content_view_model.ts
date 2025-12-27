import { z } from "zod";

export const AiChatContentViewModel = z.object({
  messages: z.any(),
  deepReserch: z.boolean().optional().default(false),
});

export type AiChatContentViewModelInterface =
  z.infer<typeof AiChatContentViewModel>;
