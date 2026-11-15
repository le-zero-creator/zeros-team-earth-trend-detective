import { readFileSync } from 'node:fs'

/** Le handler ne peut pas être appelé ici : la clé Google reste sur Vercel. On verrouille le contrat. */
const source = readFileSync('api/ask.ts', 'utf8')

describe('contrat Ask Terra', () => {
  it('utilise gemini-3.8-flash, sans budget de réflexion, et un délai de 60 s', () => {
    expect(source).toContain("const FLASH_MODEL = 'gemini-3.8-flash'")
    expect(source).toContain("thinkingLevel: 'minimal'")
    expect(source).toContain('thinkingBudget: 0')
    expect(source).toContain('export const maxDuration = 60')
    expect(source).toContain("error: 'late'")
    expect(source).toContain('flushHeaders')
  })
})
