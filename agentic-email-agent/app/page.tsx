/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmailList } from "@/components/email-list";
import { EmailDetail } from "@/components/email-detail";
import { DraftViewer } from "@/components/draft-viewer";
import { AutomationControl } from "@/components/automation-control";
import {
  AutomationSummary,
  EmailMessage,
  EmailMetadata,
} from "@/types/email";

type Notification =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function Home() {
  const [emails, setEmails] = useState<EmailMetadata[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loadingEmailDetail, setLoadingEmailDetail] = useState(false);
  const [draftHtml, setDraftHtml] = useState<string | undefined>();
  const [draftId, setDraftId] = useState<string | undefined>();
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);
  const [automationSummary, setAutomationSummary] =
    useState<AutomationSummary>();
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((next: Notification) => {
    setNotification(next);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const fetchEmails = useCallback(async () => {
    setLoadingEmails(true);
    try {
      const response = await fetch("/api/emails", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      const data = (await response.json()) as { emails: EmailMetadata[] };
      setEmails(data.emails);
      setSelectedEmailId((current) => {
        if (current && data.emails.some((email) => email.id === current)) {
          return current;
        }
        return data.emails[0]?.id ?? null;
      });
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Unable to load inbox messages.",
      });
    } finally {
      setLoadingEmails(false);
    }
  }, [notify]);

  const fetchEmailDetail = useCallback(
    async (id: string) => {
      setLoadingEmailDetail(true);
      try {
        const response = await fetch(`/api/emails/${id}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch email");
        }
        const data = (await response.json()) as { email: EmailMessage };
        setSelectedEmail(data.email);
      } catch (error) {
        console.error(error);
        notify({
          type: "error",
          message: "Unable to fetch message details.",
        });
      } finally {
        setLoadingEmailDetail(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    fetchEmails().catch(console.error);
  }, [fetchEmails]);

  useEffect(() => {
    if (!selectedEmailId) {
      setSelectedEmail(null);
      return;
    }
    fetchEmailDetail(selectedEmailId).catch(console.error);
  }, [selectedEmailId, fetchEmailDetail]);

  const handleSelectEmail = useCallback((id: string) => {
    setSelectedEmailId(id);
    setDraftHtml(undefined);
    setDraftId(undefined);
  }, []);

  const handleGenerateDraft = useCallback(async () => {
    if (!selectedEmail) {
      return;
    }
    setGeneratingDraft(true);
    try {
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: selectedEmail.id,
          threadId: selectedEmail.threadId,
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          to: selectedEmail.to,
          createDraft: true,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate draft");
      }
      const data = (await response.json()) as {
        draftHtml: string;
        draftId?: string;
      };
      setDraftHtml(data.draftHtml);
      setDraftId(data.draftId);
      notify({
        type: "success",
        message: data.draftId
          ? "Draft created in Gmail."
          : "Draft generated successfully.",
      });
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Draft generation failed.",
      });
    } finally {
      setGeneratingDraft(false);
    }
  }, [notify, selectedEmail]);

  const handleSendDraft = useCallback(async () => {
    if (!selectedEmail || !draftHtml) {
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/send-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: selectedEmail.threadId,
          to: selectedEmail.from,
          subject: selectedEmail.subject,
          body: draftHtml,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send reply");
      }
      notify({
        type: "success",
        message: "Reply sent successfully.",
      });
      setDraftHtml(undefined);
      setDraftId(undefined);
      await fetchEmails();
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Failed to send reply.",
      });
    } finally {
      setSending(false);
    }
  }, [draftHtml, fetchEmails, notify, selectedEmail]);

  const handleAutomation = useCallback(
    async ({ dryRun }: { dryRun: boolean }) => {
      setAutomationRunning(true);
      try {
        const response = await fetch("/api/automation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dryRun }),
        });
        if (!response.ok) {
          throw new Error("Automation failed");
        }
        const data = (await response.json()) as AutomationSummary;
        setAutomationSummary(data);
        notify({
          type: "success",
          message: dryRun
            ? "Dry-run completed. Drafts prepared."
            : "Automation run complete.",
        });
        await fetchEmails();
      } catch (error) {
        console.error(error);
        notify({
          type: "error",
          message: "Automation run failed.",
        });
      } finally {
        setAutomationRunning(false);
      }
    },
    [fetchEmails, notify],
  );

  const currentThread = useMemo(
    () => emails.find((email) => email.id === selectedEmailId),
    [emails, selectedEmailId],
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-8">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Autonomous Email Desk
            </h1>
            <p className="text-sm text-slate-500">
              Monitor, draft, and auto-reply to your inbox with AI oversight.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              Live monitoring active
            </span>
            <span>
              Threads loaded:{" "}
              <strong className="text-slate-700">{emails.length}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 grid max-w-7xl gap-6 px-6 lg:grid-cols-[320px_1fr_360px]">
        <section className="h-[70vh] rounded-xl bg-white shadow-sm">
          <EmailList
            emails={emails}
            selectedId={selectedEmailId ?? undefined}
            onSelect={handleSelectEmail}
            loading={loadingEmails}
            onRefresh={fetchEmails}
          />
        </section>
        <section className="h-[70vh] rounded-xl bg-white shadow-sm">
          <EmailDetail
            email={selectedEmail}
            loading={loadingEmailDetail}
            onGenerateDraft={handleGenerateDraft}
            generating={generatingDraft}
          />
        </section>
        <section className="h-[70vh] rounded-xl">
          <DraftViewer
            draftHtml={draftHtml}
            draftId={draftId}
            enableSend={Boolean(currentThread && draftHtml)}
            onSend={handleSendDraft}
            sending={sending}
          />
        </section>
      </main>

      <div className="mx-auto mt-6 max-w-7xl px-6">
        <AutomationControl
          running={automationRunning}
          summary={automationSummary}
          onRun={handleAutomation}
        />
      </div>

      {notification ? (
        <div className="fixed right-6 top-6">
          <div
            className={`rounded-lg px-4 py-3 text-sm shadow-lg ${
              notification.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
