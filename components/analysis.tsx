"use client";

import { useContext } from "react";
import { AnalysisContext } from "@/contexts/analysis";
import { LoadingSpinner } from "./loading";

export default function Analysis() {
  const context = useContext(AnalysisContext);

  if (context === null)
    throw new Error(
      "AnalysisContext must be used within AnalysisContextProvider",
    );

  const { analysis, loading } = context;

  const table = [
    {
      name: "Mood",
      td: (
        <td className="flex basis-full items-center gap-2">
          <div className="font-bold capitalize">{analysis.mood}</div>
          <div className="">{analysis.emoji}</div>
        </td>
      ),
    },
    {
      name: "Subject",
      td: <td className="basis-full capitalize">{analysis.subject}</td>,
    },
    {
      name: "Summery",
      td: (
        <td className="basis-full">
          {analysis.subject.length
            ? analysis.summery[0].toUpperCase() + analysis.summery.slice(1)
            : ""}
        </td>
      ),
    },
    {
      name: "Sentiment Score",
      td: (
        <td className="basis-full">
          <span className="font-bold">{analysis.sentiment}</span>
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
