import { NextResponse } from "next/server";
import { getUserIdByClerkId } from "@/utils/auth";
import { errorResponse } from "@/utils/error";
import { fetchMostRecentEntry } from "@/utils/fetcher";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const mostRecent = await fetchMostRecentEntry(userId);

      return NextResponse.json(
        { mostRecent: mostRecent?.date ?? null },
        { status: 200 },
      );
    } catch (error) {
      return errorResponse(error, 500);
    }
  } catch (error) {
    return errorResponse(error, 401);
  }
}
