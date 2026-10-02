import type { LessonId } from './content'

export type TheoryKind = 'theory' | 'puzzle' | 'proposal' | 'history'
export type TheorySource = { title: string; url: string; note: string; quote?: string; translation?: string; excerptLabel?: string }
export type TheoryEntry = {
  id: string
  year: number
  yearLabel: string
  title: string
  authors: string
  originalTitle: string
  kind: TheoryKind
  question: string
  lessonIds: LessonId[]
  terms: string[]
  sections: { title: string; paragraphs: string[] }[]
  sources: TheorySource[]
  formulas?: { expression: string; explanation: string }[]
  figure?: string
  related: string[]
}
export type TheoryIndexEntry = Pick<TheoryEntry, 'id' | 'year' | 'yearLabel' | 'title' | 'authors' | 'kind' | 'question' | 'lessonIds' | 'terms'>
