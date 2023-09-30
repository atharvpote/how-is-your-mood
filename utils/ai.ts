import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { loadQARefineChain } from "langchain/chains";
import { StructuredOutputParser } from "langchain/output_parsers";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";
import { Journal } from "@prisma/client";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    mood: z
      .string()
      .describe("the mood of the person who wrote the journal entry."),
    subject: z.string().describe("the subject of the journal entry."),
    summery: z
      .string()
      .describe(
        "quick summary of the entry in the least amount of words possible.",
      ),
    emoji: z
      .string()
      .describe("an emoji that represents the mood of the entry."),
    sentiment: z
      .number()
      .describe("sentiment of the text and rated on a scale from -10 to 10."),
  }),
);

export async function analyze(content: string) {
  const input = await getPrompt(content);

  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const result = await model.call(input);

  return await parser.parse(result);
}

async function getPrompt(content: string) {
  const format_instructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template:
      "Analyze the following journal entry. Follow the instructions and format your response to match the format instructions, no matter what! \n{format_instructions}\n{entry}",
    inputVariables: ["entry"],
    partialVariables: { format_instructions },
  });

  const input = await prompt.format({ entry: content });

  return input;
}

type Entry = Pick<Journal, "id" | "createdAt" | "content">;

export async function qa(question: string, entries: Entry[]) {
  const docs = entries.map(
    ({ content, id, createdAt }) =>
      new Document({
        pageContent: content,
        metadata: { id, createdAt },
      }),
  );

  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const chain = loadQARefineChain(model);
  const embeddings = new OpenAIEmbeddings();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const relevantDocs = await store.similaritySearch(question);

  const response = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  const { output_text } = z.object({ output_text: z.string() }).parse(response);

  return output_text;
}
