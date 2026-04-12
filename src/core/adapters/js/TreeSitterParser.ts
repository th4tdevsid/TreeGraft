import Parser from "web-tree-sitter";
import type { StructuralParser } from "@core/interfaces/StructuralParser";
import type {
  Entity,
  Language,
  SyntaxNode,
  SyntaxTree,
} from "@core/interfaces/types";

// ---------------------------------------------------------------------------
// Language → wasm file mapping
// Grammar wasm files must be placed in public/tree-sitter/grammars/.
// Build or download them via:
//   npx tree-sitter build-wasm node_modules/tree-sitter-<lang>
// ---------------------------------------------------------------------------
const LANGUAGE_WASM: Record<Language, string> = {
  typescript: "tree-sitter-typescript.wasm",
  javascript: "tree-sitter-javascript.wasm",
  python: "tree-sitter-python.wasm",
  java: "tree-sitter-java.wasm",
  rust: "tree-sitter-rust.wasm",
};

const EXTENSION_TO_LANGUAGE: Record<string, Language> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".py": "python",
  ".java": "java",
  ".rs": "rust",
};

export class TreeSitterParser implements StructuralParser {
  private initPromise: Promise<void> | null = null;
  private ready = false;
  private languageCache = new Map<Language, Parser.Language>();

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  private init(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.initPromise !== null) return this.initPromise;

    this.initPromise = Parser.init({
      // Resolve relative to document.baseURI so this works for both
      // the Vite dev server (http://localhost:5173/) and production
      // Electron (file:///path/to/dist/index.html).
      locateFile: (name: string) =>
        new URL(`tree-sitter/${name}`, document.baseURI).href,
    }).then(() => {
      this.ready = true;
    });

    return this.initPromise;
  }

  private async loadLanguage(language: Language): Promise<Parser.Language> {
    const cached = this.languageCache.get(language);
    if (cached !== undefined) return cached;

    await this.init();
    const wasmFile = LANGUAGE_WASM[language];
    const lang = await Parser.Language.load(
      new URL(`tree-sitter/grammars/${wasmFile}`, document.baseURI).href,
    );
    this.languageCache.set(language, lang);
    return lang;
  }

  // ---------------------------------------------------------------------------
  // StructuralParser interface
  // ---------------------------------------------------------------------------

  async parse(code: string, language: Language): Promise<SyntaxTree> {
    const lang = await this.loadLanguage(language);
    const tsParser = new Parser();
    tsParser.setLanguage(lang);
    const tree = tsParser.parse(code);
    const rootNode = adaptNode(tree.rootNode);
    tsParser.delete();

    return { language, source: code, rootNode };
  }

  // Stub for v1 — entity extraction is a v2 feature
  async extractEntities(_code: string, _language: Language): Promise<Entity[]> {
    return [];
  }

  detectLanguage(filePath: string): Language | null {
    const dot = filePath.lastIndexOf(".");
    if (dot === -1) return null;
    const ext = filePath.slice(dot).toLowerCase();
    return EXTENSION_TO_LANGUAGE[ext] ?? null;
  }
}

// ---------------------------------------------------------------------------
// Tree adaptation: Parser.SyntaxNode → our SyntaxNode type
// ---------------------------------------------------------------------------

function adaptNode(node: Parser.SyntaxNode): SyntaxNode {
  return {
    type: node.type,
    startPosition: {
      row: node.startPosition.row,
      column: node.startPosition.column,
    },
    endPosition: { row: node.endPosition.row, column: node.endPosition.column },
    startIndex: node.startIndex,
    endIndex: node.endIndex,
    text: node.text,
    childCount: node.childCount,
    isNamed: node.isNamed,
    // Adapt all children recursively
    children: node.children.map(adaptNode),
  };
}
