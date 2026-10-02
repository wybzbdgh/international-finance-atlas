import { writeFileSync } from 'node:fs'
import { earlyTheories } from '../src/theory-early.ts'
import { modernTheories } from '../src/theory-modern.ts'

const entries = [...earlyTheories, ...modernTheories].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
if (entries.length !== 46 || new Set(entries.map(entry => entry.id)).size !== 46) throw new Error('Expected 46 distinct theory entries')
const index = entries.map(({ id, year, yearLabel, title, authors, kind, question, lessonIds, terms }) => ({ id, year, yearLabel, title, authors, kind, question, lessonIds, terms }))
writeFileSync(new URL('../src/theory-index.json', import.meta.url), JSON.stringify(index, null, 2) + '\n')
console.log(`Theory navigation: ${index.length} entries`)
