import type { Entity, Language, SyntaxTree } from "./types";

export interface StructuralParser {
  parse(code: string, language: Language): Promise<SyntaxTree>;
  extractEntities(code: string, language: Language): Promise<Entity[]>;
  detectLanguage(filePath: string): Language | null;
}
