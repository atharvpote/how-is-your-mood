import { getUserIdByClerkId } from "@/utils/auth";
import { getMostRecentEntry, errorResponse } from "@/utils/server";
import { NextResponse } from "next/server";

// TODO: Optimize
export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    const entry = await getMostRecentEntry(userId);

    return NextResponse.json({ mostRecentEntry: entry?.date }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}
