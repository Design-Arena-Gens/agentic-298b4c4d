export type EmailImportance = "high" | "normal" | "low";

export interface EmailMetadata {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  labels: string[];
  importance: EmailImportance;
  isUnread: boolean;
}

export interface EmailMessage extends EmailMetadata {
  bodyHtml?: string;
  bodyText?: string;
}

export interface DraftSuggestion {
  id: string;
  emailId: string;
  subject: string;
  body: string;
  createdAt: string;
  autoResponder: boolean;
}

export interface AutoReplyResult {
  emailId: string;
  status: "skipped" | "sent" | "failed";
  reason?: string;
  actionId?: string;
}

export interface AutomationSummary {
  timestamp: string;
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  details: AutoReplyResult[];
}
