import { DataAPIClient, VectorDoc } from "@datastax/astra-db-ts";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { OpenAIEmbeddings } from "@langchain/openai";

const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ENDPOINT, ASTRA_DB_COLLECTION } =
  process.env;

if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_ENDPOINT || !ASTRA_DB_COLLECTION)
  throw new Error(
    "Please add ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_ENDPOINT to .env or .env.local",
  );

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT);

export const collection = db.collection<JournalVectorDoc>(ASTRA_DB_COLLECTION);

export const vectorStore = await AstraDBVectorStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  {
    endpoint: ASTRA_DB_ENDPOINT,
    collection: ASTRA_DB_COLLECTION,
    token: ASTRA_DB_APPLICATION_TOKEN,
    collectionOptions: {
      checkExists: false,
      vector: { dimension: 1536, metric: "cosine" },
    },
  },
);

interface JournalVectorDoc extends VectorDoc {
  _id: string;
  text: string;
  entry_id: string;
  user_id: string;
}
