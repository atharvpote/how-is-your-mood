"use client";

import { useState } from "react";
import axios from "axios";
import { errorAlert } from "@/utils";
import { LoadingSpinner } from "./loading";

export default function Question() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <>
      <form
        onSubmit={({ preventDefault }) => {
          preventDefault();

          if (value.trim()) {
            setLoading(true);

            axios
              .post<{ answer: string }>("/api/question", { question: value })
              .then(({ data: { answer } }) => {
                setAnswer(answer);
              })
              .catch((error) => {
                errorAlert(error);
              })
              .finally(() => {
                setLoading(false);
              });
          }
        }}
      >
        <textarea
          placeholder="Ask a question"
          disabled={loading}
          className="textarea textarea-bordered mx-auto block h-48 w-11/12 resize-none bg-neutral p-6 text-lg text-neutral-content"
          value={value}
          onChange={({ target: { value } }) => {
            setValue(value);
          }}
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
