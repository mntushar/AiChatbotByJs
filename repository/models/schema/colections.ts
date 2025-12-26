import { DistanceStrategy } from "@langchain/community/vectorstores/pgvector";
import { collectionsSharedAttributes } from "../shared/collections/collections_shared_attributes";

export const collectionsSchema = {
    tableName: "Collections",
    columns: {
        ...collectionsSharedAttributes
    },
    distanceStrategy: "cosine" as DistanceStrategy,
}