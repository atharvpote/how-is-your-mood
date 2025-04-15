import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { Message } from "ai/react";
import { RunnableSequence } from "@langchain/core/runnables";
import { vectorStore } from "@/vectorDb";
import { DocumentInterface } from "@langchain/core/documents";
import { ChatMessage } from "@langchain/core/messages";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";

export async function getAiAnalysis(content: string) {
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
    modelName: "gpt-4.1-nano",
    cache: true,
  });

  const getAnalysisChain = RunnableSequence.from([
    model.bind({
      functions: [analysisFunctionSchema],
      function_call: { name: "analyze" },
    }),
    new JsonOutputFunctionsParser(),
  ]);

  return getAnalysisChain.invoke([["human", content]]);
}

type Messages = Omit<Message, "id">[];

export async function getChatResponse(messages: Messages, userId: string) {
  const history = messages.slice(0, -1);
  const current = messages[messages.length - 1];

  if (!current) {
    throw new Error("Chat is empty");
  }

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
    cache: true,
  });

  const getRelevantChunks = RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      "user",
      `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.
      
Chat History:
{chat_history}

Follow Up Input: {question}
Standalone question:`,
    ]),
    model,
    new StringOutputParser(),
    MultiQueryRetriever.fromLLM({
      llm: model,
      retriever: vectorStore.asRetriever({
        k: 5,
        filter: { user_id: userId },
      }),
      verbose: process.env.NODE_ENV === "development",
    }),
    (documents: DocumentInterface[]) =>
      documents.map(({ pageContent }) => pageContent).join("\n\n"),
  ]);

  const getResponseChainArgs = { history, current: current.content.toString() };
  type GetResponseChainArgs = typeof getResponseChainArgs;

  const getResponseChain = RunnableSequence.from([
    async function formatArguments({ current, history }: GetResponseChainArgs) {
      return {
        chat_history: history.map((message) => new ChatMessage(message)),
        context: await getRelevantChunks.invoke({
          chat_history: history
            .map(({ content, role }) => `${role}: ${content}`)
            .join("\n"),
          question: current,
        }),
        current,
      };
    },
    ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an assistant who's helps user regarding there daily journal. When responding to user, take relevant journal entry chunks from user's entries into consideration given below. If you cannot find relevant journal chunks, reply with "I don't have enough context to provide an answer. Please ask another question."
      
      Relevant Chunks: {context}
      `,
      ],
      new MessagesPlaceholder("chat_history"),
      ["user", "{current}"],
    ]),
    model,
    new BytesOutputParser(),
  ]);

  return await getResponseChain.stream(getResponseChainArgs);
}
