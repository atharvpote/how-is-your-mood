import { Analysis } from "@prisma/client";

export default function AnalysisTable({ analysis }: { analysis: Analysis }) {
  return (
    <table className="table mb-4">
      <tbody>
        <tr>
          <th>
            <span className="text-base">Mood</span>
          </th>
          <td className="flex items-center gap-2 text-base">
            <div className="font-bold capitalize">{analysis.mood}</div>
            <div className="text-xl">
              {analysis.emoji.length
                ? String.fromCodePoint(Number(analysis.emoji))
                : ""}
            </div>
          </td>
        </tr>
        <tr>
          <th className="flex items-start">
            <span className="text-base">Subject</span>
          </th>
          <td className="text-base capitalize">{analysis.subject}</td>
        </tr>
        <tr>
          <th className="flex items-start">
            <span className="text-base">Summery</span>
          </th>
          <td className="text-base">
            {analysis.subject.length
              ? analysis.summery[0].toUpperCase() + analysis.summery.slice(1)
              : ""}
          </td>
        </tr>
        <tr>
          <th className="flex items-start">
            <span className="text-base">Sentiment Score</span>
          </th>
          <td className="text-base">{analysis.sentiment}</td>
        </tr>
      </tbody>
    </table>
  );
}
