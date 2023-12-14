import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { Message } from "./types";

export async function chat(messages: Omit<Message, "id">[]) {
  const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo", cache: true });

  const { content } = await chat.call([
    new SystemMessage("You're an assistant"),
    ...messages.map(({ role, message }) =>
      role === "ai" ? new AIMessage(message) : new HumanMessage(message),
    ),
  ]);

  return content;
}
