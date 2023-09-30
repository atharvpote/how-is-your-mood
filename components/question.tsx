"use client";

import { useState } from "react";
import { displayError } from "@/utils/client";
import { LoadingSpinner } from "./loading";
import axios from "axios";

export default function Question() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <>
      <div className="prose prose-sm mx-8 my-4 md:prose-base">
        <h1>Question</h1>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (value.trim().length !== 0) {
            setLoading(true);

            axios
              .post<{ answer: string }>("/api/question", { question: value })
              .then(({ data: { answer } }) => setAnswer(answer))
              .catch((error) => displayError(error))
              .finally(() => setLoading(false));
          }
        }}
      >
        <textarea
          placeholder="Ask a question"
          disabled={loading}
          className="textarea textarea-bordered mx-auto block h-48 w-11/12 resize-none bg-neutral p-6 text-lg text-neutral-content"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-neutral mx-auto my-4 block"
        >
          Ask
        </button>
      </form>
      <div className="mx-auto h-48 w-11/12 rounded-lg border p-6">
        {loading ? <LoadingSpinner /> : answer}
      </div>
    </>
  );
}
