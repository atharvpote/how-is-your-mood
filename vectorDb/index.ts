import { AstraDB } from "@datastax/astra-db-ts";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { OpenAIEmbeddings } from "@langchain/openai";

const vectorDb = new AstraDB(
  process.env.ASTRA_DB_APPLICATION_TOKEN,
  process.env.ASTRA_DB_ENDPOINT,
);

export const collection = await vectorDb.collection(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.ASTRA_DB_COLLECTION!,
);

export const openAIEmbeddings = new OpenAIEmbeddings();

export const langchainVectorStore = await AstraDBVectorStore.fromExistingIndex(
  openAIEmbeddings,
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    endpoint: process.env.ASTRA_DB_ENDPOINT!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    collection: process.env.ASTRA_DB_COLLECTION!,
    collectionOptions: {
      vector: {
        dimension: 1536,
        metric: "cosine",
      },
    },
  },
);
