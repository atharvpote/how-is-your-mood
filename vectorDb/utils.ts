import { vectorStore, collection } from ".";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Metadata } from "@/utils/types";
import { Document } from "@langchain/core/documents";

export async function insertVectorDocs(journal: Metadata) {
  const splitter = new RecursiveCharacterTextSplitter();

  const documents = await splitter.splitDocuments(
    [
      new Document({
        pageContent: journal.content,
        metadata: {
          entry_id: journal.id,
          user_id: journal.userId,
        },
      }),
    ],
    {
      chunkHeader: `DATE: ${new Date(journal.date).toDateString()}
SUBJECT: ${journal.subject}
SUMMERY: ${journal.summery}
MOOD: ${journal.mood}
SENTIMENT: ${journal.sentiment?.toString() ?? ""}
      
---
      
`,
      appendChunkOverlapHeader: true,
    },
  );

  await vectorStore.addDocuments(documents);
}

export async function deleteVectorDocs(userId: string, entryId: string) {
  return await collection.deleteMany({
    entry_id: entryId,
    user_id: userId,
  });
}

export async function mutateVectorDocDate(
  date: Date,
  userId: string,
  entryId: string,
) {
  return await collection.updateMany(
    {
      entry_id: entryId,
      user_id: userId,
    },
    { $set: { journal_date: date.toDateString() } },
  );
}
