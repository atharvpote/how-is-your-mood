import { EntryAnalysis } from "@/utils/server";
import { JSX, ReactElement } from "react";

export default function AnalysisTable({
  analysis,
}: {
  analysis: EntryAnalysis;
}) {
  const table = [
    {
      name: "Mood",
      td: (
        <td className="flex basis-full gap-2 text-base">
          <div className="font-bold capitalize">{analysis.mood}</div>
          <div className="text-xl">
            {analysis.emoji.length
              ? String.fromCodePoint(Number(analysis.emoji))
              : ""}
          </div>
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
