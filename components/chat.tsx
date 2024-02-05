"use client";

import { FaArrowUp } from "react-icons/fa";
import { Role } from "@/utils/types";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="flex h-[calc(var(--chat-page-remaining-space)-1rem)] flex-col rounded-lg bg-neutral p-4 sm:h-[calc(var(--chat-page-remaining-space-sm)-1rem)]">
      <ul className="h-full overflow-y-auto py-2">
        {messages.map(({ content, id, role }) => (
          <Message key={id} role={role} message={content} />
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
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
            value={input}
            onChange={handleInputChange}
          />
          <div className="rounded-r-lg bg-base-100">
            <button className="btn btn-square rounded-l-none border-none bg-accent text-accent-content">
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
        className={`chat-bubble flex items-center gap-2 ${role === "user" ? "chat-bubble-success" : "chat-bubble-primary"}`}
      >
        <span>{message}</span>
        <LoadingSpinnerWhenProcessing role={role} />
      </div>
    </div>
  );
}

function LoadingSpinnerWhenProcessing({ role }: Readonly<{ role: Role }>) {
  if (role === "system")
    return <span className="loading loading-infinity py-4 text-neutral"></span>;
}
