import { ChatOpenAI, OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Message } from "ai/react";
import { z } from "zod";
import { Journal } from "@prisma/client";

export async function analyze(content: string) {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      mood: z.string().describe("Mood of person who wrote journal"),
      subject: z.string().describe("Subject of journal"),
      summery: z
        .string()
        .describe("Summarize journal in least amount of words."),
      emoji: z.string().describe("Emoji that represents mood of journal"),
      sentiment: z
        .number()
        .describe("Sentiment of journal on scale of -10 to 10."),
    }),
  );

  return PromptTemplate.fromTemplate(
    "Analyze journal entry, follow instructions and format response to match format instructions.\n\nInstructions: {format_instructions}\n\nEntry: {entry}",
  )
    .pipe(
      new OpenAI({
        temperature: 0,
        modelName: "gpt-3.5-turbo-1106",
        cache: true,
      }),
    )
    .pipe(parser)
    .invoke({
      entry: content,
      format_instructions: parser.getFormatInstructions(),
    });
}

export async function chat(
  messages: Omit<Message, "id">[],
  entries: Journal[],
) {
  const currentMessage = messages[messages.length - 1];

  if (!currentMessage) throw new Error("Chat is empty");

  const previousChatHistory = messages
    .slice(0, -1)
    .map(({ content, role }) => `${role}:${content}`)
    .join("\n");

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-1106",
    cache: true,
  });

  const { content: searchTerm } = await PromptTemplate.fromTemplate(
    "Summarize current conversation as search term for semantic search.\n\nCurrent conversation:{chat_history}",
  )
    .pipe(model)
    .invoke({
      chat_history:
        previousChatHistory +
        `\n${currentMessage.role}:${currentMessage.content}`,
    });

  const store = await MemoryVectorStore.fromDocuments(
    entries.map(
      ({ content, id, createdAt, date, updatedAt }) =>
        new Document({
          pageContent: content,
          metadata: { id, createdAt, "entry date": date, updatedAt },
        }),
    ),
    new OpenAIEmbeddings(),
  );

  const documents = await store.similaritySearch(searchTerm.toString(), 1);

  const context = documents
    .map(({ pageContent, metadata }) => {
      const date = metadata["entry date"] as Date;

      return `Date: ${date.toDateString()}\nContent: ${pageContent}`;
    })
    .join("\n");

  return PromptTemplate.fromTemplate(
    "You're a helpful assistant. Use chat history and context to respond.\n\nChat history: {chat_history}\n\nCurrent message : {current_message}\n\nContext: {context}",
  )
    .pipe(model)
    .pipe(new BytesOutputParser())
    .stream({
      chat_history: previousChatHistory,
      current_message: currentMessage.content,
      context,
    });
}
