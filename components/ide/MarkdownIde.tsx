import { highlight } from "fumadocs-core/highlight";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Files,
  FileText,
  GitBranch,
  Search,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { IDE_THEME } from "@/lib/ide-theme";
import { DocsLink } from "@/components/DocsLink";

/** One file in the explorer: its path segments (folders, then the file name) and where it opens. */
export interface IdeFile {
  path: string[];
  href: string;
}

interface Folder {
  name: string;
  folders: Folder[];
  files: { name: string; href: string }[];
}

function buildTree(files: IdeFile[]): Folder {
  const root: Folder = { name: "", folders: [], files: [] };
  for (const file of files) {
    let folder = root;
    for (const name of file.path.slice(0, -1)) {
      let next = folder.folders.find((child) => child.name === name);
      if (!next) {
        next = { name, folders: [], files: [] };
        folder.folders.push(next);
      }
      folder = next;
    }
    folder.files.push({ name: file.path.at(-1) ?? "", href: file.href });
  }
  return root;
}

const DOTS = [0, 1, 2] as const;
const ACTIVITY = [Files, Search, GitBranch, Bot] as const;

/**
 * A page's Markdown as it would look open in a code editor: title bar, tabs,
 * breadcrumbs, line numbers, a minimap and a status bar. Highlighted at build
 * time, no script. The text is the real Markdown the `.md` URL serves.
 *
 * `files` adds the activity bar and explorer (the whole docs as files);
 * without it, the compact form shown inside a page.
 */
export async function MarkdownIde({
  fileName,
  markdown,
  workspace,
  files,
  activeHref,
  labels,
  compact = false,
  className,
}: {
  fileName: string;
  markdown: string;
  /** The root folder's name in the title bar and explorer. */
  workspace: string;
  files?: IdeFile[];
  activeHref?: string;
  labels: { explorer: string; lines: string; aiReadable: string };
  /** Inside an article: the code scrolls in a box of its own height. */
  compact?: boolean;
  className?: string;
}) {
  const code = markdown.replace(/\n+$/, "");
  const lines = code.split("\n");
  const highlighted = await highlight(code, { lang: "md", theme: IDE_THEME });
  const firstHeading = lines.find((line) => line.startsWith("# "));
  const tree = files ? buildTree(files) : undefined;

  return (
    <div className={cn("dark ide not-prose border border-fd-border bg-[var(--color-card-base)] text-fd-foreground shadow-lg", className)}>
      <div className="flex h-9 items-center gap-3 border-b border-fd-border px-3" aria-hidden="true">
        <span className="flex gap-1.5">
          {DOTS.map((dot) => (
            <span key={dot} className="size-2.5 rounded-full bg-fd-secondary" />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-inter text-xs text-fd-muted-foreground">
          {fileName} · {workspace}
        </span>
        <Settings className="size-3.5 text-fd-muted-foreground" />
      </div>

      <div className={cn("grid", tree ? "md:grid-cols-[auto_14rem_minmax(0,1fr)]" : "grid-cols-1")}>
        {tree ? (
          <div className="hidden flex-col items-center gap-4 border-e border-fd-border py-3 md:flex" aria-hidden="true">
            {ACTIVITY.map((Icon, index) => (
              <Icon
                key={index}
                className={cn("size-5", index === 0 ? "text-fd-foreground" : "text-fd-muted-foreground")}
                strokeWidth={1.75}
              />
            ))}
          </div>
        ) : null}

        {tree ? (
          <nav aria-label={labels.explorer} className="hidden border-e border-fd-border py-2 md:block">
            <p className="m-0 px-4 pb-2 font-inter text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">
              {labels.explorer}
            </p>
            <p className="m-0 flex items-center gap-1 px-2 pb-1 font-inter text-xs font-semibold uppercase tracking-wide">
              <ChevronDown className="size-3.5" aria-hidden="true" />
              {workspace}
            </p>
            <FolderView folder={tree} depth={1} activeHref={activeHref} />
          </nav>
        ) : null}

        <div className="min-w-0">
          <div className="flex items-stretch border-b border-fd-border bg-fd-background/40">
            <span className="flex items-center gap-2 border-e border-t-2 border-e-fd-border border-t-[var(--color-acid)] bg-[var(--color-card-base)] px-3 py-2 text-xs">
              <MarkdownGlyph />
              <span className="truncate">{fileName}</span>
              <X className="size-3 text-fd-muted-foreground" aria-hidden="true" />
            </span>
          </div>
          <div
            className="flex items-center gap-1 overflow-hidden whitespace-nowrap px-4 py-1.5 font-inter text-[11px] text-fd-muted-foreground"
            aria-hidden="true"
          >
            <span className="max-sm:hidden">{workspace}</span>
            <ChevronRight className="size-3 shrink-0 max-sm:hidden" />
            <span className="shrink-0">{fileName}</span>
            {firstHeading ? (
              <>
                <ChevronRight className="size-3 shrink-0" />
                <span className="min-w-0 truncate">{firstHeading}</span>
              </>
            ) : null}
          </div>
          <div
            className={cn("grid grid-cols-[minmax(0,1fr)_auto]", compact && "max-h-80 overflow-y-auto")}
            // A scrolling box must be reachable by keyboard.
            tabIndex={compact ? 0 : undefined}
            role={compact ? "region" : undefined}
            aria-label={compact ? fileName : undefined}
          >
            {/* not-fumadocs-codeblock: opts out of the docs code block line padding. */}
            <div className="ide-code not-fumadocs-codeblock min-w-0 pb-6">{highlighted}</div>
            <Minimap lines={lines} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-[var(--color-acid)] px-3 py-1 font-inter text-[11px] font-medium text-black">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3" aria-hidden="true" />
          main
        </span>
        <span className="inline-flex items-center gap-1">
          <Bot className="size-3" aria-hidden="true" />
          {labels.aiReadable}
        </span>
        <span className="ms-auto">
          {lines.length} {labels.lines}
        </span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Markdown</span>
      </div>
    </div>
  );
}

function FolderView({ folder, depth, activeHref }: { folder: Folder; depth: number; activeHref?: string }) {
  const indent = { paddingInlineStart: `${depth * 0.75 + 0.5}rem` };
  return (
    <ul className="m-0 list-none p-0">
      {folder.folders.map((child) => (
        <li key={child.name}>
          <span className="flex items-center gap-1 py-0.5 font-inter text-xs text-fd-muted-foreground" style={indent}>
            <ChevronDown className="size-3.5" aria-hidden="true" />
            {child.name}
          </span>
          <FolderView folder={child} depth={depth + 1} activeHref={activeHref} />
        </li>
      ))}
      {folder.files.map((file) => {
        const active = file.href === activeHref;
        return (
          <li key={file.href}>
            <DocsLink
              href={file.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 py-0.5 pe-2 font-inter text-xs transition-colors",
                active ? "bg-fd-secondary text-fd-foreground" : "text-fd-muted-foreground hover:bg-fd-secondary/60 hover:text-fd-foreground",
              )}
              style={{ paddingInlineStart: `${depth * 0.75 + 1.4}rem` }}
            >
              {file.name.endsWith(".md") ? <MarkdownGlyph /> : <FileText className="size-3.5 shrink-0" aria-hidden="true" />}
              <span className="truncate">{file.name}</span>
            </DocsLink>
          </li>
        );
      })}
    </ul>
  );
}

/** The editor's file-type glyph for Markdown: M and a down arrow. */
function MarkdownGlyph() {
  return (
    <svg viewBox="0 0 24 16" className="h-3 w-[1.1rem] shrink-0 text-[var(--color-acid)]" aria-hidden="true">
      <rect x="0.75" y="0.75" width="22.5" height="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12V4l3 3.5L10 4v8M15 8.5l2.5 3 2.5-3M17.5 4v7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** A scaled-down picture of the file: a bar per line, as long as the line. */
function Minimap({ lines }: { lines: string[] }) {
  return (
    <div className="hidden w-16 border-s border-fd-border px-1.5 pt-2 lg:block" aria-hidden="true">
      {lines.map((line, index) => (
        <span
          key={index}
          className={cn(
            "mb-px block h-[2px]",
            line.startsWith("#") ? "bg-[var(--color-acid)]" : line.startsWith("```") ? "bg-[#4ade80]/60" : "bg-fd-muted-foreground/40",
          )}
          style={{ width: `${Math.min(100, line.length)}%` }}
        />
      ))}
    </div>
  );
}
