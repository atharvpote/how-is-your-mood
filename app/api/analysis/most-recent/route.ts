import { getUserIdByClerkId } from "@/utils/auth";
import { fetchMostRecentEntry } from "@/utils/fetcher";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    const mostRecent = await fetchMostRecentEntry(userId);

    return createJsonResponse(200, { mostRecent: mostRecent?.date ?? null });
  } catch (error) {
    return createErrorResponse(500, error);
  }
}
