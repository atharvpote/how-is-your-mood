import { getCurrentUserId } from "@/utils/auth";
import { getMostRecentEntryDate } from "@/utils/fetchers";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET() {
  try {
    return createJsonResponse(200, {
      mostRecent: await getMostRecentEntryDate(await getCurrentUserId()),
    });
  } catch (error) {
    return createErrorResponse(500, error);
  }
}
