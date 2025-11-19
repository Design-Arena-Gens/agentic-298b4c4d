"use client";

import { useState } from "react";
import clsx from "clsx";

interface DraftViewerProps {
  draftHtml?: string;
  draftId?: string;
  enableSend: boolean;
  onSend: () => Promise<void>;
  sending: boolean;
}

export function DraftViewer({
  draftHtml,
  draftId,
  enableSend,
  onSend,
  sending,
}: DraftViewerProps) {
  const [copied, setCopied] = useState(false);
  const hasDraft = Boolean(draftHtml);

  async function handleCopy() {
    if (!draftHtml) return;
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(draftHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!hasDraft) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
        <p className="text-sm font-medium text-slate-600">
          Drafts will appear here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Use “Generate reply draft” to let the agent compose a response.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Reply draft</p>
          {draftId ? (
            <p className="text-xs text-slate-500">Draft stored in Gmail ({draftId})</p>
          ) : (
            <p className="text-xs text-slate-500">
              Review the draft before sending.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {copied ? "Copied" : "Copy HTML"}
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!enableSend || sending}
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition",
              sending || !enableSend
                ? "cursor-not-allowed bg-slate-400"
                : "bg-emerald-600 hover:bg-emerald-500",
            )}
          >
            {sending ? "Sending…" : "Send automatically"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <article
          className="prose prose-sm max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: draftHtml ?? "" }}
        />
      </div>
    </div>
  );
}
