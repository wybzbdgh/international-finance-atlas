export type Rate = { date: string; base: string; quote: string; rate: number }
export type RateSnapshot = Record<string, number>

// A snapshot contains quote-currency units per one USD. Convert both legs.
export function crossRate(snapshot: RateSnapshot, base: string, quote: string): number | undefined {
  if (base === quote) return 1
  const a = snapshot[base], b = snapshot[quote]
  return Number.isFinite(a) && a > 0 && Number.isFinite(b) && b > 0 ? b / a : undefined
}

export function pairChange(current: RateSnapshot, previous: RateSnapshot, base: string, quote: string): number | undefined {
  const now = crossRate(current, base, quote), then = crossRate(previous, base, quote)
  return now !== undefined && then !== undefined ? (now / then - 1) * 100 : undefined
}

export function sortHistory(rows: Rate[], base: string, quote: string): Rate[] {
  // Keep the requested pair only; one observation per date, in calendar order.
  return Array.from(new Map(rows.filter(row => row.base === base && row.quote === quote).map(row => [row.date, row])).values())
    .sort((a, b) => a.date.localeCompare(b.date))
}
