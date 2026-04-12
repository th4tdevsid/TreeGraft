import type { SyntaxNode, SyntaxTree } from "@core/interfaces/types";

// ---------------------------------------------------------------------------
// Token types
// ---------------------------------------------------------------------------

export interface Token {
  text: string;
  cssClass: string;
}

// ---------------------------------------------------------------------------
// Node type → CSS class mappings
// ---------------------------------------------------------------------------

/** Named node types → token class */
const NAMED_TYPE_CLASS: Record<string, string> = {
  comment: "tokComment",
  line_comment: "tokComment",
  block_comment: "tokComment",
  doc_comment: "tokComment",
  string: "tokString",
  string_literal: "tokString",
  raw_string_literal: "tokString",
  char_literal: "tokString",
  template_string: "tokString",
  interpreted_string_literal: "tokString",
  raw_string_content: "tokString",
  number: "tokNumber",
  integer: "tokNumber",
  integer_literal: "tokNumber",
  float_literal: "tokNumber",
  decimal_integer_literal: "tokNumber",
  hex_integer_literal: "tokNumber",
  identifier: "tokIdentifier",
  type_identifier: "tokType",
  primitive_type: "tokType",
  predefined_type: "tokType",
  builtin_type: "tokType",
  property_identifier: "tokProperty",
  field_identifier: "tokProperty",
  escape_sequence: "tokEscape",
  regex: "tokRegex",
  regex_pattern: "tokRegex",
};

/** Unnamed node types that are keywords */
const KEYWORDS = new Set([
  // JS / TS
  "import",
  "export",
  "from",
  "default",
  "const",
  "let",
  "var",
  "function",
  "class",
  "extends",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "new",
  "delete",
  "typeof",
  "instanceof",
  "in",
  "of",
  "async",
  "await",
  "try",
  "catch",
  "finally",
  "throw",
  "yield",
  "static",
  "public",
  "private",
  "protected",
  "abstract",
  "interface",
  "type",
  "enum",
  "namespace",
  "declare",
  "module",
  "implements",
  "super",
  "this",
  "true",
  "false",
  "null",
  "undefined",
  "void",
  "never",
  "as",
  "satisfies",
  // Python
  "def",
  "lambda",
  "with",
  "pass",
  "global",
  "nonlocal",
  "assert",
  "del",
  "raise",
  "not",
  "and",
  "or",
  "is",
  "elif",
  "except",
  "print",
  // Rust
  "fn",
  "mut",
  "pub",
  "use",
  "mod",
  "struct",
  "impl",
  "trait",
  "where",
  "match",
  "Self",
  "self",
  "crate",
  "move",
  "ref",
  "unsafe",
  "extern",
  "dyn",
  "loop",
  "box",
  // Java
  "package",
  "throws",
  "final",
  "synchronized",
  "transient",
  "volatile",
  "native",
  "strictfp",
  "goto",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "boolean",
  "char",
  "void",
]);

function nodeTypeToCssClass(type: string, isNamed: boolean): string {
  if (isNamed) return NAMED_TYPE_CLASS[type] ?? "";
  // Unnamed leaf — check if it's a keyword
  if (KEYWORDS.has(type)) return "tokKeyword";
  return "";
}

// ---------------------------------------------------------------------------
// Leaf collection
// ---------------------------------------------------------------------------

interface LeafToken {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  cssClass: string;
}

function collectLeaves(node: SyntaxNode, out: LeafToken[]): void {
  if (node.children.length === 0) {
    const cssClass = nodeTypeToCssClass(node.type, node.isNamed);
    out.push({
      startRow: node.startPosition.row,
      startCol: node.startPosition.column,
      endRow: node.endPosition.row,
      endCol: node.endPosition.column,
      cssClass,
    });
    return;
  }
  for (const child of node.children) {
    collectLeaves(child, out);
  }
}

// ---------------------------------------------------------------------------
// tokenizeFile
//
// Returns a map from 0-based line index → Token[].
// Call this once per file after parsing; reuse the result for all lines.
// ---------------------------------------------------------------------------

export function tokenizeFile(tree: SyntaxTree): Map<number, Token[]> {
  const sourceLines = tree.source.split("\n");
  const leaves: LeafToken[] = [];
  collectLeaves(tree.rootNode, leaves);

  const map = new Map<number, Token[]>();

  // Build token spans for each line
  sourceLines.forEach((lineText, lineIdx) => {
    const lineleaves = leaves.filter(
      (l) => l.startRow <= lineIdx && l.endRow >= lineIdx,
    );

    if (lineleaves.length === 0) {
      map.set(lineIdx, [{ text: lineText, cssClass: "" }]);
      return;
    }

    const tokens: Token[] = [];
    let col = 0;

    for (const leaf of lineleaves) {
      const leafStart = leaf.startRow === lineIdx ? leaf.startCol : 0;
      const leafEnd = leaf.endRow === lineIdx ? leaf.endCol : lineText.length;

      // Text before this leaf (unstyled)
      if (leafStart > col) {
        tokens.push({ text: lineText.slice(col, leafStart), cssClass: "" });
      }

      if (leafStart < leafEnd) {
        tokens.push({
          text: lineText.slice(leafStart, leafEnd),
          cssClass: leaf.cssClass,
        });
      }

      col = Math.max(col, leafEnd);
    }

    // Remaining text after last leaf
    if (col < lineText.length) {
      tokens.push({ text: lineText.slice(col), cssClass: "" });
    }

    map.set(
      lineIdx,
      tokens.filter((t) => t.text.length > 0),
    );
  });

  return map;
}
