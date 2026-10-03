import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ArrowUpRight, Plus, X } from 'lucide-react'
import { countryName, currencyEpochStart, currencyName, fmtRate, type Country } from '../map-data'
import { normalizeComparison, nearestDateIndex, type PairPoint } from '../lib/atlas-models'
import type { Rate } from '../lib/fx'

export type ChartRange = 30 | 90 | 365 | 1826
export const rangeLabels: Record<ChartRange, string> = { 30: '1 个月', 90: '3 个月', 365: '1 年', 1826: '5 年' }
export function RangePicker({ value, onChange }: { value: ChartRange; onChange: (range: ChartRange) => void }) {
  return <div className="atlas-range-picker" role="group" aria-label="走势图范围">{([30, 90, 365, 1826] as ChartRange[]).map(range => <button type="button" key={range} aria-pressed={range === value} onClick={() => onChange(range)}>{rangeLabels[range]}</button>)}</div>
}
function keyboardIndex(event: KeyboardEvent<SVGSVGElement>, active: number, length: number): number | undefined {
  let value: number | undefined
  if (event.key === 'ArrowRight') value = Math.min(active + 1, length - 1)
  if (event.key === 'ArrowLeft') value = Math.max(active - 1, 0)
  if (event.key === 'Home') value = 0
  if (event.key === 'End') value = length - 1
  if (value !== undefined) event.preventDefault()
  return value
}
function pointerIndex(event: PointerEvent<SVGSVGElement>, dates: string[], left: number, right: number, width: number): number {
  const bounds = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width * width
  const fraction = Math.max(0, Math.min(1, (x - left) / (right - left)))
  const date = new Date(Date.parse(dates[0]) + fraction * (Date.parse(dates.at(-1)!) - Date.parse(dates[0]))).toISOString().slice(0, 10)
  return nearestDateIndex(dates, date)
}
export function AtlasSparkline({ points, base, quote }: { points: PairPoint[]; base: string; quote: string }) {
  const [active, setActive] = useState<number | null>(null)
  if (points.length < 2) return <p className="atlas-chart-empty">这一期间暂无足够的历史数据。</p>
  const dates = points.map(point => point.date), index = Math.min(active ?? points.length - 1, points.length - 1), point = points[index]
  const values = points.map(point => point.value), low = Math.min(...values), high = Math.max(...values), spread = high - low || Math.abs(high) * .01 || 1
  const start = Date.parse(dates[0]), end = Date.parse(dates.at(-1)!)
  const x = (date: string) => 6 + (Date.parse(date) - start) / (end - start) * 288
  const y = (value: number) => 91 - (value - low) / spread * 72
  const shape = points.map(p => x(p.date) + ',' + y(p.value)).join(' ')
  return <div className="atlas-sparkline chart-wrap">
    <div className="atlas-sparkline-reading"><time>{point.date}</time><strong>{fmtRate(point.value)} <small>{quote}</small></strong></div>
    <svg viewBox="0 0 300 105" role="slider" tabIndex={0} aria-label={`${base} 兑 ${quote} 走势图，左右方向键选择日期`} aria-valuemin={0} aria-valuemax={points.length - 1} aria-valuenow={index} aria-valuetext={point.date + '，1 ' + base + '兑换 ' + fmtRate(point.value) + ' ' + quote}
      onPointerDown={event => setActive(pointerIndex(event, dates, 6, 294, 300))} onPointerMove={event => setActive(pointerIndex(event, dates, 6, 294, 300))}
      onKeyDown={event => { const value = keyboardIndex(event, index, points.length); if (value !== undefined) setActive(value) }}>
      {[19, 55, 91].map(height => <line className="chart-grid" key={height} x1="6" x2="294" y1={height} y2={height} />)}
      <polyline className="chart-line" points={shape} fill="none" vectorEffect="non-scaling-stroke" />
      <line x1={x(point.date)} x2={x(point.date)} y1="10" y2="98" className="atlas-crosshair" />
      <circle cx={x(point.date)} cy={y(point.value)} r="3" className="chart-dot" />
    </svg>
    <div className="chart-dates"><time>{dates[0]}</time><time>{dates.at(-1)}</time></div>
  </div>
}

type CurrencyChoice = { code: string; country: Country }
export default function CurrencyComparison({ rows, choices, quote, date, range, onRange, onRemove, onAdd, canAdd, status, onRetry }: {
  rows: Rate[]; choices: CurrencyChoice[]; quote: string; date: string; range: ChartRange; onRange: (range: ChartRange) => void;
  onRemove: (code: string) => void; onAdd: () => void; canAdd: boolean; status: 'loading' | 'ready' | 'error' | 'replaying'; onRetry: () => void;
}) {
  const comparison = useMemo(() => normalizeComparison(rows, choices.map(choice => choice.code), quote, Object.fromEntries(choices.map(choice => [choice.code, currencyEpochStart(choice.country, date)]))), [rows, choices, quote, date])
  const [active, setActive] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null), [compact, setCompact] = useState(false)
  useEffect(() => {
    if (!plotRef.current) return
    const observer = new ResizeObserver(entries => setCompact(entries[0].contentRect.width < 600))
    observer.observe(plotRef.current); return () => observer.disconnect()
  }, [])
  const dates = comparison.series[0]?.points.map(point => point.date) || []
  const index = Math.max(0, Math.min(active ?? dates.length - 1, dates.length - 1))
  const allValues = comparison.series.flatMap(item => item.points.map(point => point.value))
  const low = Math.min(100, ...allValues), high = Math.max(100, ...allValues), gap = high - low || 4
  const min = Math.max(0, low - gap * .12), max = high + gap * .12
  const tickPrecision = Math.max(0, Math.min(4, Math.ceil(-Math.log10((max - min) / 4))))
  const width = compact ? 520 : 940, left = compact ? 45 : 62, right = width - (compact ? 14 : 28)
  const start = dates.length ? Date.parse(dates[0]) : 0, end = dates.length ? Date.parse(dates.at(-1)!) : 1
  const x = (date: string) => left + (Date.parse(date) - start) / (end - start || 1) * (right - left)
  const y = (value: number) => 286 - (value - min) / (max - min) * 248
  return <section className="atlas-comparison" aria-labelledby="atlas-comparison-title">
    <div className="atlas-comparison-heading"><div><h2 id="atlas-comparison-title">货币走势比较</h2><p>统一兑{currencyName(quote)}，共同起点为 100。</p></div><RangePicker value={range} onChange={onRange} /></div>
    <div className="atlas-comparison-layout"><div className="atlas-comparison-list">
      {choices.map((choice, i) => {
        const item = comparison.series.find(item => item.code === choice.code), value = item?.points[index]?.value
        const change = value === undefined ? undefined : value - 100
        return <div className={'comparison-currency currency-line-' + i} key={choice.code}>
          <div className="comparison-currency-name"><i aria-hidden="true" /><span>{currencyName(choice.code)}<small>{countryName(choice.country)} · {choice.code}</small></span><button type="button" className="icon-button" aria-label={'移除' + currencyName(choice.code) + '的比较'} onClick={() => onRemove(choice.code)}><X size={15} /></button></div>
          <div className="comparison-currency-reading"><strong>{status !== 'ready' || change === undefined ? '—' : (change > 0 ? '+' : '') + change.toFixed(2) + '%'}</strong>{item?.raw[index] && status === 'ready' && <span>1 {choice.code} = {fmtRate(item.raw[index].value)} {quote}</span>}</div>
        </div>
      })}
      <button type="button" className="comparison-add" disabled={!canAdd} onClick={onAdd}><Plus size={16} />加入当前国家的货币</button><p className="comparison-help">可比较四种货币。点选地图上的国家后加入。</p>
    </div><div className={'atlas-comparison-plot' + (compact ? ' is-compact' : '')} ref={plotRef} aria-busy={status === 'loading'}>
      {status === 'replaying' ? <div className="atlas-series-empty"><p>暂停回放后，比较这一日期前的货币走势。</p></div> : status === 'loading' ? <div className="atlas-series-loading skeleton" role="status">正在读取历史数据</div> : status === 'error' ? <div className="atlas-series-empty"><p>历史数据暂时无法连接。</p><button className="text-button" onClick={onRetry}>重新读取<ArrowUpRight size={14} /></button></div> : dates.length < 2 ? <div className="atlas-series-empty"><p>{choices.length ? '所选币种在这一期间没有足够的共同数据。' : '从地图选择国家，加入想比较的货币。'}</p></div> : <>
        <div className="comparison-observation"><time>{dates[index]}</time><span>共同起点 {comparison.start}</span></div>
        <svg viewBox={'0 0 ' + width + ' 330'} role="slider" tabIndex={0} aria-label="货币比较走势图，左右方向键选择日期" aria-valuemin={0} aria-valuemax={dates.length - 1} aria-valuenow={index} aria-valuetext={dates[index] + '，' + comparison.series.map(item => item.code + '指数' + item.points[index].value.toFixed(2)).join('，')}
          onPointerDown={event => setActive(pointerIndex(event, dates, left, right, width))} onPointerMove={event => setActive(pointerIndex(event, dates, left, right, width))}
          onKeyDown={event => { const value = keyboardIndex(event, index, dates.length); if (value !== undefined) setActive(value) }}>
          {Array.from({ length: 5 }, (_, i) => min + (max - min) * i / 4).map(value => <g key={value}><line x1={left} x2={right} y1={y(value)} y2={y(value)} className="chart-grid" /><text x={left - 10} y={y(value) + 4} textAnchor="end">{new Intl.NumberFormat('zh-CN', { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: value >= 1000 ? 1 : tickPrecision }).format(value)}</text></g>)}
          <line x1={left} x2={right} y1={y(100)} y2={y(100)} className="atlas-baseline" />
          {comparison.series.map((item, i) => <g key={item.code} className={'currency-line-' + choices.findIndex(choice => choice.code === item.code)}><polyline points={item.points.map(point => x(point.date) + ',' + y(point.value)).join(' ')} fill="none" vectorEffect="non-scaling-stroke" className="comparison-line" strokeDasharray={i === 3 ? '4 3' : undefined} /><circle cx={x(item.points[index].date)} cy={y(item.points[index].value)} r="4" className="comparison-dot" /></g>)}
          <line x1={x(dates[index])} x2={x(dates[index])} y1="26" y2="286" className="atlas-crosshair" />
          <text x={left} y="318">{dates[0]}</text><text x={right} y="318" textAnchor="end">{dates.at(-1)}</text>
        </svg>
        <p className="comparison-axis-note">数值上升表示相对{currencyName(quote)}升值。移到曲线上查看读数，方向键也可选择日期。</p>
      </>}
      {status === 'ready' && comparison.missing.length > 0 && <p className="comparison-missing">缺少共同历史数据：{comparison.missing.map(currencyName).join('、')}。</p>}
    </div></div>
  </section>
}
