import { ChatOpenAI, OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StructuredOutputParser } from "langchain/output_parsers";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";
import { Journal } from "@prisma/client";
import { Message } from "./types";

export async function analyze(content: string) {
  const template = new PromptTemplate({
    template:
      "Analyze journal entry, follow instructions and format response to match format instructions.\nInstructions: {format_instructions}\nEntry: {entry}",
    inputVariables: ["entry"],
    partialVariables: { format_instructions: parser.getFormatInstructions() },
  });

  const prompt = await template.format({ entry: content });

  const model = new OpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-1106",
    cache: true,
  });

  return await parser.parse(await model.invoke(prompt));
}

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    mood: z.string().describe("Mood of person who wrote journal"),
    subject: z.string().describe("Subject of journal"),
    summery: z.string().describe("Short summary of journal."),
    emoji: z.string().describe("Emoji that represents mood of journal"),
    sentiment: z
      .number()
      .describe("Sentiment of journal on scale of -10 to 10."),
  }),
);

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

  const { content: searchTerm } = await chat.invoke(
    `Summarize conversation between "$$" signs as search term for semantic search. $$
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

  const context = await store.similaritySearch(searchTerm.toString());

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
