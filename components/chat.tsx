"use client";

import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FaArrowUp } from "react-icons/fa";
import { errorAlert } from "@/utils/error";
import { Message, Role } from "@/utils/types";

export default function Chat() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  return (
    <div className="flex h-[calc(var(--chat-page-remaining-space)-1rem)] flex-col rounded-lg bg-neutral p-4 sm:h-[calc(var(--chat-page-remaining-space-sm)-1rem)]">
      <ul className="h-full overflow-y-auto py-2">
        {conversation.map(({ role, message, id }) => (
          <li key={id}>
            <Message message={message} role={role} />
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (userMessage) {
            setProcessing(true);

            void axios
              .post<{ reply: string }>("/api/chat", {
                conversation: [...conversation, message("user", userMessage)],
              })
              .then(({ data: { reply } }) => {
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

            setConversation([...conversation, message("user", userMessage)]);

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
    <div className={`chat ${role === "ai" ? "chat-start" : "chat-end"}`}>
      <div
        className={`chat-bubble ${
          role === "ai" ? "chat-bubble-primary" : "chat-bubble-success"
        }`}
      >
        {message}
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
