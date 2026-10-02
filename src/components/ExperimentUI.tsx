import { RotateCcw } from 'lucide-react'

export const money = (n: number, digits = 0) => new Intl.NumberFormat('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
export const decimal = (n: number, digits = 2) => n.toFixed(digits)

export function Slider({ label, amount, unit, min, max, step = 1, onChange }: { label: string; amount: number; unit?: string; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  const digits = String(step).split('.')[1]?.length || 0
  return <label className="range-field"><span className="range-heading"><span>{label}</span><strong>{decimal(amount, digits)}<small>{unit}</small></strong></span><input aria-label={label} type="range" min={min} max={max} step={step} value={amount} onChange={event => onChange(Number(event.target.value))} /><span className="range-limits"><span>{min}</span><span>{max}</span></span></label>
}

export function Reset({ onClick }: { onClick: () => void }) {
  return <button className="text-button reset" onClick={onClick}><RotateCcw size={14} />恢复初始值</button>
}

export function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (value: T) => void; items: [T, string][]; label: string }) {
  return <div className="segmented calculator-tabs" aria-label={label}>{items.map(([id, text]) => <button key={id} className={value === id ? 'active' : ''} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>)}</div>
}

export function Result({ label, result, unit = '', negative = false }: { label: string; result: string; unit?: string; negative?: boolean }) {
  return <div className={'single-result' + (negative ? ' negative-result' : '')} aria-live="polite"><span>{label}</span><strong>{result}<small>{unit}</small></strong></div>
}

type Point = { x: number; y: number }
export function LinePlot({ points, reference, title, xLabel, yLabel, digits = 1 }: { points: Point[]; reference?: number; title: string; xLabel: string; yLabel: string; digits?: number }) {
  const xMin = points[0].x, xMax = points[points.length - 1].x
  const values = points.map(point => point.y).concat(reference === undefined ? [] : [reference])
  const minimum = Math.min(...values), maximum = Math.max(...values)
  const pad = Math.max((maximum - minimum) * 0.15, Math.abs(maximum) * 0.012, 0.05)
  const lo = minimum - pad, hi = maximum + pad
  const px = (x: number) => 47 + (x - xMin) / (xMax - xMin || 1) * 273
  const py = (y: number) => 174 - (y - lo) / (hi - lo) * 141
  return <figure className="model-chart"><figcaption>{title}</figcaption><svg viewBox="0 0 340 218" role="img" aria-label={title + '，起点 ' + decimal(points[0].y, digits) + '，终点 ' + decimal(points[points.length - 1].y, digits)}>
    <title>{title}</title><text x="47" y="15">{yLabel}</text>
    {[lo, (lo + hi) / 2, hi].map(y => <g key={y}><line x1="47" y1={py(y)} x2="320" y2={py(y)} className="plot-grid" /><text x="39" y={py(y) + 4} textAnchor="end">{decimal(y, digits)}</text></g>)}
    <line x1="47" y1="174" x2="320" y2="174" className="plot-axis" />
    {reference !== undefined && <line x1="47" y1={py(reference)} x2="320" y2={py(reference)} className="plot-reference" />}
    <polyline className="plot-line" points={points.map(p => px(p.x) + ',' + py(p.y)).join(' ')} />
    <circle className="plot-point" cx={px(points[0].x)} cy={py(points[0].y)} r="3" /><circle className="plot-point" cx={px(points[points.length - 1].x)} cy={py(points[points.length - 1].y)} r="3" />
    <text x="47" y="194" textAnchor="middle">{xMin}</text><text x="320" y="194" textAnchor="middle">{xMax}</text><text x="185" y="213" textAnchor="middle">{xLabel}</text>
  </svg>{reference !== undefined && <p className="plot-key">实线为调整路径，虚线为比较基准。</p>}</figure>
}
