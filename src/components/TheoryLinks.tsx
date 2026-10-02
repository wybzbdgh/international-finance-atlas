import { Fragment, type ReactNode } from 'react'
import type { Lesson } from '../content'
import { rememberTheoryOrigin, theoryHref, theoryIndex } from '../theory-navigation'
import type { TheoryIndexEntry } from '../theory-types'

export function theoryLinksForLesson(lesson: Lesson) {
  const used = new Set<string>()
  const found = new Map<string, { start: number; end: number; entry: TheoryIndexEntry }[]>()
  const candidates = theoryIndex.filter(entry => entry.lessonIds.includes(lesson.id))
  const paragraphs = lesson.sections.flatMap(section => [...section.paragraphs, ...(section.subsections?.flatMap(sub => sub.paragraphs) || [])])
  for (const text of paragraphs) {
    if (found.has(text)) continue
    const matches: { start: number; end: number; entry: TheoryIndexEntry }[] = []
    for (const entry of candidates) {
      if (used.has(entry.id)) continue
      const term = [...entry.terms].sort((a, b) => b.length - a.length).find(term => text.includes(term))
      if (!term) continue
      const start = text.indexOf(term), end = start + term.length
      if (matches.some(match => start < match.end && end > match.start)) continue
      matches.push({ start, end, entry }); used.add(entry.id)
      if (matches.length >= 2) break
    }
    if (matches.length) found.set(text, matches.sort((a, b) => a.start - b.start))
  }
  return found
}

export function LinkedParagraphs({ texts, links, anchorPrefix }: { texts: string[]; links: ReturnType<typeof theoryLinksForLesson>; anchorPrefix: string }) {
  return <>{texts.map((text, i) => {
    const matches = links.get(text)
    if (!matches?.length) return <p key={i} id={anchorPrefix + '-p-' + i} data-reading-anchor>{text}</p>
    const parts: ReactNode[] = []; let end = 0
    for (const match of matches) {
      parts.push(text.slice(end, match.start))
      parts.push(<a className="theory-term" href={theoryHref(match.entry.id)} onClick={() => rememberTheoryOrigin(match.entry.id)} title={`${match.entry.authors} · ${match.entry.yearLabel} · 阅读原文与推导`} key={match.entry.id}>{text.slice(match.start, match.end)}<span aria-hidden="true">↗</span><span className="sr-only">，理论深思：{match.entry.title}</span></a>)
      end = match.end
    }
    parts.push(text.slice(end))
    return <p key={i} id={anchorPrefix + '-p-' + i} data-reading-anchor>{parts.map((part, n) => <Fragment key={n}>{part}</Fragment>)}</p>
  })}</>
}

export function LessonTheoryReading({ lesson }: { lesson: Lesson }) {
  const entries = theoryIndex.filter(entry => entry.lessonIds.includes(lesson.id))
  if (!entries.length) return null
  return <section className="lesson-theory-reading" id="topic-theories"><h2>理论深思</h2><div>{entries.map(entry => <a href={theoryHref(entry.id)} key={entry.id} onClick={() => rememberTheoryOrigin(entry.id)}><time>{entry.yearLabel}</time><span>{entry.title}<small>{entry.authors}</small></span><span aria-hidden="true">↗</span></a>)}</div></section>
}
