"use client";

import { useState } from "react";
import type { Copy } from "@/lib/copy";

type Status = "idle" | "copied" | "failed";

/** Fetches the page's `.md` version and puts it on the clipboard. */
export function CopyMarkdownButton({ markdownUrl, copy }: { markdownUrl: string; copy: Copy }) {
  const [status, setStatus] = useState<Status>("idle");

  async function copyMarkdown() {
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), 2000);
  }

  const label = status === "copied" ? copy.copiedMarkdown : status === "failed" ? copy.copyFailed : copy.copyMarkdown;

  return (
    <button
      type="button"
      onClick={copyMarkdown}
      data-copy-markdown=""
      className="inline-flex h-8 items-center gap-2 border border-fd-border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
