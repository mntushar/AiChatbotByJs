import { z } from "zod";

export const AiChatContentViewModel = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1, "Message content is required"),
  })),
  deepReserch: z.boolean().optional().default(false),
});

export type AiChatContentViewModelInterface =
  z.infer<typeof AiChatContentViewModel>;
