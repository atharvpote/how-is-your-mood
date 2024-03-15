import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Message } from "ai/react";
import { Document } from "@langchain/core/documents";
import { JournalSelect } from "@/drizzle/schema";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import { ChatMessage, HumanMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { RunnableSequence } from "@langchain/core/runnables";

export async function getAiAnalysis(content: string) {
  const parser = new JsonOutputFunctionsParser();

  const analysisFunctionSchema = {
    name: "analyze",
    description: "Analyze journal entry",
    parameters: {
      type: "object",
      properties: {
        mood: {
          type: "string",
          description: "Mood of person who wrote journal",
        },
        subject: {
          type: "string",
          description: "Subject of journal",
        },
        summery: {
          type: "string",
          description: "Summarize journal in least amount of words possible.",
        },
        emoji: {
          type: "string",
          description: "Emoji that represents mood of journal",
        },
        sentiment: {
          type: "number",
          description: "Sentiment of journal on scale of -10 to 10.",
        },
      },
    },
    require: ["mood", "subject", "summery", "emoji", "sentiment"],
  };

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
    cache: true,
  });

  const getAnalysisChain = model
    .bind({
      functions: [analysisFunctionSchema],
      function_call: { name: "analyze" },
    })
    .pipe(parser);

  return getAnalysisChain.invoke([new HumanMessage(content)]);
}

type Messages = Omit<Message, "id">[];

export async function getChatResponse(
  messages: Messages,
  entries: JournalSelect[],
) {
  if (!messages.length) throw new Error("Chat is empty");

  const index = new Index();

  const store = new UpstashVectorStore(
    new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
    { index },
  );

  const documents = entries.map(
    ({ content, id, createdAt, date, updatedAt }) =>
      new Document({
        pageContent: content,
        metadata: { id, createdAt, "entry date": date, updatedAt },
      }),
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });

  const ids = await store.addDocuments(
    await splitter.splitDocuments(documents),
  );

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await store.delete({ ids });

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
    cache: true,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You're a personal assistant for journal entries. Chunk is a small part of single journal, take relevant chunks into consideration.\nRelevant chunks: {relevantChunks}",
    ],
    ...messages.map((message) => new ChatMessage(message)),
  ]);

  const retriever = store.asRetriever(5, { verbose: true });

  const chatResponseChain = RunnableSequence.from([
    { relevantChunks: retriever.pipe(formatDocumentsAsString) },
    prompt,
    model,
    new BytesOutputParser(),
  ]);

  return chatResponseChain.stream("");
}
