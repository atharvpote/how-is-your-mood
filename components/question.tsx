"use client";

import { useState } from "react";
import { z } from "zod";
import { askQuestion } from "@/utils/api";

export default function Question() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (value.trim().length !== 0) {
            setLoading(true);

            void askQuestion(value)
              .then((answer) => {
                setAnswer(z.string().parse(answer));
              })
              .catch((error) => {
                if (error instanceof Error) console.error(error.message);
              });

            setLoading(false);
            setValue("");
          }
        }}
      >
        <textarea
          placeholder="Ask a question"
          disabled={loading}
          className="textarea-bordered textarea inline-block h-48 w-full resize-none p-6 text-lg"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn mx-auto my-4 block"
        >
          Ask
        </button>
      </form>
      <>
        {loading && (
          <span className="loading loading-infinity loading-lg"></span>
        )}
      </>
      <>{answer && <div>{answer}</div>}</>
    </>
  );
}
