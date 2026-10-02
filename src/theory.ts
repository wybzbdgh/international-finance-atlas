import { earlyTheories } from './theory-early'
import { modernTheories } from './theory-modern'

export const theories = [...earlyTheories, ...modernTheories].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
export const theoryById = (id?: string) => theories.find(entry => entry.id === id)
