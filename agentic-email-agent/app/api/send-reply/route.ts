import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendReply } from "@/lib/gmail";

const requestSchema = z.object({
  threadId: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { threadId, to, subject, body } = parsed.data;

  try {
    const response = await sendReply({
      threadId,
      to,
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      body,
    });
    return NextResponse.json({ messageId: response.id });
  } catch (error) {
    console.error("Sending reply failed", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 },
    );
  }
}
