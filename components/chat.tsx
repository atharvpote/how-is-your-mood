"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FaArrowUp } from "react-icons/fa";
import { errorAlert } from "@/utils/error";
import { Message, Role } from "@/utils/types";
import { z } from "zod";
import { zodSafeParseValidator } from "@/utils/validator";

export default function Chat() {
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: "1",
      message: "Hello, I'm your assistant. How may I help you?",
      role: "ai",
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const lastMessage = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    lastMessage.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="flex h-[calc(var(--chat-page-remaining-space)-1rem)] flex-col rounded-lg bg-neutral p-4 sm:h-[calc(var(--chat-page-remaining-space-sm)-1rem)]">
      <ul className="h-full overflow-y-auto py-2">
        {conversation.map(({ role, message, id }, index) => {
          if (index === conversation.length - 1) {
            return (
              <li key={id} ref={lastMessage}>
                <Message message={message} role={role} />
              </li>
            );
          } else {
            return (
              <li key={id}>
                <Message message={message} role={role} />
              </li>
            );
          }
        })}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (userMessage) {
            setProcessing(true);

            const conversationWithNewMessage = [
              ...conversation,
              message("user", userMessage),
            ];

            void axios
              .post<unknown>("/api/chat", {
                conversation: conversationWithNewMessage,
              })
              .then(({ data }) => {
                const validation = z
                  .object({ reply: z.string() })
                  .safeParse(data);

                const { reply } = zodSafeParseValidator(validation);

                return reply;
              })
              .then((reply) => {
                setConversation([
                  ...conversation,
                  message("user", userMessage),
                  message("ai", reply),
                ]);
              })
              .catch((error) => {
                errorAlert(error);
              })
              .finally(() => {
                setProcessing(false);
              });

            setConversation([
              ...conversationWithNewMessage,
              message("system", "Processing"),
            ]);

            setUserMessage("");
          }
        }}
      >
        <label htmlFor="message" className="hidden">
          Message
        </label>
        <div className="flex">
          <input
            type="text"
            id="message"
            className="input w-full rounded-l-lg rounded-r-none px-4 py-2 focus:outline-none"
            placeholder="Message..."
            autoComplete="off"
            value={userMessage}
            onChange={({ target: { value } }) => {
              setUserMessage(value);
            }}
            disabled={processing}
          />
          <div className="rounded-r-lg bg-base-100">
            <button
              className="btn btn-square rounded-l-none border-none bg-accent text-accent-content"
              disabled={processing || !userMessage}
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Message({ role, message }: Readonly<{ role: Role; message: string }>) {
  return (
    <div className={`chat ${role === "user" ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble flex items-center gap-2 ${
          role === "user" ? "chat-bubble-success" : "chat-bubble-primary"
        }`}
      >
        <span>{message}</span>
        {role === "system" ? (
          <span className="loading loading-infinity py-4 text-neutral"></span>
        ) : undefined}
      </div>
    </div>
  );
}

function message(role: Role, message: string) {
  return {
    id: uuidv4(),
    role,
    message,
  };
}
