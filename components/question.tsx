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
        className="my-8"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={async (event) => {
          event.preventDefault();

          if (value.trim().length !== 0) {
            setLoading(true);

            const answer = await askQuestion(value);

            try {
              setAnswer(z.string().parse(answer));
            } catch (error) {
              if (error instanceof Error) console.error(error.message);
            }

            setLoading(false);
            setValue("");
          }
        }}
      >
        <input
          type="text"
          name=""
          id=""
          placeholder="Ask a question"
          disabled={loading}
          className="border border-black/20 px-4 py-2 text-lg rounded-lg"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-400 px-4 py-2 rounded-lg text-lg"
        >
          Ask
        </button>
      </form>
      <>{loading && <div>Loading...</div>}</>
      <>{answer && <div>{answer}</div>}</>
    </>
  );
}
