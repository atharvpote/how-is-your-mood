import { ChatOpenAI, OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Message } from "ai/react";
import { z } from "zod";
import { MyScaleStore } from "@langchain/community/vectorstores/myscale";
import { createClient } from "@clickhouse/client";
import { validateNotNull } from "./validator";
import { JournalSelect } from "@/drizzle/schema";

export async function getAiAnalysis(content: string) {
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

  const getAnalysisChain = PromptTemplate.fromTemplate(
    "Analyze journal entry and format response to match format instructions.\n\nInstructions: {format_instructions}\n\nEntry: {entry}",
  )
    .pipe(
      new OpenAI({
        temperature: 0,
        modelName: "gpt-3.5-turbo-0125",
        cache: true,
      }),
    )
    .pipe(parser);

  return getAnalysisChain.invoke({
    entry: content,
    format_instructions: parser.getFormatInstructions(),
  });
}

export async function getChatResponse(
  messages: Omit<Message, "id">[],
  entries: JournalSelect[],
) {
  const currentMessage = messages[messages.length - 1];

  if (!currentMessage) throw new Error("Chat is empty");

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
    cache: true,
  });

  const getSearchTermChain = PromptTemplate.fromTemplate(
    `Summarize current conversation as search term for semantic search.Current conversation:{chat_history}
    Current conversation:{chat_history}`,
  ).pipe(model);

  const previousChatHistory = messages
    .slice(0, -1)
    .map(({ content, role }) => `${role}:${content}`)
    .join("\n");

  const { content: searchTerm } = await getSearchTermChain.invoke({
    chat_history:
      previousChatHistory +
      `\n${currentMessage.role}:${currentMessage.content}`,
  });

  const { host, password, port, username } = getEnv();

  const vectorStore = await MyScaleStore.fromTexts(
    entries.map(({ content }) => content),
    entries.map(({ id, createdAt, date, updatedAt }) => ({
      id,
      createdAt,
      "entry date": date,
      updatedAt,
    })),
    new OpenAIEmbeddings(),
    { host, port, username, password },
  );

  const documents = await vectorStore.similaritySearch(
    searchTerm.toString(),
    1,
  );

  const clickHouseClient = createClient({
    host: `https://${host}:${port}`,
    username,
    password,
  });

  await clickHouseClient.exec({ query: `DROP TABLE vector_table` });

  const context = documents
    .map(({ pageContent, metadata }) => {
      const date = z.string().parse(metadata["entry date"]);

      return `Date: ${date}\nContent: ${pageContent}`;
    })
    .join("\n");

  const getResponseChain = PromptTemplate.fromTemplate(
    `You're a helpful assistant. Use chat history and context to respond to current message.
    Chat history: {chat_history}
    Current message : {current_message}
    Context: {context}`,
  )
    .pipe(model)
    .pipe(new BytesOutputParser());

  return await getResponseChain.stream({
    chat_history: previousChatHistory,
    current_message: currentMessage.content,
    context,
  });
}

function getEnv() {
  const host = process.env.MYSCALE_CLUSTER_URL;
  const port = process.env.MYSCALE_CLUSTER_PORT;
  const username = process.env.MYSCALE_USERNAME;
  const password = process.env.MYSCALE_CLUSTER_PASSWORD;

  validateNotNull<string>(
    host,
    "Please add MYSCALE_CLUSTER_URL to .env or .env.local",
  );
  validateNotNull<string>(
    port,
    "Please add MYSCALE_CLUSTER_PORT to .env or .env.local",
  );
  validateNotNull<string>(
    username,
    "Please add MYSCALE_USERNAME to .env or .env.local",
  );
  validateNotNull<string>(
    password,
    "Please add MYSCALE_CLUSTER_PASSWORD to .env or .env.local",
  );

  return { host, port, username, password };
}
