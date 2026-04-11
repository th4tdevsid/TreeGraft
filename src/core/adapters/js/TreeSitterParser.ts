import type { StructuralParser } from '@core/interfaces/StructuralParser'
import type { Entity, Language, SyntaxTree } from '@core/interfaces/types'

export class TreeSitterParser implements StructuralParser {
  parse(_code: string, _language: Language): Promise<SyntaxTree> {
    throw new Error('Not implemented')
  }

  extractEntities(_code: string, _language: Language): Promise<Entity[]> {
    throw new Error('Not implemented')
  }

  detectLanguage(_filePath: string): Language | null {
    throw new Error('Not implemented')
  }
}
