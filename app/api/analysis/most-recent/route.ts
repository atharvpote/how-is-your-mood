import { getUserIdByClerkId } from "@/utils/auth";
import { fetchMostRecentEntry } from "@/utils/fetcher";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const mostRecent = await fetchMostRecentEntry(userId);

      return jsonResponse(200, { mostRecent: mostRecent?.date ?? null });
    } catch (error) {
      return jsonResponse(500, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(401, new ErrorBody(error));
  }
}
