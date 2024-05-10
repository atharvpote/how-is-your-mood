import { DataAPIClient, VectorDoc } from "@datastax/astra-db-ts";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { OpenAIEmbeddings } from "@langchain/openai";

const { collection, endpoint, token } = getVectorStoreCredentials();

const client = new DataAPIClient(token);
const db = client.db(endpoint);

export const vectorStore = await AstraDBVectorStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  {
    endpoint,
    collection,
    token,
    collectionOptions: {
      checkExists: false,
      vector: { dimension: 1536, metric: "cosine" },
      indexing: {
        allow: ["entry_id", "user_id"],
      },
    },
  },
);

export const vectorCollection = db.collection<JournalVectorDoc>(collection);

interface JournalVectorDoc extends VectorDoc {
  _id: string;
  text: string;
  entry_id: string;
  user_id: string;
}

function getVectorStoreCredentials() {
  const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ENDPOINT } = process.env;

  if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_ENDPOINT)
    throw new Error(
      "Please add ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_ENDPOINT to .env or .env.local",
    );

  return {
    token: ASTRA_DB_APPLICATION_TOKEN,
    endpoint: ASTRA_DB_ENDPOINT,
    collection: getCollection(),
  };
}

function getCollection() {
  if (process.env.VERCEL_ENV === "production") {
    const { ASTRA_DB_COLLECTION } = process.env;

    if (!ASTRA_DB_COLLECTION)
      throw new Error("Please add ASTRA_DB_COLLECTION to .env or .env.local");

    return ASTRA_DB_COLLECTION;
  }

  const { ASTRA_DB_COLLECTION_DEV } = process.env;

  if (!ASTRA_DB_COLLECTION_DEV)
    throw new Error("Please add ASTRA_DB_COLLECTION to .env or .env.local");

  return ASTRA_DB_COLLECTION_DEV;
}
