"use client";

import { useState } from "react";
import { Check, Copy as CopyIcon } from "lucide-react";
import type { Copy } from "@/lib/copy";

type Status = "idle" | "copied" | "failed";

/** Fetches the page's `.md` version and puts it on the clipboard. */
export function CopyMarkdownButton({
  markdownUrl,
  copy,
  className,
}: {
  markdownUrl: string;
  copy: Copy;
  className?: string;
}) {
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
  const Icon = status === "copied" ? Check : CopyIcon;

  return (
    <button type="button" onClick={copyMarkdown} data-copy-markdown="" className={className}>
      <Icon className="size-4" aria-hidden="true" />
      <span aria-live="polite">{label}</span>
    </button>
  );
}
