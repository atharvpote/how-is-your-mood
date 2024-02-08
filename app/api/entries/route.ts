import { getCurrentUserId } from "@/utils/auth";
import { getEntryList } from "@/utils/fetchers";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET() {
  try {
    return createJsonResponse(200, {
      entries: await getEntryList(await getCurrentUserId()),
    });
  } catch (error) {
    return createErrorResponse(500, error);
  }
}
