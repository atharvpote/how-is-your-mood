import { JournalEntry } from "@prisma/client";
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { loadQARefineChain } from "langchain/chains";
import { StructuredOutputParser } from "langchain/output_parsers";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";

export async function analyze(content: string) {
  const input = await getPrompt(content);

  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const result = await model.call(input);

  try {
    return await parser.parse(result);
  } catch (error) {
    if (error instanceof Error) console.error(error);
  }
}

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    mood: z
      .string()
      .describe("the mood of the person who wrote the journal entry."),
    subject: z.string().describe("the subject of the journal entry."),
    summery: z.string().describe("quick summary of the entire entry."),
    negative: z
      .boolean()
      .describe(
        "is the journal entry negative? (i.e. does it contain negative emotions?).",
      ),
    color: z
      .string()
      .describe(
        "a hexadecimal color code that represents the mood of the entry. Example #0101fe for blue representing happiness.",
      ),
  }),
);

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

type Entries = Pick<JournalEntry, "id" | "createdAt" | "content">;

export async function qa(question: string, entries: Entries[]) {
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

  try {
    const { output_text } = z
      .object({ output_text: z.string() })
      .parse(response);

    return output_text;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
