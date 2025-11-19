"use client";

import { EmailMessage } from "@/types/email";
import { format } from "date-fns";
import clsx from "clsx";

interface EmailDetailProps {
  email?: EmailMessage | null;
  loading: boolean;
  onGenerateDraft: () => void;
  generating: boolean;
}

export function EmailDetail({
  email,
  loading,
  onGenerateDraft,
  generating,
}: EmailDetailProps) {
  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-slate-500">
        Loading conversation…
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-slate-500">
        Select a message to see details.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {email.subject}
            </p>
            <p className="text-sm text-slate-500">{email.from}</p>
          </div>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {email.date && !Number.isNaN(new Date(email.date).getTime())
              ? format(new Date(email.date), "MMM d, yyyy h:mm a")
              : "Unknown date"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span
            className={clsx(
              "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
              email.importance === "high"
                ? "bg-rose-100 text-rose-700"
                : email.importance === "low"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-amber-100 text-amber-700",
            )}
          >
            {email.importance} priority
          </span>
          {email.isUnread ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-700">
              unread
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onGenerateDraft}
          className="mt-4 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={generating}
        >
          {generating ? "Generating draft…" : "Generate reply draft"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl text-sm leading-relaxed text-slate-700">
          {email.bodyHtml ? (
            <article
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
              {email.bodyText ?? email.snippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
