import { crossRate, type Rate, type RateSnapshot } from './fx.ts'

export const isoToday = () => new Date().toISOString().slice(0, 10)
export function shiftDate(date: string, days: number): string {
  const value = new Date(date + 'T12:00:00Z'); value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
export function monthsBefore(date: string, months: number): string {
  const value = new Date(date + 'T12:00:00Z'), day = value.getUTCDate()
  value.setUTCDate(1); value.setUTCMonth(value.getUTCMonth() - months)
  const last = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate()
  value.setUTCDate(Math.min(day, last)); return value.toISOString().slice(0, 10)
}
export type ReplayRange = 'year' | 'five' | 'since2008'
export function replayTicks(today: string, range: ReplayRange): string[] {
  const start = range === 'since2008' ? '2008-01-01' : monthsBefore(today, range === 'five' ? 60 : 12)
  const step = range === 'year' ? 1 : range === 'five' ? 3 : 12
  const ticks = [start]
  for (let i = 1; i < 300; i++) {
    const date = monthsBefore(start, -i * step)
    if (date >= today) break
    ticks.push(date)
  }
  ticks.push(today); return ticks
}
export function nearestDateIndex(dates: string[], date: string): number {
  if (!dates.length) return -1
  const target = Date.parse(date)
  return dates.reduce((best, d, i) => Math.abs(Date.parse(d) - target) < Math.abs(Date.parse(dates[best]) - target) ? i : best, 0)
}
export function snapshotFromRows(rows: Rate[]): { values: RateSnapshot; dates: Record<string, string> } {
  const values: RateSnapshot = { USD: 1 }, dates: Record<string, string> = {}
  for (const row of rows) if (row.base === 'USD' && row.rate > 0 && Number.isFinite(row.rate) && (!dates[row.quote] || row.date >= dates[row.quote])) {
    values[row.quote] = row.rate; dates[row.quote] = row.date
  }
  return { values, dates }
}
export type PairPoint = { date: string; value: number }
export function pairSeries(rows: Rate[], base: string, quote: string): PairPoint[] {
  const dates = new Map<string, RateSnapshot>()
  for (const row of rows) {
    if (row.base !== 'USD' || !Number.isFinite(row.rate) || row.rate <= 0) continue
    const snapshot = dates.get(row.date) || { USD: 1 }
    snapshot[row.quote] = row.rate; dates.set(row.date, snapshot)
  }
  return [...dates].sort(([a], [b]) => a.localeCompare(b)).flatMap(([date, snapshot]) => {
    const value = crossRate(snapshot, base, quote)
    return value === undefined ? [] : [{ date, value }]
  })
}
export type ComparisonSeries = { code: string; points: PairPoint[]; raw: PairPoint[] }
export function normalizeComparison(rows: Rate[], bases: string[], quote: string, starts: Record<string, string> = {}): { series: ComparisonSeries[]; missing: string[]; start?: string; end?: string } {
  const distinct = [...new Set(bases)]
  const raw = distinct.map(code => ({ code, points: pairSeries(rows, code, quote).filter(point => !starts[code] || point.date >= starts[code]) }))
  const available = raw.filter(item => item.points.length >= 2)
  const missing = raw.filter(item => item.points.length < 2).map(item => item.code)
  if (!available.length) return { series: [], missing }
  // Compare exactly the same observation dates. Never join different calendar
  // days, fill an unavailable rate, or compare differently dated baselines.
  const common = new Set(available[0].points.map(point => point.date))
  for (const item of available.slice(1)) {
    const dates = new Set(item.points.map(point => point.date))
    for (const date of common) if (!dates.has(date)) common.delete(date)
  }
  const ordered = [...common].sort()
  if (ordered.length < 2) return { series: [], missing: distinct }
  const series = available.map(item => {
    const filtered = item.points.filter(point => common.has(point.date)), baseline = filtered[0].value
    return { code: item.code, raw: filtered, points: filtered.map(point => ({ date: point.date, value: point.value / baseline * 100 })) }
  })
  return { series, missing, start: ordered[0], end: ordered.at(-1) }
}
export function convertedAmount(amount: string, rate: number | undefined): number | undefined {
  if (amount.trim() === '' || rate === undefined) return undefined
  const n = Number(amount)
  if (!Number.isFinite(n) || n < 0 || n > 1e12) return undefined
  const result = n * rate
  return Number.isFinite(result) ? result : undefined
}
