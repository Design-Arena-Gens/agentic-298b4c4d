import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateReplyDraft } from "@/lib/openai";
import { createDraftReply, getEmailDetails } from "@/lib/gmail";

const requestSchema = z.object({
  emailId: z.string().min(1),
  threadId: z.string().min(1),
  subject: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  bodyOverride: z.string().optional(),
  createDraft: z.boolean().optional(),
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

  const { emailId, threadId, subject, from, to, createDraft, bodyOverride } =
    parsed.data;

  try {
    const emailDetails =
      bodyOverride ??
      (await (async () => {
        const details = await getEmailDetails(emailId);
        if (!details) return "";
        return details.bodyText || details.bodyHtml || details.snippet;
      })());

    const draftHtml = await generateReplyDraft({
      emailSubject: subject,
      emailBody: emailDetails,
      emailFrom: from,
      emailTo: to,
    });

    if (!draftHtml) {
      return NextResponse.json(
        { error: "LLM did not return a draft" },
        { status: 500 },
      );
    }

    const draft = createDraft
      ? await createDraftReply({
          threadId,
          to: from,
          subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
          body: draftHtml,
        })
      : null;

    return NextResponse.json({
      draftHtml,
      draftId: draft?.id,
    });
  } catch (error) {
    console.error("Draft generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}
