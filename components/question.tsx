"use client";

import { useState } from "react";
import { askQuestion, errorAlert } from "@/utils/client";
import { TopLoadingSpinner } from "./loading";

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
              .then((answer) => setAnswer(answer))
              .catch((error) => errorAlert(error))
              .finally(() => {
                setLoading(false);
                setValue("");
              });
          }
        }}
      >
        <textarea
          placeholder="Ask a question"
          disabled={loading}
          className="textarea textarea-bordered inline-block h-48 w-full resize-none p-6 text-lg"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary mx-auto my-4 block"
        >
          Ask
        </button>
      </form>
      <>{loading && <TopLoadingSpinner />}</>
      <>{answer && <div>{answer}</div>}</>
    </>
  );
}
