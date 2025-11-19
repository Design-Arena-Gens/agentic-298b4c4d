"use client";

import { AutomationSummary } from "@/types/email";
import { formatDistanceToNow } from "date-fns";

interface AutomationControlProps {
  running: boolean;
  summary?: AutomationSummary;
  onRun: (options: { dryRun: boolean }) => Promise<void>;
}

export function AutomationControl({
  running,
  summary,
  onRun,
}: AutomationControlProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">
          Autonomous Reply Engine
        </p>
        <p className="text-xs text-slate-500">
          Let the agent handle routine emails. Dry-run creates drafts; live mode
          sends immediately.
        </p>
      </div>
      <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRun({ dryRun: true })}
          disabled={running}
          className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? "Working…" : "Dry-run (drafts only)"}
          <p className="mt-1 text-xs font-normal text-slate-500">
            Evaluates inbox and files drafts for safe replies.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onRun({ dryRun: false })}
          disabled={running}
          className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? "Working…" : "Live auto-reply"}
          <p className="mt-1 text-xs font-normal text-emerald-600">
            Immediately sends high-confidence replies.
          </p>
        </button>
      </div>
      {summary ? (
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Last run summary</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>Processed: {summary.processed}</span>
            <span>Sent: {summary.sent}</span>
            <span>Drafted/Skipped: {summary.skipped}</span>
            <span>Failed: {summary.failed}</span>
          </div>
          <p className="mt-1 text-slate-500">
            {summary.timestamp
              ? `Updated ${formatDistanceToNow(new Date(summary.timestamp), { addSuffix: true })}`
              : null}
          </p>
          <ul className="mt-2 space-y-1">
            {summary.details.slice(0, 5).map((detail) => (
              <li
                key={detail.emailId + detail.status}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-slate-700">
                    {detail.status}
                  </span>
                  <span className="text-slate-400">
                    {detail.actionId ? `Ref: ${detail.actionId}` : null}
                  </span>
                </div>
                <p className="mt-1 text-slate-500">
                  {detail.reason ?? "No details provided."}
                </p>
              </li>
            ))}
            {summary.details.length > 5 ? (
              <li className="text-[11px] text-slate-400">
                +{summary.details.length - 5} more entries
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          Automation has not run yet today.
        </div>
      )}
    </div>
  );
}
