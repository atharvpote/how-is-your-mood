"use client";

import { Analysis } from "@prisma/client";
import { ResponsiveContainer, Line, LineChart, XAxis, Tooltip } from "recharts";

export default function HistoryChart({ analyses }: { analyses: Analysis[] }) {
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart width={300} height={100} data={analyses}>
        <Line
          dataKey="sentimentScore"
          type="monotone"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <XAxis dataKey="createdAt" />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ payload, label, active }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const dateLabel = new Date(label).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  if (active) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const analysis = payload[0].payload;

    return (
      <div className="relative rounded-lg border border-black/10 bg-white/5 p-8 shadow-md backdrop-blur-md">
        <div
          className="absolute left-2 top-2 h-2 w-2 rounded-full"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          style={{ background: analysis.color }}
        ></div>
        <p className="label text-sm text-black/30">{dateLabel}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <p className="text-xl uppercase">{analysis.mood}</p>
      </div>
    );
  }

  return null;
}
