/* eslint-disable @next/next/no-img-element */
"use client";

import { EmailMetadata } from "@/types/email";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

interface EmailListProps {
  emails: EmailMetadata[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function EmailList({
  emails,
  selectedId,
  onSelect,
  loading,
  onRefresh,
}: EmailListProps) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Inbox Monitor
          </h2>
          <p className="text-xs text-slate-500">
            {emails.length} threads loaded. Click to review.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading messages…
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-slate-500">
            No messages matched your filters.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {emails.map((email) => (
              <li key={email.id}>
                <button
                  type="button"
                  onClick={() => onSelect(email.id)}
                  className={clsx(
                    "flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50",
                    selectedId === email.id ? "bg-slate-100" : "",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {email.subject}
                    </p>
                    <span className="text-xs text-slate-500">
                      {email.date &&
                      !Number.isNaN(new Date(email.date).getTime())
                        ? formatDistanceToNow(new Date(email.date), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {email.from}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-2 text-xs text-slate-600">
                      {email.snippet}
                    </p>
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        email.importance === "high"
                          ? "bg-rose-100 text-rose-700"
                          : email.importance === "low"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {email.importance}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
