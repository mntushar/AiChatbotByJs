import { z } from "zod";

export const CollectionViewModel = z.object({
    pageContent: z.string().min(1, "Message content is required"),
    metadata: z.record(z.any()).default({}),
});

export const CollectionInputViewModel = z.array(CollectionViewModel);

export type CollectionViewModelInterface =
  z.infer<typeof CollectionViewModel>;
