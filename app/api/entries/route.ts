import { getUserIdByClerkId } from "@/utils/auth";
import { fetchEntries } from "@/utils/fetcher";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      return createJsonResponse(200, { entries: await fetchEntries(userId) });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(401, error);
  }
}
