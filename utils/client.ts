import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { addDays } from "date-fns";
import { Analysis } from "@prisma/client";

const idValidation = z.string().uuid();

export async function createEntry() {
  const {
    data: { id },
  } = await axios.post<{ id: string }>("/api/journal");

  return id;
}

export async function updateContent(content: string, id: string) {
  idValidation.parse(id);

  const {
    data: { analysis },
  } = await axios.put<{ analysis: Analysis }>(`/api/journal/${id}`, {
    type: "content",
    content,
  });

  return analysis;
}

export async function updateDate(date: Date, id: string) {
  z.date().parse(date);
  idValidation.parse(id);

  await axios.put(`/api/journal/${id}`, {
    type: "date",
    date,
  });
}

export async function deleteEntry(id: string) {
  idValidation.parse(id);

  await axios.delete(`/api/journal/${id}`);
}

export async function askQuestion(question: string) {
  const {
    data: { answer },
  } = await axios.post<{ answer: string }>("/api/question", {
    question,
  });

  return answer;
}

export function mapAnalyses(start: Date, end: Date, analyses: Analysis[]) {
  const range: Date[] = [];
  let current = start;

  while (current <= end) {
    range.push(current);

    current = addDays(current, 1);
  }

  return range.map((date) => {
    const analysis = analyses.find(
      (analysis) =>
        new Date(analysis.date).toDateString() === date.toDateString(),
    );

    if (analysis) return analysis;

    return { date };
  });
}

export function displayError(error: unknown) {
  if (isAxiosError(error)) {
    console.error(error.message);

    alert(error.message);
  } else {
    console.error("Unknown error", error);

    alert("Unknown error");
  }
}
