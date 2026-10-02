import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

export type PlotPoint = { x: number; y: number }
export type PlotSeries = { name: string; points: PlotPoint[]; color?: number; dashed?: boolean }
export const plotColor = (index: number) => `var(--figure-${index % 6})`
const number = (value: number) => Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1)

export function FigurePlot({ title, series, xLabel, yLabel, xDomain, yDomain, xFormat = number, yFormat = number, marks = [], inspect = true, cursorX, onCursorChange }: {
  title: string; series: PlotSeries[]; xLabel: string; yLabel: string;
  xDomain?: [number, number]; yDomain?: [number, number];
  xFormat?: (n: number) => string; yFormat?: (n: number) => string;
  marks?: { x: number; y: number; label: string }[]; inspect?: boolean;
  cursorX?: number; onCursorChange?: (x: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(560)
  const [cursor, setCursor] = useState(Math.floor(series[0].points.length / 2))
  const id = useId()
  useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const all = series.flatMap(s => s.points)
  const xLo = xDomain?.[0] ?? Math.min(...all.map(p => p.x))
  const xHi = xDomain?.[1] ?? Math.max(...all.map(p => p.x))
  const min = Math.min(...all.map(p => p.y)), max = Math.max(...all.map(p => p.y))
  const pad = Math.max((max - min) * .1, .5)
  const yLo = yDomain?.[0] ?? min - pad, yHi = yDomain?.[1] ?? max + pad
  const height = 270, left = width < 370 ? 46 : 52, right = width - 15, top = 35, bottom = 216
  const px = (x: number) => left + (x - xLo) / (xHi - xLo || 1) * (right - left)
  const py = (y: number) => bottom - (y - yLo) / (yHi - yLo || 1) * (bottom - top)
  const nearest = (points: PlotPoint[], x: number) => points.reduce((a, b) => Math.abs(a.x - x) < Math.abs(b.x - x) ? a : b)
  const index = cursorX === undefined ? Math.min(cursor, series[0].points.length - 1) : series[0].points.indexOf(nearest(series[0].points, cursorX))
  const selected = series[0].points[index]
  const select = (next: number) => { setCursor(next); onCursorChange?.(series[0].points[next].x) }
  return <div className="figure-plot" ref={root}>
    <svg viewBox={`0 0 ${width} ${height}`} role={inspect ? 'group' : 'img'} aria-label={title + (inspect ? '；左右方向键查看读数' : '')} tabIndex={inspect ? 0 : undefined} aria-describedby={inspect ? id + '-readout' : undefined}
      onKeyDown={event => { if (!inspect || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); select(event.key === 'Home' ? 0 : event.key === 'End' ? series[0].points.length - 1 : Math.max(0, Math.min(series[0].points.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))) }}
      onPointerMove={event => { if (!inspect) return; const box = event.currentTarget.getBoundingClientRect(); const x = xLo + ((event.clientX - box.left) * width / box.width - left) / (right - left) * (xHi - xLo); select(series[0].points.indexOf(nearest(series[0].points, x))) }}
      onPointerDown={event => { if (inspect) { const box = event.currentTarget.getBoundingClientRect(); const x = xLo + ((event.clientX - box.left) * width / box.width - left) / (right - left) * (xHi - xLo); select(series[0].points.indexOf(nearest(series[0].points, x))) } }}>
      <title>{title}</title><defs><clipPath id={id + '-clip'}><rect x={left} y={top - 2} width={right - left} height={bottom - top + 4} /></clipPath></defs>
      <text className="figure-axis-title" x={left} y="16">{yLabel}</text>
      {[0, 1, 2, 3, 4].map(n => { const y = yLo + (yHi - yLo) * n / 4; return <g key={n}><line className="figure-grid" x1={left} y1={py(y)} x2={right} y2={py(y)} /><text x={left - 8} y={py(y) + 4} textAnchor="end">{yFormat(y)}</text></g> })}
      {[0, 1, 2, 3, 4].map(n => { const x = xLo + (xHi - xLo) * n / 4; return <text key={n} x={px(x)} y={bottom + 22} textAnchor={n === 4 ? 'end' : n === 0 ? 'start' : 'middle'}>{xFormat(x)}</text> })}
      <text className="figure-axis-title" x={(left + right) / 2} y="263" textAnchor="middle">{xLabel}</text>
      <g clipPath={`url(#${id}-clip)`}>{series.map((s, n) => <polyline key={s.name} fill="none" stroke={plotColor(s.color ?? n)} strokeWidth="2.1" strokeDasharray={s.dashed ? '6 5' : undefined} points={s.points.map(p => `${px(p.x)},${py(p.y)}`).join(' ')} />)}
        {inspect && <><line className="figure-crosshair" x1={px(selected.x)} x2={px(selected.x)} y1={top} y2={bottom} />{series.map((s, n) => { const point = n === 0 ? selected : nearest(s.points, selected.x); return <circle key={s.name} cx={px(point.x)} cy={py(point.y)} r="3.5" fill={plotColor(s.color ?? n)} /> })}</>}
      </g>
      {marks.map((mark, n) => <g key={mark.label}><circle cx={px(mark.x)} cy={py(mark.y)} r="4.5" className="figure-equilibrium" /><text className="figure-mark-label" x={Math.max(left + 15, Math.min(right - 15, px(mark.x)))} y={Math.max(top + 10, py(mark.y) + (n % 2 ? 19 : -12))} textAnchor="middle">{mark.label}</text></g>)}
    </svg>
    <div className="figure-legend">{series.map((s, n) => <span key={s.name}><i style={{ background: plotColor(s.color ?? n), opacity: s.dashed ? .65 : 1 }} />{s.name}</span>)}</div>
    {inspect && <><div className="figure-readout" id={id + '-readout'} aria-live="polite"><strong>{xFormat(selected.x)}</strong>{series.map((s, n) => <span key={s.name}>{s.name}<b>{yFormat((n === 0 ? selected : nearest(s.points, selected.x)).y)}</b></span>)}</div><div className="figure-pointer-hint">点按查看 · 方向键移动</div></>}
  </div>
}

export function FigureBars({ data, selected, onSelect, domain, format = n => n.toFixed(1) + '%', label }: {
  data: { name: string; value: number }[]; selected: string; onSelect: (name: string) => void;
  domain?: [number, number]; format?: (n: number) => string; label: string;
}) {
  const lo = domain?.[0] ?? Math.min(0, ...data.map(d => d.value)), hi = domain?.[1] ?? Math.max(...data.map(d => d.value)) * 1.08
  const position = (n: number) => (n - lo) / (hi - lo || 1) * 100
  return <div className="figure-bars" role="group" aria-label={label}>{data.map((d, n) => <button key={d.name} className={'figure-bar-row' + (selected === d.name ? ' selected' : '')} aria-pressed={selected === d.name} onClick={() => onSelect(d.name)}>
    <span>{d.name}</span><span className="figure-bar-track"><i className="figure-bar-zero" style={{ left: position(0) + '%' }} /><i className="figure-bar-fill" style={{ '--bar-color': plotColor(d.value < 0 ? 2 : n % 3), left: position(Math.min(0, d.value)) + '%', width: Math.abs(d.value) / (hi - lo || 1) * 100 + '%' } as CSSProperties} /></span><strong>{format(d.value)}</strong>
  </button>)}</div>
}

export function FigureData({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return <details className="figure-data"><summary>查看数据</summary><div className="figure-data-scroll" tabIndex={0}><table><thead><tr>{headers.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((value, j) => j === 0 ? <th scope="row" key={j}>{value}</th> : <td key={j}>{value}</td>)}</tr>)}</tbody></table></div></details>
}
