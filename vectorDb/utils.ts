import { collection } from ".";
import { JSONAPIUpdateResult } from "@datastax/astra-db-ts/dist/collections/collection";
import { JournalMetadata } from "@/utils/types";

export async function insertEmbeddings(
  {
    createdAt,
    date,
    id,
    mood,
    sentiment,
    subject,
    summery,
    updatedAt,
    userId,
  }: JournalMetadata,
  embeddings: { chunk: string; embedding: number[] }[],
) {
  return (await collection.insertMany(
    embeddings.map(({ chunk, embedding }) => ({
      $vector: embedding,
      chunk_of_journal: chunk,
      journal_date: new Date(date).toDateString(),
      created_at: new Date(createdAt).toISOString(),
      updated_at: new Date(updatedAt).toISOString(),
      journal_subject: subject,
      journal_summery: summery,
      journal_sentiment_score: sentiment,
      journal_mood: mood,
      journal_entry_id: id,
      user_id: userId,
    })),
  )) as {
    acknowledged: boolean;
    insertedCount: number;
    insertedIds: string[];
  };
}

export async function deleteEmbeddings(userId: string, journalEntryId: string) {
  return await collection.deleteMany({
    journal_entry_id: journalEntryId,
    user_id: userId,
  });
}

export async function mutateEmbeddingsMetadataDate(
  date: Date,
  userId: string,
  journalEntryId: string,
) {
  return (await collection.updateMany(
    {
      journal_entry_id: journalEntryId,
      user_id: userId,
    },
    { $set: { journal_date: date.toDateString() } },
  )) as JSONAPIUpdateResult;
}
