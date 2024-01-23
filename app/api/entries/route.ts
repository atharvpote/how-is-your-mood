import { getUserIdByClerkId } from "@/utils/auth";
import { fetchEntries } from "@/utils/fetcher";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const entries = await fetchEntries(userId);

      return jsonResponse(200, { entries });
    } catch (error) {
      return jsonResponse(500, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(401, new ErrorBody(error));
  }
}
