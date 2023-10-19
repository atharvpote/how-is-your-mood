"use client";

import { useContext } from "react";
import { AnalysisContext } from "@/contexts/analysis";
import { LoadingSpinner } from "./loading";

export default function Analysis() {
  const context = useContext(AnalysisContext);

  if (!context)
    throw new Error(
      "AnalysisContext must be used within AnalysisContextProvider",
    );

  const {
    analysis: { emoji, mood, sentiment, subject, summery },
    loading,
  } = context;

  const table = [
    {
      name: "Mood",
      td: (
        <td className="flex basis-full items-center gap-2">
          <div className="font-bold capitalize">{mood}</div>
          <div className="">{emoji}</div>
        </td>
      ),
    },
    {
      name: "Subject",
      td: <td className="basis-full capitalize">{subject}</td>,
    },
    {
      name: "Summery",
      td: (
        <td className="basis-full">
          {summery[0] ? summery[0].toUpperCase() + summery.slice(1) : ""}
        </td>
      ),
    },
    {
      name: "Sentiment Score",
      td: (
        <td className="basis-full">
          <span className="font-bold">{sentiment}</span>
          /10
        </td>
      ),
    },
  ];

  return loading ? (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner />
    </div>
  ) : (
    <table className="table">
      <tbody>
        {table.map(({ name, td }) => (
          <tr className="flex items-start text-base" key={name}>
            <th className="basis-44">
              <span className="">{name}</span>
            </th>
            {td}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
