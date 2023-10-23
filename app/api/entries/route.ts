import { NextResponse } from "next/server";
import { getUserIdByClerkId } from "@/utils/auth";
import { errorResponse } from "@/utils/error";
import { fetchEntries } from "@/utils/fetcher";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    const entries = await fetchEntries(userId);

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}
