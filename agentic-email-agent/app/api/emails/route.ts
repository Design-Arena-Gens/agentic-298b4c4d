import { NextRequest, NextResponse } from "next/server";
import { listRecentEmails } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const maxResults = searchParams.get("max")
    ? Number.parseInt(searchParams.get("max")!, 10)
    : undefined;

  try {
    const emails = await listRecentEmails({
      query,
      maxResults: Number.isNaN(maxResults!) ? undefined : maxResults,
    });
    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Failed to list emails", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 },
    );
  }
}
