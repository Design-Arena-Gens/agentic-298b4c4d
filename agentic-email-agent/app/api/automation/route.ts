import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAutomation } from "@/lib/automation";

export async function POST(request: NextRequest) {
  const requestSchema = z.object({
    dryRun: z.boolean().optional(),
    limit: z.number().min(1).max(50).optional(),
  });

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const summary = await runAutomation({
      dryRun: parsed.data.dryRun,
      limit: parsed.data.limit,
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Automation run failed", error);
    return NextResponse.json(
      { error: "Automation failed to execute" },
      { status: 500 },
    );
  }
}
