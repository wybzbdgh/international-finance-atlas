import data from './course-data.json'
import type { ActivityId } from './activities-data'

export type LessonId = 'foundations' | 'accounts' | 'fx-market' | 'long-run' | 'short-run' | 'policy' | 'globalization' | 'regimes' | 'currency-crises' | 'crisis' | 'sovereign-debt' | 'governance' | 'development-finance' | 'capital-markets' | 'enterprise' | 'dollar' | 'sanctions' | 'renminbi' | 'digital-money' | 'future'
export type ExperimentId = 'accounts' | 'arbitrage' | 'prices' | 'parity' | 'overshoot' | 'policy' | 'sharing' | 'trilemma' | 'crisis' | 'debt' | 'funding' | 'hedge' | 'payment' | 'stablecoin'
export type Reading = { author: string; year: string; title: string; question: string; finding: string; limit: string; href: string }
export type Formula = { expression: string; explanation: string }
export type ComparisonTable = { caption: string; headers: string[]; rows: string[][] }
export type Section = { id: string; title: string; paragraphs: string[]; subsections?: { title: string; paragraphs: string[] }[]; formulas?: Formula[]; table?: ComparisonTable; activity?: ActivityId }
export type Quiz = { id: string; question: string; choices: string[]; answer: number; explanation: string }
export type CaseStudy = { title: string; paragraphs: string[] }
export type Lesson = {
  id: LessonId
  moduleId: string
  short: string
  title: string
  subtitle: string
  objectives: string[]
  experiments: ExperimentId[]
  sections: Section[]
  cases?: CaseStudy[]
  readings?: Reading[]
  quizzes: Quiz[]
}
export type CourseModule = { id: string; title: string; description: string }
const course = data as { modules: CourseModule[]; lessons: Lesson[] }
export const lessons = course.lessons
export const courseModules = course.modules
export const lessonHref = (id: LessonId, section?: 'cases' | 'readings') => '#learn/' + id + (section ? '/' + section : '')
const aliases: Record<string, LessonId> = { exchange: 'fx-market', system: 'dollar' }
export const lessonById = (id: string) => lessons.find(lesson => lesson.id === (aliases[id] || id))
export const courseStats = {
  topics: lessons.length,
  cases: lessons.reduce((n, lesson) => n + (lesson.cases?.length || 0), 0),
  readings: lessons.reduce((n, lesson) => n + (lesson.readings?.length || 0), 0),
  quizzes: lessons.reduce((n, lesson) => n + lesson.quizzes.length, 0),
  experiments: new Set([...lessons.flatMap(lesson => lesson.experiments), ...lessons.flatMap(lesson => lesson.sections.flatMap(section => section.activity ? [section.activity] : []))]).size,
}
