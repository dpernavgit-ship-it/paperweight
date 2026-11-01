import { useState } from "react";
import type { AccountSummary } from "@shared/types";

export const MAILBOX_CHANGED = "This action no longer matches the current mailbox.";

export function viewedMailboxEmail(): string | undefined {
  return window.api.listAccounts().find((account) => account.isActive)?.email;
}

export function requireSameMailbox(origin?: string): void {
  if (!origin || viewedMailboxEmail() !== origin) {
    throw new Error(MAILBOX_CHANGED);
  }
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountSummary[]>(() => window.api.listAccounts());

  const refresh = () => setAccounts(window.api.listAccounts());

  return { accounts, refresh };
}
