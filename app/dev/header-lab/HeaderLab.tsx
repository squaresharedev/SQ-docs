"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { HEADER_ACTIONS_LOOK, HeaderActions, type HeaderActionsLayout, type HeaderActionsLook } from "@/components/HeaderActions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { SearchMobileTrigger, SearchTrigger } from "@/components/search";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import { CTA_STYLES, FRAMES, LANG_STYLES, SLIDERS, THEME_STYLES, lookFromHash, lookToHash, lookToJsx, shuffle, withDefaults } from "./lab-model";
import { LAB_GROUPS, LAB_PRESETS, LAB_SHORTLIST, type HeaderPreset } from "./presets";

type Width = "desktop" | "tablet" | "phone";
const WIDTH_PX: Record<Width, number> = { desktop: 1280, tablet: 768, phone: 375 };
const LAYOUT: Record<Width, HeaderActionsLayout> = { desktop: "desktop", tablet: "tablet", phone: "phone" };

export function HeaderLab() {
  const [look, setLook] = useState<HeaderActionsLook>(() => lookFromHash(window.location.hash));
  const [tab, setTab] = useState<string>("shortlist");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    window.history.replaceState(null, "", `#${lookToHash(look)}`);
  }, [look]);

  useEffect(() => {
    const onHash = () => setLook(lookFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const set = <K extends keyof HeaderActionsLook>(key: K, value: HeaderActionsLook[K]) => setLook((prev) => ({ ...prev, [key]: value }));

  async function copy(kind: "jsx" | "link") {
    await navigator.clipboard.writeText(kind === "jsx" ? lookToJsx(look) : window.location.href);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  }

  function open(preset: HeaderPreset) {
    setLook(withDefaults(preset.look));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const presets =
    tab === "shortlist"
      ? LAB_SHORTLIST.map(({ id, why }) => ({ preset: LAB_PRESETS.find((p) => p.id === id)!, why }))
      : LAB_PRESETS.filter((p) => p.group === tab).map((preset) => ({ preset, why: null }));

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <header className="mb-6">
        <p className="eyebrow text-fd-muted-foreground">Dev lab</p>
        <h1 className="mt-1 text-2xl font-bold">Header: language, theme, Get started</h1>
        <p className="mt-1 max-w-3xl text-sm text-fd-muted-foreground">
          Tune the right side of the header. Every preview is the real HeaderActions inside the real header bar; dark boxes use the dark palette.
          Send a pick back with Copy JSX or Copy link.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-6" aria-label="Controls">
          <Field label="Language">
            <Select value={look.lang} options={LANG_STYLES} onChange={(v) => set("lang", v)} />
          </Field>
          <Field label="Language label">
            <Select
              value={look.langLabel}
              options={[
                { value: "code", label: "Code: CS" },
                { value: "name", label: "Name: Čeština" },
              ]}
              onChange={(v) => set("langLabel", v)}
            />
          </Field>
          <Field label="Theme">
            <Select value={look.theme} options={THEME_STYLES} onChange={(v) => set("theme", v)} />
          </Field>
          <Field label="Theme icons">
            <Select
              value={look.themeIcons}
              options={[
                { value: "line", label: "Lines" },
                { value: "fill", label: "Filled" },
              ]}
              onChange={(v) => set("themeIcons", v)}
            />
          </Field>
          <Field label="Frame">
            <Select value={look.frame} options={FRAMES} onChange={(v) => set("frame", v)} />
          </Field>
          <Field label="Get started">
            <Select value={look.cta} options={CTA_STYLES} onChange={(v) => set("cta", v)} />
          </Field>
          {(Object.keys(SLIDERS) as (keyof typeof SLIDERS)[]).map((key) => {
            const spec = SLIDERS[key];
            return (
              <Field key={key} label={`${spec.label}: ${look[key]}${spec.unit}`}>
                <input
                  type="range"
                  min={spec.min}
                  max={spec.max}
                  step={spec.step}
                  value={look[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                  className="w-full accent-fd-foreground"
                />
              </Field>
            );
          })}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={look.divider} onChange={(e) => set("divider", e.target.checked)} className="size-4 accent-fd-foreground" />
            Hairline before Get started
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <LabButton onClick={() => setLook(shuffle())}>Shuffle</LabButton>
            <LabButton onClick={() => setLook(HEADER_ACTIONS_LOOK)}>Reset</LabButton>
            <LabButton onClick={() => copy("jsx")}>{copied === "jsx" ? "Copied" : "Copy JSX"}</LabButton>
            <LabButton onClick={() => copy("link")}>{copied === "link" ? "Copied" : "Copy link"}</LabButton>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <section aria-label="Playground" className="flex flex-col gap-4">
            {(["desktop", "tablet", "phone"] as const).map((width) => (
              <div key={width} className="flex flex-col gap-1.5">
                <p className="eyebrow text-fd-muted-foreground">
                  {width} · {WIDTH_PX[width]} px
                </p>
                <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-3", width === "phone" && "sm:grid-cols-2 xl:grid-cols-3")}>
                  <Scaled width={WIDTH_PX[width]}>
                    <HeaderBar look={look} width={width} />
                  </Scaled>
                  <Scaled width={WIDTH_PX[width]}>
                    <HeaderBar look={look} width={width} dark />
                  </Scaled>
                </div>
              </div>
            ))}
            <pre className="overflow-x-auto border border-fd-border bg-fd-muted p-3 text-xs">{lookToJsx(look)}</pre>
          </section>

          <section aria-label="Presets" className="flex flex-col gap-4">
            <div role="tablist" className="flex flex-wrap gap-1 border-b border-fd-border">
              {LAB_GROUPS.map((group) => (
                <button
                  key={group.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === group.id}
                  onClick={() => setTab(group.id)}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
                    tab === group.id ? "border-fd-foreground text-fd-foreground" : "border-transparent text-fd-muted-foreground hover:text-fd-foreground",
                  )}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {tab === "reference" ? (
              <Tile name="First version" note="What the header had: filled EN / CS, Fumadocs' sun and moon toggle, the filled button; three heights." fit="on-brand">
                <ReferenceStrip />
                <ReferenceStrip dark />
              </Tile>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {presets.map(({ preset, why }, index) => (
                  <Tile
                    key={preset.id}
                    name={tab === "shortlist" ? `${index + 1}. ${preset.name}` : preset.name}
                    note={why ?? preset.note}
                    fit={preset.fit}
                    onOpen={() => open(preset)}
                  >
                    <ActionsStrip look={withDefaults(preset.look)} />
                    <ActionsStrip look={withDefaults(preset.look)} dark />
                  </Tile>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/** The real header row (SiteHeader's markup) at a fixed width. */
function HeaderBar({ look, width, dark }: { look: HeaderActionsLook; width: Width; dark?: boolean }) {
  const phone = width === "phone";
  return (
    <div className={cn(dark && "dark", "bg-fd-background text-fd-foreground")} style={{ width: WIDTH_PX[width] }}>
      {/* SiteHeader's row: px-4 gap-2 on a phone, px-6 gap-3 from md. */}
      <div className={cn("flex h-14 items-center border-b border-fd-border", phone ? "gap-2 px-4" : "gap-3 px-6")}>
        {/* The Logo grows at sm by the viewport; a phone box draws its phone size. */}
        <span className={cn("flex shrink-0 items-center", phone && "[&_span>span]:text-base! [&_svg]:size-5!")}>
          <Logo />
        </span>
        {phone ? null : (
          <div className="ms-6 flex min-w-0 flex-1">
            <SearchTrigger />
          </div>
        )}
        <div className={cn("ms-auto flex items-center", phone ? "gap-1.5" : "gap-2")}>
          <HeaderActions look={look} layout={LAYOUT[width]} shownTheme={dark ? "dark" : "light"} />
          {phone ? (
            <>
              <SearchMobileTrigger />
              <span className="inline-flex size-10 items-center justify-center">
                <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** A tile's preview: the right side of the desktop header. */
function ActionsStrip({ look, dark }: { look: HeaderActionsLook; dark?: boolean }) {
  return (
    <div className={cn(dark && "dark", "flex h-16 items-center justify-end border-b border-fd-border bg-fd-background px-5 text-fd-foreground")}>
      <HeaderActions look={look} layout="desktop" shownTheme={dark ? "dark" : "light"} />
    </div>
  );
}

function ReferenceStrip({ dark }: { dark?: boolean }) {
  return (
    <div className={cn(dark && "dark", "flex h-16 items-center justify-end gap-2 border-b border-fd-border bg-fd-background px-5 text-fd-foreground")}>
      <LanguageSwitcher />
      <ThemeSwitch shown={dark ? "dark" : "light"} />
      <a href="#" className="docs-button docs-button-sm" data-external="">
        {COPY.en.getStarted}
      </a>
    </div>
  );
}

function Tile({ name, note, fit, onOpen, children }: { name: string; note: string; fit: string; onOpen?: () => void; children: ReactNode }) {
  return (
    <article className="flex flex-col border border-fd-border">
      <div className="overflow-hidden">{children}</div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            {name} <span className="eyebrow ms-1 text-fd-muted-foreground">{fit}</span>
          </h3>
          <p className="mt-0.5 text-sm text-fd-muted-foreground">{note}</p>
        </div>
        {onOpen ? <LabButton onClick={onOpen}>Open</LabButton> : null}
      </div>
    </article>
  );
}

/** Draws a fixed-width child scaled down to the space it has. */
function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return;
      const next = Math.min(1, outer.current.clientWidth / width);
      setScale(next);
      setHeight(inner.current.offsetHeight * next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="min-w-0 overflow-hidden border border-fd-border" style={{ height }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="eyebrow text-fd-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Select<T extends string>({ value, options, onChange }: { value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-9 border border-fd-border bg-fd-background px-2 text-sm text-fd-foreground"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function LabButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 shrink-0 border border-fd-border px-3 text-sm font-medium hover:border-fd-foreground"
    >
      {children}
    </button>
  );
}
