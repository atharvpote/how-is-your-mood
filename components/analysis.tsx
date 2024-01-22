"use client";

import { useContext } from "react";
import { AnalysisContext } from "@/contexts/analysis";
import { LoadingSpinner } from "./loading";
import { AnalysisContextInterface } from "@/utils/types";
import { notNullValidator } from "@/utils/validator";

export default function Analysis() {
  const context = useContext(AnalysisContext);

  notNullValidator<AnalysisContextInterface>(
    context,
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
      td: <td className="basis-full">{capitalize(summery)}</td>,
    },
    {
      name: "Sentiment Score",
      td: (
        <td className="basis-full">
          <span className="font-bold">{sentiment}</span>
          <span>/10</span>
        </td>
      ),
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
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

function capitalize(str: string) {
  if (str[0]) return str[0].toUpperCase() + str.slice(1);

  return str;
}
