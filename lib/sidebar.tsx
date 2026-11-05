import type { Node, Root } from "fumadocs-core/page-tree";

/**
 * The sidebar's section titles as headings: a sighted reader scans the bold
 * uppercase titles, and a screen reader jumps between them the same way (WCAG
 * 1.3.1). A folder with its own page stays a link, so only titles that are
 * plain text change, and only in the tree the sidebar draws; breadcrumbs and
 * JSON-LD read the source tree. The look is visuals.css's.
 */
export function withSectionHeadings(tree: Root): Root {
  return { ...tree, children: tree.children.map((node) => asHeading(node, 2)) };
}

function asHeading(node: Node, level: number): Node {
  if (node.type === "separator" && node.name) {
    return { ...node, name: <span role="heading" aria-level={level}>{node.name}</span> };
  }
  if (node.type !== "folder") return node;
  return {
    ...node,
    name: node.index ? node.name : <span role="heading" aria-level={level}>{node.name}</span>,
    children: node.children.map((child) => asHeading(child, level + 1)),
  };
}
