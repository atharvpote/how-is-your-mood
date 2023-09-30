import { JSX, ReactElement } from "react";
import { EntryAnalysis } from "./editor";

interface AnalysisTableProps {
  analysis: EntryAnalysis;
}

export default function AnalysisTable({ analysis }: AnalysisTableProps) {
  const table = [
    {
      name: "Mood",
      td: (
        <td className="flex basis-full items-center gap-2 text-base">
          <div className="font-bold capitalize">{analysis.mood}</div>
          <div className="text-xl">{analysis.emoji}</div>
        </td>
      ),
    },
    {
      name: "Subject",
      td: (
        <td className="basis-full text-base capitalize">{analysis.subject}</td>
      ),
    },
    {
      name: "Summery",
      td: (
        <td className="basis-full text-base">
          {analysis.subject.length
            ? analysis.summery[0].toUpperCase() + analysis.summery.slice(1)
            : ""}
        </td>
      ),
    },
    {
      name: "Sentiment Score",
      td: <td className="basis-full text-base">{analysis.sentiment}</td>,
    },
  ];

  return (
    <table className="table">
      <tbody>
        {table.map(({ name, td }) => (
          <TableRow key={name} name={name} td={td} />
        ))}
      </tbody>
    </table>
  );
}

interface TableRowProps {
  name: string;
  td: ReactElement<JSX.IntrinsicElements["td"]>;
}

function TableRow({ name, td }: TableRowProps) {
  return (
    <tr className="flex items-start">
      <th className="basis-44">
        <span className="text-base">{name}</span>
      </th>
      {td}
    </tr>
  );
}
