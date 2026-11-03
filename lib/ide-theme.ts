/**
 * The editor view's syntax colours. Markdown only has a few kinds of token:
 * headings and list markers take the brand purple (tokens.css --color-acid),
 * code takes the dashboard's code-surface green, quotes and rules go quiet.
 * The background is the tokens' --color-card-base. Shiki needs literal
 * colours, so these mirror those tokens.
 */
export const IDE_THEME = {
  name: "square-share-ide",
  type: "dark" as const,
  colors: {
    "editor.background": "#0a0a0c",
    "editor.foreground": "#e5e5e5",
  },
  tokenColors: [
    { settings: { foreground: "#e5e5e5" } },
    {
      scope: ["markup.heading", "entity.name.section", "punctuation.definition.heading"],
      settings: { foreground: "#a855f7", fontStyle: "bold" },
    },
    { scope: ["markup.bold", "punctuation.definition.bold"], settings: { foreground: "#ffffff", fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    {
      scope: ["punctuation.definition.list.begin", "beginning.punctuation.definition.list", "markup.list.numbered"],
      settings: { foreground: "#a855f7" },
    },
    {
      scope: ["markup.underline.link", "string.other.link", "meta.link", "constant.other.reference.link"],
      settings: { foreground: "#a855f7" },
    },
    {
      scope: ["markup.inline.raw", "markup.fenced_code", "markup.raw", "fenced_code.block.language"],
      settings: { foreground: "#4ade80" },
    },
    { scope: ["markup.quote", "punctuation.definition.quote"], settings: { foreground: "#a1a1a1", fontStyle: "italic" } },
    { scope: ["meta.separator", "punctuation.definition.table", "markup.table"], settings: { foreground: "#a1a1a1" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#737373" } },
  ],
};
