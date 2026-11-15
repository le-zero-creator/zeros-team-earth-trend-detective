import { readFileSync } from 'node:fs'

const source = readFileSync('api/ask.ts', 'utf8')

describe('contrat Ask Terra', () => {
  it('appelle generateText, liste les modèles flash, et ne renvoie pas la clé', () => {
    expect(source).toContain('generateText')
    expect(source).not.toContain('streamText')
    expect(source).toContain("const FLASH_MODEL = 'gemini-3.8-flash'")
    expect(source).toContain('generativelanguage.googleapis.com/v1beta/models')
    expect(source).toContain('thinkingBudget: 0')
    expect(source).toContain("split(key).join('[key]')")
  })
})
