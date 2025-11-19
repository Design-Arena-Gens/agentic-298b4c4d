import { NextRequest, NextResponse } from "next/server";
import { getEmailDetails } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const emailId = segments[segments.length - 1];

    if (!emailId) {
      return NextResponse.json(
        { error: "Email id missing" },
        { status: 400 },
      );
    }

    const email = await getEmailDetails(emailId);

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Failed to fetch email", error);
    return NextResponse.json(
      { error: "Failed to fetch email details" },
      { status: 500 },
    );
  }
}
