import {
  PGVectorStore
} from "@langchain/community/vectorstores/pgvector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PoolConfig } from "pg";
import { collectionsSchema } from "../models/schema/colections";

const hnswConfig = {
  postgresConnectionOptions: {
    type: process.env.DATABASE_type,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: "AiAgent",
  } as PoolConfig,
  ...collectionsSchema
};

export const hnswPgVectorStore = async () => {
  const hnswPgVectorStore = await PGVectorStore.initialize(
    new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: process.env.AI_URL,
    }),
    hnswConfig
  );

  await hnswPgVectorStore.createHnswIndex({
    dimensions: 768,
    efConstruction: 64,
    m: 16,
  });

  return hnswPgVectorStore;
}

