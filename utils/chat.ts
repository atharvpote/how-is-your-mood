import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Journal } from "@prisma/client";
import { Message } from "./types";

export async function chat(
  messages: Omit<Message, "id">[],
  entries: Journal[],
) {
  if (!messages.length) throw new Error("Messages is null");

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0,
    cache: true,
  });

  const { content: summery } = await chat.invoke(
    `Summarize conversation between "$$" signs least amount of words possible as search term for semantic search. $$
  ${messages.map(({ role, message }) => role + ": " + message).join("\n")}$$`,
  );

  const documents = entries.map(
    ({ content, id, createdAt, date, updatedAt }) =>
      new Document({
        pageContent: content,
        metadata: { id, createdAt, "entry date": date, updatedAt },
      }),
  );

  const store = await MemoryVectorStore.fromDocuments(
    documents,
    new OpenAIEmbeddings(),
  );

  const context = await store.similaritySearch(summery.toString());

  const { content } = await chat.invoke([
    new SystemMessage(
      `Respond using provided context. Context: ${context
        .map(({ pageContent }) => pageContent)
        .join("\n")}`,
    ),
    ...messages.map(({ role, message }) =>
      role === "ai" ? new AIMessage(message) : new HumanMessage(message),
    ),
  ]);

  return content.toString();
}
