import {
  PGVectorStore
} from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PoolConfig } from "pg";
import { collectionsSchema } from "../models/schema/colections";

const hnswConfig = {
  postgresConnectionOptions: {
    type: process.env.DATABASE_type,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: "api",
  } as PoolConfig,
  ...collectionsSchema
};

export const hnswPgVectorStore = async () => {
  // Use Gemini embeddings (768 dimensions by default)
  const hnswPgVectorStore = await PGVectorStore.initialize(
    new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",  // Recommended model
    }),
    hnswConfig
  );

  // Create index for Gemini dimensions (not OpenAI's 1536)
  await hnswPgVectorStore.createHnswIndex({
    dimensions: 768,              // Gemini embedding size
    efConstruction: 64,
    m: 16,
  });

  return hnswPgVectorStore;
}

