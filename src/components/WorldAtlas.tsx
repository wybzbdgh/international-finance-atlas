import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Globe2, Maximize2, RotateCcw, Search, X } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { lessonHref, type LessonId } from '../content'
import { crossRate, pairChange, sortHistory, type Rate } from '../lib/fx'

type Country = { id: number; iso: string; name: string; nameEn: string; currency: string | null; continent: string; labelX: number; labelY: number }
type CountryFeature = { type: 'Feature'; id: number; properties: Omit<Country, 'id'>; geometry: GeoJSON.Geometry }
type CountryData = { type: 'FeatureCollection'; features: CountryFeature[] }
const API = 'https://api.frankfurter.dev/v2/rates'
const dateBefore = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: n < 0.01 ? 8 : n < 1 ? 6 : 4, minimumFractionDigits: n < 10 ? 2 : 0 }).format(n)
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const commonNames: Record<string, string> = { CHN: '中国', USA: '美国', GBR: '英国', DEU: '德国', RUS: '俄罗斯', KOR: '韩国', PRK: '朝鲜', VNM: '越南', IRN: '伊朗', LAO: '老挝' }
const quoteCurrencies = [
  { code: 'CNY', name: '人民币' }, { code: 'USD', name: '美元' }, { code: 'JPY', name: '日元' },
  { code: 'EUR', name: '欧元' }, { code: 'GBP', name: '英镑' }, { code: 'CHF', name: '瑞士法郎' }
]
const currencyName = (code: string) => quoteCurrencies.find(item => item.code === code)?.name || code
const relatedReadings: Record<string, { id: LessonId; title: string; section?: 'cases' }[]> = {
  CHN: [{ id: 'regimes', title: '人民币汇率改革与在岸、离岸市场' }, { id: 'renminbi', title: '人民币的境外使用与国际化' }],
  USA: [{ id: 'dollar', title: '美元体系与全球金融周期' }, { id: 'crisis', title: '2008 年全球金融危机' }],
  JPN: [{ id: 'long-run', title: '广场协议、日元升值与资产泡沫', section: 'cases' }, { id: 'policy', title: '汇率与宏观政策的传导' }],
  THA: [{ id: 'currency-crises', title: '1997 年亚洲金融危机', section: 'cases' }, { id: 'crisis', title: '外币债务与货币错配' }],
  DEU: [{ id: 'sovereign-debt', title: '欧债危机与主权银行反馈', section: 'cases' }, { id: 'regimes', title: '货币联盟与最优货币区' }],
  GBR: [{ id: 'foundations', title: '英镑与伦敦国际金融网络' }, { id: 'fx-market', title: '全球外汇市场的组织结构' }],
  RUS: [{ id: 'sanctions', title: '金融制裁与资产冻结', section: 'cases' }, { id: 'dollar', title: '美元网络与国际金融权力' }],
  ARG: [{ id: 'governance', title: '阿根廷 2018 年 IMF 贷款', section: 'cases' }, { id: 'currency-crises', title: '货币局与汇率危机' }],
  BRA: [{ id: 'sovereign-debt', title: '新兴市场的外债与再融资风险' }, { id: 'globalization', title: '资本流动结构与金融开放' }],
}
const defaultReadings: { id: LessonId; title: string; section?: 'cases' }[] = [{ id: 'fx-market', title: '汇率报价与外汇市场' }, { id: 'long-run', title: '购买力平价与实际汇率' }]
const palette = {
  dark: { ocean: '#151c24', land: '#374551', border: '#9dabb5', grid: '#b8c8d1', selected: '#81c6b5', outline: '#d5efe7', hover: '#638279', up: '#d39b93', down: '#81c6b5', flat: '#728490' },
  light: { ocean: '#e2e9ed', land: '#a5b6c0', border: '#506779', grid: '#648395', selected: '#468979', outline: '#205b4c', hover: '#93b4a8', up: '#b77b73', down: '#62a18f', flat: '#b5c2c9' }
}
const graticule: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    ...Array.from({ length: 5 }, (_, i) => ({
      type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: Array.from({ length: 73 }, (_, x) => [-180 + x * 5, -60 + i * 30]) }
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
      type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: Array.from({ length: 33 }, (_, x) => [-150 + i * 30, -80 + x * 5]) }
    }))
  ]
}

async function getRates(query: string, signal: AbortSignal): Promise<Rate[]> {
  const response = await fetch(API + query, { signal })
  if (!response.ok) throw new Error('汇率服务暂不可用')
  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(row => typeof row?.base === 'string' && typeof row?.quote === 'string' && typeof row?.date === 'string' && typeof row?.rate === 'number' && Number.isFinite(row.rate) && row.rate > 0)) throw new Error('无效的汇率数据')
  return data as Rate[]
}

function LineChart({ rows, base, quote }: { rows: Rate[]; base: string; quote: string }) {
  if (rows.length < 2) return <p className="chart-message">暂无足够的历史数据。</p>
  const values = rows.map(r => r.rate)
  const min = Math.min(...values), max = Math.max(...values), gap = max - min || 1
  const start = Date.parse(rows[0].date), end = Date.parse(rows.at(-1)!.date)
  const points = rows.map(r => (12 + (Date.parse(r.date) - start) / (end - start) * 376) + ',' + (96 - (r.rate - min) / gap * 78)).join(' ')
  return <div className="chart-wrap" role="img" aria-label={'过去90天，1 ' + base + '兑换的' + quote + '从' + fmt(values[0]) + '变为' + fmt(values.at(-1)!)}>
    <div className="chart-labels"><span>{fmt(max)}</span><span>{quote} / {base}</span></div>
    <svg viewBox="0 0 400 114" preserveAspectRatio="none" aria-hidden="true">
      {[18, 57, 96].map(y => <line key={y} x1="12" x2="388" y1={y} y2={y} className="chart-grid" />)}
      <polyline points={points} fill="none" className="chart-line" vectorEffect="non-scaling-stroke" />
      <circle cx="388" cy={96 - (values.at(-1)! - min) / gap * 78} r="3" className="chart-dot" />
    </svg>
    <div className="chart-dates"><span>{rows[0].date.slice(5)}</span><span>{rows.at(-1)!.date.slice(5)}</span></div>
  </div>
}

export default function WorldAtlas({ theme, visible }: { theme: 'dark' | 'light'; visible: boolean }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [selected, setSelected] = useState<Country | null>(null)
  const [quote, setQuote] = useState('USD')
  const [view, setView] = useState<'globe' | 'flat'>('globe')
  const [changeMode, setChangeMode] = useState(false)
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchIndex, setSearchIndex] = useState(-1)
  const [latest, setLatest] = useState<Rate[]>([])
  const [previous, setPrevious] = useState<Rate[]>([])
  const [history, setHistory] = useState<Rate[]>([])
  const [rateState, setRateState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [historyState, setHistoryState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [mapRetry, setMapRetry] = useState(0)
  const [historyRetry, setHistoryRetry] = useState(0)
  const globeZoom = () => {
    const dimension = Math.min(mapEl.current?.clientWidth || 350, mapEl.current?.clientHeight || 430)
    return Math.log2(Math.max(dimension * 0.82, 180) * Math.PI / 512)
  }
  const current = useMemo(() => ({ USD: 1, ...Object.fromEntries(latest.map(r => [r.quote, r.rate])) }) as Record<string, number>, [latest])
  const old = useMemo(() => ({ USD: 1, ...Object.fromEntries(previous.map(r => [r.quote, r.rate])) }) as Record<string, number>, [previous])
  const base = selected?.currency
  const selectedRate = base ? crossRate(current, base, quote) : undefined
  const delta = base ? pairChange(current, old, base, quote) : undefined
  const referenceDates = [base, quote].filter(code => code !== 'USD').map(code => latest.find(row => row.quote === code)?.date).filter(Boolean) as string[]
  const date = referenceDates.length ? Array.from(new Set(referenceDates)).sort().join(' / ') : latest[0]?.date
  const filtered = countries.filter(c => (c.name + ' ' + (commonNames[c.iso] || '') + ' ' + c.nameEn + ' ' + c.iso + ' ' + (c.currency || '')).toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)

  useEffect(() => {
    const controller = new AbortController()
    let ownedMap: MapLibreMap | undefined
    let observer: ResizeObserver | undefined
    setMapState('loading')
    fetch(import.meta.env.BASE_URL + 'data/countries.json', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('地图数据不可用'); return r.json() as Promise<CountryData> })
      .then(data => {
        if (controller.signal.aborted || !mapEl.current) return
        setCountries(data.features.map(feature => ({ ...feature.properties, id: feature.id })))
        const initial = data.features.find(f => f.properties.iso === 'CHN') || data.features[0]
        setSelected(s => s || { ...initial.properties, id: initial.id })
        const p = palette.dark
        const map = new maplibregl.Map({
          container: mapEl.current,
          style: { version: 8, sources: { countries: { type: 'geojson', data }, graticule: { type: 'geojson', data: graticule } }, layers: [
            { id: 'ocean', type: 'background', paint: { 'background-color': p.ocean } },
            { id: 'graticule', type: 'line', source: 'graticule', paint: { 'line-color': p.grid, 'line-opacity': 0.12, 'line-width': 0.7 } },
            { id: 'countries-fill', type: 'fill', source: 'countries', paint: { 'fill-color': p.land } },
            { id: 'countries-line', type: 'line', source: 'countries', paint: { 'line-color': p.border, 'line-opacity': 0.45, 'line-width': 0.65 } },
            { id: 'country-hover', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], ''], paint: { 'fill-color': p.hover, 'fill-opacity': 0.65 } },
            { id: 'country-selected', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'fill-color': p.selected, 'fill-opacity': 0.85 } },
            { id: 'selected-outline', type: 'line', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'line-color': p.outline, 'line-width': 1.7 } }
          ] },
          center: [104, 25], zoom: globeZoom(),
          attributionControl: false, canvasContextAttributes: { antialias: true }
        })
        ownedMap = map
        mapRef.current = map
        map.scrollZoom.disable()
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
        map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Natural Earth' }), 'bottom-left')
        map.once('load', () => { map.setProjection({ type: 'globe' }); setMapState('ready') })
        map.on('click', 'countries-fill', event => {
          const found = data.features.find(f => f.id === event.features?.[0]?.id)
          if (found) setSelected({ ...found.properties, id: found.id })
        })
        map.on('mousemove', 'countries-fill', event => {
          map.getCanvas().style.cursor = 'pointer'
          map.setFilter('country-hover', ['==', ['get', 'iso'], event.features?.[0]?.properties?.iso || ''])
        })
        map.on('mouseleave', 'countries-fill', () => {
          map.getCanvas().style.cursor = ''
          map.setFilter('country-hover', ['==', ['get', 'iso'], ''])
        })
        let width = mapEl.current.clientWidth, height = mapEl.current.clientHeight
        observer = new ResizeObserver(() => {
          if (!mapEl.current?.offsetWidth) return
          const nextWidth = mapEl.current.clientWidth, nextHeight = mapEl.current.clientHeight
          map.resize()
          if (nextWidth !== width || nextHeight !== height) {
            width = nextWidth; height = nextHeight
            const globe = map.getProjection()?.type === 'globe'
            map.jumpTo({ zoom: globe ? globeZoom() : window.innerWidth < 768 ? 0.35 : 0.8 })
          }
        })
        observer.observe(mapEl.current)
      })
      .catch(error => { if (error.name !== 'AbortError') setMapState('error') })
    return () => { controller.abort(); observer?.disconnect(); ownedMap?.remove(); mapRef.current = null }
  }, [mapRetry])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    let alive = true
    setRateState('loading')
    getRates('?base=USD', controller.signal)
      .then(rows => { if (alive) { setLatest(rows); setRateState('ready') } })
      .catch(() => { if (alive) setRateState('error') })
    getRates('?date=' + dateBefore(30) + '&base=USD', controller.signal)
      .then(rows => { if (alive) setPrevious(rows) })
      .catch(() => { if (alive) setPrevious([]) })
    return () => { alive = false; clearTimeout(timeout); controller.abort() }
  }, [retry])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    const apply = () => {
      map.setFilter('country-selected', ['==', ['get', 'iso'], selected.iso])
      map.setFilter('selected-outline', ['==', ['get', 'iso'], selected.iso])
      if (visible) map.easeTo({ center: [selected.labelX, selected.labelY], duration: reducedMotion() ? 0 : 900 })
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
    return () => { map.off('load', apply) }
  }, [selected, mapState, visible])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      map.setProjection({ type: view === 'globe' ? 'globe' : 'mercator' })
      map.easeTo({ zoom: view === 'globe' ? globeZoom() : window.innerWidth < 768 ? 0.35 : 0.8, duration: reducedMotion() ? 0 : 650 })
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
    return () => { map.off('load', apply) }
  }, [view, mapState])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      const p = palette[theme]
      map.setPaintProperty('ocean', 'background-color', p.ocean)
      map.setPaintProperty('graticule', 'line-color', p.grid)
      map.setPaintProperty('countries-line', 'line-color', p.border)
      map.setPaintProperty('country-selected', 'fill-color', p.selected)
      map.setPaintProperty('selected-outline', 'line-color', p.outline)
      map.setPaintProperty('country-hover', 'fill-color', p.hover)
      if (changeMode && previous.length) {
        for (const country of countries) {
          const change = country.currency ? pairChange(current, old, country.currency, quote) : undefined
          map.setFeatureState({ source: 'countries', id: country.id }, { change: change ?? null })
        }
        map.setPaintProperty('countries-fill', 'fill-color', ['case',
          ['==', ['feature-state', 'change'], null], p.land,
          ['>', ['feature-state', 'change'], 0.5], p.down,
          ['<', ['feature-state', 'change'], -0.5], p.up, p.flat
        ])
      } else map.setPaintProperty('countries-fill', 'fill-color', p.land)
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
    return () => { map.off('load', apply) }
  }, [theme, mapState, changeMode, countries, current, old, previous.length, quote])

  useEffect(() => {
    if (!base || selectedRate === undefined || base === quote) { setHistory([]); setHistoryState('ready'); return }
    const controller = new AbortController()
    let alive = true
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    setHistoryState('loading')
    setHistory([])
    getRates('?from=' + dateBefore(90) + '&to=' + new Date().toISOString().slice(0, 10) + '&base=' + base + '&quotes=' + quote, controller.signal)
      .then(rows => { if (alive) { setHistory(sortHistory(rows, base, quote)); setHistoryState('ready') } })
      .catch(() => { if (alive) setHistoryState('error') })
    return () => { alive = false; clearTimeout(timeout); controller.abort() }
  }, [base, quote, selectedRate, historyRetry])

  const choose = (country: Country) => { setSelected(country); setQuery(''); setSearchOpen(false); setSearchIndex(-1) }
  const resetMap = () => mapRef.current?.easeTo({ center: [104, 25], zoom: view === 'globe' ? globeZoom() : window.innerWidth < 768 ? 0.35 : 0.8, duration: reducedMotion() ? 0 : 800 })

  return <main id="atlas" tabIndex={-1} hidden={!visible} className="atlas-page shell">
    <div className="atlas-topline"><span>国际金融互动图谱</span><span className="data-date">{date ? '参考日 ' + date : '每日参考汇率'}</span></div>
    <div className="atlas-hero">
      <section className="atlas-intro">
        <h1>世界货币<br /><span>汇率地图</span></h1>
        <p>先选国家，再选币种，查看本币能兑换多少人民币、美元或日元。</p>
        <a href="#learn" className="primary-button">课程读本<ArrowRight size={18} /></a>
      </section>
      <div className="map-stage">
        <div className="map-toolbar">
          <div className="segmented compact"><button className={!changeMode ? 'active' : ''} aria-pressed={!changeMode} onClick={() => setChangeMode(false)}>国家</button><button className={changeMode ? 'active' : ''} aria-pressed={changeMode} onClick={() => setChangeMode(true)}>30 日变化</button></div>
          <button className="icon-button" aria-label={view === 'globe' ? '切换为平面地图' : '切换为地球'} title={view === 'globe' ? '切换为平面地图' : '切换为地球'} onClick={() => setView(view === 'globe' ? 'flat' : 'globe')}>{view === 'globe' ? <Maximize2 size={17} /> : <Globe2 size={17} />}</button>
          <button className="icon-button" aria-label="重置地图视角" title="重置地图视角" onClick={resetMap}><RotateCcw size={16} /></button>
        </div>
        <div className="map-viewport" ref={mapEl} role="region" aria-label="交互世界地图，可拖动旋转。也可以使用旁边的国家搜索。" />
        {mapState === 'loading' && <div className="map-loading" role="status"><div className="skeleton globe-skeleton" /><span>正在加载地图</span></div>}
        {mapState === 'error' && <div className="map-error" role="status"><Globe2 size={34} /><p>地图暂时无法显示。</p><button className="secondary-button" onClick={() => setMapRetry(n => n + 1)}>重新加载地图</button><small>{countries.length ? '仍可使用国家搜索查看汇率。' : '重新连接后可继续选择国家。'}</small></div>}
        {changeMode && <div className="map-legend"><small>相对{currencyName(quote)} · 近 30 日</small><span><i className="appreciation" />本币升值</span><span><i className="stable" />小幅变化</span><span><i className="depreciation" />本币贬值</span><span><i className="no-rate" />无报价</span>{!previous.length && <small>暂未取得对比日数据</small>}</div>}
        <div className="map-instruction">拖动旋转 · 使用 ＋ / − 缩放</div>
      </div>
      <aside className="country-panel">
        <div className="map-search">
          <Search size={17} />
          <input role="combobox" aria-label="搜索国家或货币" aria-expanded={searchOpen && !!query} aria-controls="country-results" aria-autocomplete="list" aria-activedescendant={searchIndex >= 0 ? 'country-result-' + searchIndex : undefined} placeholder="搜索国家或货币" value={query}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onChange={e => { setQuery(e.target.value); setSearchOpen(true); setSearchIndex(-1) }}
            onKeyDown={e => {
              if (e.key === 'Escape') setSearchOpen(false)
              if (e.key === 'ArrowDown') { e.preventDefault(); setSearchOpen(true); setSearchIndex(i => Math.min(i + 1, filtered.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSearchIndex(i => Math.max(i - 1, 0)) }
              if (e.key === 'Enter' && query && filtered.length) { e.preventDefault(); choose(filtered[Math.max(searchIndex, 0)]) }
            }} />
          {query && <button aria-label="清除搜索" onClick={() => { setQuery(''); setSearchOpen(false) }}><X size={15} /></button>}
          {searchOpen && query && <div className="search-results" id="country-results" role="listbox">{filtered.length ? filtered.map((country, i) => <button id={'country-result-' + i} role="option" aria-selected={i === searchIndex} className={i === searchIndex ? 'highlighted' : ''} onMouseDown={e => e.preventDefault()} key={country.id} onClick={() => choose(country)}><span>{commonNames[country.iso] || country.name}</span><small>{country.currency || '未匹配币种'}</small></button>) : <p>未找到对应国家或货币。</p>}</div>}
        </div>
        <div className="country-name" aria-live="polite"><div><span>{selected?.nameEn || 'Select a country'}</span><h2 title={selected?.name} className={(selected?.name.length || 0) > 8 && !commonNames[selected?.iso || ''] ? 'long-country-name' : ''}>{selected ? commonNames[selected.iso] || selected.name : '选择一个国家'}</h2></div><span className="currency-code">{selected?.currency || '暂无币种'}</span></div>
        {rateState === 'loading' ? <div className="rate-loading" role="status"><span className="skeleton skeleton-number" /><span className="skeleton skeleton-text" /><p>正在取得参考汇率</p></div> : rateState === 'error' ? <div className="rate-empty"><p>汇率服务暂时无法连接。</p><button className="text-button" onClick={() => setRetry(n => n + 1)}>重新获取<RotateCcw size={14} /></button></div> : selectedRate !== undefined ? <>
          <div className="rate-primary" aria-live="polite"><span>1 {currencyName(base!)} 可兑换</span><strong>{fmt(selectedRate)}</strong><small>{quote}</small></div>
          <div className="rate-secondary"><span>反向报价 · 1 {quote}</span><strong>{fmt(1 / selectedRate)} {base}</strong></div>
          <div className="rate-change"><span>兑{currencyName(quote)} · 近 30 日</span><strong className={delta === undefined || Math.abs(delta) < 0.005 ? '' : delta > 0 ? 'appreciation-text' : 'depreciation-text'}>{delta === undefined ? '暂无对比' : (delta > 0 ? '+' : '') + delta.toFixed(2) + '%'}{delta !== undefined && Math.abs(delta) >= 0.005 && (delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}</strong></div>
          <div className="chart-heading"><span>过去 90 天</span><span>{quote} / {base}</span></div>
          {base === quote ? <p className="chart-message">两边是同一种货币，兑换比例恒为 1。选择另一币种查看走势。</p> : historyState === 'loading' ? <div className="chart-message skeleton" aria-label="正在加载历史走势" /> : historyState === 'error' ? <div className="chart-message">历史数据暂不可用。<button className="text-button" onClick={() => setHistoryRetry(n => n + 1)}>重试</button></div> : <LineChart rows={history} base={base!} quote={quote} />}
        </> : <div className="rate-empty"><p>{selected?.currency ? 'Frankfurter 暂未提供该币种报价。' : '此地区未匹配到唯一流通货币。'}</p><small>请选择其他国家查看报价。</small></div>}
        <fieldset className="quote-currencies"><legend>兑换成</legend><div className="currency-options">{quoteCurrencies.map(currency => <button key={currency.code} aria-pressed={quote === currency.code} className={quote === currency.code ? 'selected' : ''} onClick={() => setQuote(currency.code)}><span>{currency.name}</span><small>{currency.code}</small></button>)}</div></fieldset>
        <div className="country-reading"><span>相关课程内容</span>{(relatedReadings[selected?.iso || ''] || defaultReadings).map(item => <a key={item.id} href={lessonHref(item.id, item.section)}>{item.title}<ArrowUpRight size={13} /></a>)}</div>
      </aside>
    </div>
    <div className="atlas-caption"><p>Frankfurter 每日参考价，非盘中实时价。报价单位为“目标货币／本币”；数值上升表示本币相对所选币种升值。30 日图层随目标币种切换，±0.5% 以内视为小幅变化，未取得报价的地区不比较涨跌；所选国家单独高亮。不同币种的参考日期可能不同。</p><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">数据说明<ArrowUpRight size={14} /></a></div>
    <section className="map-to-order">
      <div><h2>出口业务中的汇率风险</h2><p>一笔 10 万美元的出口货款，三个月后到账。人民币收入取决于收款日汇率和企业的套期安排。</p></div>
      <a className="order-bridge" href="#learn/accounts"><span className="bridge-amount">$100,000<small>出口应收款</small></span><span className="bridge-arrow"><ArrowRight size={26} /></span><span className="bridge-question">国际收支<br />与汇率敞口</span></a>
    </section>
  </main>
}
