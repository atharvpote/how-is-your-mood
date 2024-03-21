import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { Message } from "ai/react";
import { ChatMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { langchainVectorStore, openAIEmbeddings } from "@/vectorDb";

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
          description: "Sentiment of journal on scale of 0 to 10.",
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

  return getAnalysisChain.invoke([["human", content]]);
}

type Messages = Omit<Message, "id">[];

export async function getChatResponse(messages: Messages, userId: string) {
  if (!messages.length) throw new Error("Chat is empty");

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
    cache: true,
  });

  const relevantChunks = await getRelevantDocuments(messages, model, userId);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You're a personal assistant for journal entries. Chunk is a small part of single journal, take relevant chunks into consideration.\nRelevant chunks: {relevantChunks}",
    ],
    ...messages.map((message) => new ChatMessage(message)),
  ]);

  const chatResponseChain = RunnableSequence.from([
    {
      relevantChunks: new RunnablePassthrough(),
    },
    prompt,
    model,
    new BytesOutputParser(),
  ]);

  return chatResponseChain.stream({ relevantChunks });
}

async function getRelevantDocuments(
  messages: Messages,
  model: ChatOpenAI,
  userId: string,
) {
  const current = messages[messages.length - 1];

  if (!current) throw new Error("Chat is empty");

  const chatHistory = messages
    .slice(0, -1)
    .map(({ role, content }) => `${role}: ${content}`)
    .join("\n");

  const queryChain = ChatPromptTemplate.fromMessages([
    [
      "human",
      `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,
    ],
  ])
    .pipe(model)
    .pipe(new StringOutputParser());

  const query = await queryChain.invoke({
    chat_history: chatHistory,
    question: current.content,
  });

  console.log(query);

  return await langchainVectorStore.similaritySearch(query, 5, {
    user_id: userId,
  });
}

export async function getEmbeddings(content: string) {
  const splitter = new RecursiveCharacterTextSplitter();

  const splitContent = await splitter.splitText(content);

  const embeddings = await openAIEmbeddings.embedDocuments(splitContent);

  return splitContent.map((chunk, index) => ({
    chunk,
    embedding: embeddings[index],
  })) as { chunk: string; embedding: number[] }[];
}
