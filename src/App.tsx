import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type Map as MapLibreMap, type MapGeoJSONFeature } from 'maplibre-gl'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, ExternalLink, Globe2, Layers3, Menu, RotateCcw, Search, X } from 'lucide-react'

type Rate = { date: string; base: string; quote: string; rate: number }
type Country = { id: number; iso: string; name: string; nameEn: string; currency: string | null; continent: string; labelX: number; labelY: number }
type Feature = { type: 'Feature'; id: number; properties: Country; geometry: GeoJSON.Geometry }
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }
type ViewMode = 'globe' | 'flat'
type MapMode = 'atlas' | 'change'

const API = 'https://api.frankfurter.dev/v2/rates'
const DAY = 86_400_000
const dateBefore = (n: number) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10)
const fmt = (n: number, max = 4) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: max, minimumFractionDigits: n < 10 ? 2 : 0 }).format(n)
const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
const rateMap = (rows: Rate[]) => Object.fromEntries(rows.map(r => [r.quote, r.rate])) as Record<string, number>

const quickCountries = [
  { iso: 'CHN', label: '中国' }, { iso: 'USA', label: '美国' }, { iso: 'JPN', label: '日本' },
  { iso: 'GBR', label: '英国' }, { iso: 'DEU', label: '德国' }, { iso: 'BRA', label: '巴西' },
]

const chapters = [
  { no: '01', eyebrow: '国际收支', title: '钱从哪里来，流向哪里？', body: '从经常账户、资本与金融账户读懂一国对外交易；把国际投资头寸视为累积的存量。', tags: ['国际收支平衡表', '国际投资头寸', '全球失衡'], target: 'reading' },
  { no: '02', eyebrow: '外汇与定价', title: '为什么货币会升值或贬值？', body: '从即期与远期汇率出发，比较购买力平价、利率平价与预期的解释力。', tags: ['PPP', 'UIP / CIP', '汇率超调'], target: 'atlas' },
  { no: '03', eyebrow: '开放经济政策', title: '三件好事，为什么只能选两件？', body: '用“不可能三角”实验理解汇率稳定、资本自由流动与货币政策自主权的取舍。', tags: ['蒙代尔—弗莱明', '不可能三角', '政策传导'], target: 'lab' },
  { no: '04', eyebrow: '危机与调整', title: '资本突然撤走，会发生什么？', body: '沿着时间线观察外汇储备、资本流动和金融脆弱性如何相互放大。', tags: ['货币危机', '债务危机', '亚洲金融危机'], target: 'cases' },
  { no: '05', eyebrow: '企业跨境金融', title: '汇率波动如何进入一张订单？', body: '从出口收款和进口付款出发，试算汇率风险与远期锁汇的结果。', tags: ['交易风险', '套期保值', '远期合约'], target: 'lab' },
  { no: '06', eyebrow: '国际货币体系', title: '谁决定全球交易用什么钱？', body: '追踪储备货币、跨境支付和人民币国际化，讨论货币网络效应与制度安排。', tags: ['美元体系', '国际储备', '人民币'], target: 'reading' },
]

const readings = [
  { type: '经典论文', year: '1963', title: '资本流动与稳定政策', author: 'Robert A. Mundell', note: '固定与浮动汇率下的政策效果，是开放经济宏观的起点。', href: 'https://doi.org/10.2307/139336', label: '阅读原文' },
  { type: '经典论文', year: '1976', title: '预期与汇率动态', author: 'Rüdiger Dornbusch', note: '汇率为何可能先“超调”，再缓慢回归？', href: 'https://doi.org/10.1086/260506', label: '阅读原文' },
  { type: '经典论文', year: '1979', title: '国际收支危机模型', author: 'Paul Krugman', note: '第一代货币危机模型：政策失衡与储备耗尽。', href: 'https://stonecenter.gc.cuny.edu/publications/a-model-of-balance-of-payment-crises/', label: '阅读原文' },
  { type: '数据入口', year: '持续更新', title: '国际收支与国际投资头寸', author: 'IMF Data', note: '把课堂概念和各国官方统计序列对应起来。', href: 'https://data.imf.org/', label: '打开数据' },
]

const cases = [
  { id: 'asia', year: '1997', title: '亚洲金融危机', place: '东亚与东南亚', clue: '固定或准固定汇率、短期外债、资本流动逆转形成连锁压力。', question: '如果企业持有大量外币债务，本币贬值会怎样改变资产负债表？', source: 'https://www.imf.org/external/pubs/ft/fandd/1998/06/imfstaff.htm' },
  { id: 'global', year: '2008', title: '全球金融危机', place: '全球', clue: '美元融资市场紧张，跨境资金和贸易同时收缩，央行流动性互换成为关键工具。', question: '为什么一家非美国银行也可能依赖美元融资？', source: 'https://www.federalreserve.gov/monetarypolicy/bst_liquidityswaps.htm' },
  { id: 'china', year: '2015', title: '人民币汇率形成机制调整', place: '中国', clue: '中间价形成机制变化后，市场预期与跨境资本流动受到更密切关注。', question: '汇率政策变化如何影响市场对未来价格的预期？', source: 'https://www.pbc.gov.cn/en/3688110/3688172/3712221/index.html' },
]

const graticule = (() => {
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = []
  for (let lat = -60; lat <= 60; lat += 30) features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]) } })
  for (let lon = -150; lon <= 180; lon += 30) features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: Array.from({ length: 33 }, (_, i) => [lon, -80 + i * 5]) } })
  return { type: 'FeatureCollection', features } as GeoJSON.FeatureCollection
})()

function LineChart({ rows, currency }: { rows: Rate[]; currency: string }) {
  if (rows.length < 2) return <div className="chart-empty">暂无足够的历史数据绘制走势</div>
  const values = rows.map(r => r.rate)
  const min = Math.min(...values), max = Math.max(...values), gap = max - min || 1
  const points = values.map((v, i) => `${16 + i / (values.length - 1) * 488},${128 - (v - min) / gap * 104}`).join(' ')
  return <div className="chart-wrap" role="img" aria-label={`过去90天美元兑${currency}参考汇率走势，从${fmt(values[0])}到${fmt(values.at(-1)!)}`}>
    <div className="chart-labels"><span>{fmt(max)}</span><span>USD / {currency}</span></div>
    <svg viewBox="0 0 520 150" preserveAspectRatio="none" aria-hidden="true">
      <line x1="16" x2="504" y1="128" y2="128" className="chart-grid" />
      <line x1="16" x2="504" y1="76" y2="76" className="chart-grid" />
      <line x1="16" x2="504" y1="24" y2="24" className="chart-grid" />
      <polyline points={points} fill="none" className="chart-line" vectorEffect="non-scaling-stroke" />
      <circle cx="504" cy={128 - (values.at(-1)! - min) / gap * 104} r="4" className="chart-dot" />
    </svg>
    <div className="chart-dates"><span>{rows[0].date}</span><span>{rows.at(-1)!.date}</span></div>
  </div>
}

function App() {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [selected, setSelected] = useState<Country | null>(null)
  const [view, setView] = useState<ViewMode>('globe')
  const [mode, setMode] = useState<MapMode>('atlas')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [latest, setLatest] = useState<Rate[]>([])
  const [previous, setPrevious] = useState<Rate[]>([])
  const [history, setHistory] = useState<Rate[]>([])
  const [rateState, setRateState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [historyState, setHistoryState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [caseId, setCaseId] = useState('asia')
  const [policy, setPolicy] = useState<string[]>(['汇率稳定', '资本自由流动'])
  const [invoice, setInvoice] = useState(100000)
  const [futureRate, setFutureRate] = useState(6.85)
  const [forwardRate, setForwardRate] = useState(6.75)

  const current = useMemo<Record<string, number>>(() => ({ USD: 1, ...rateMap(latest) }), [latest])
  const old = useMemo<Record<string, number>>(() => ({ USD: 1, ...rateMap(previous) }), [previous])
  const date = latest[0]?.date
  const selectedRate = selected?.currency ? current[selected.currency] : undefined
  const cnyRate = current.CNY
  const delta = selected?.currency && selectedRate && old[selected.currency]
    ? (selectedRate / old[selected.currency] - 1) * 100 : undefined
  const filtered = countries.filter(c => `${c.name} ${c.nameEn} ${c.iso} ${c.currency || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
  const currentCase = cases.find(c => c.id === caseId)!
  const blocked = ['汇率稳定', '资本自由流动', '货币政策自主'].find(x => !policy.includes(x))!

  useEffect(() => {
    const controller = new AbortController()
    const url = `${import.meta.env.BASE_URL}data/countries.json`
    fetch(url, { signal: controller.signal }).then(r => { if (!r.ok) throw Error('country data'); return r.json() }).then((data: FeatureCollection) => {
      setCountries(data.features.map(f => f.properties))
      setSelected(data.features.find(f => f.properties.iso === 'CHN')?.properties || data.features[0].properties)
      if (!mapEl.current) return
      const map = new maplibregl.Map({
        container: mapEl.current,
        style: { version: 8, sources: {
          countries: { type: 'geojson', data },
          graticule: { type: 'geojson', data: graticule },
        }, layers: [
          { id: 'ocean', type: 'background', paint: { 'background-color': '#102b2b' } },
          { id: 'graticule', type: 'line', source: 'graticule', paint: { 'line-color': '#829d91', 'line-opacity': 0.16, 'line-width': 1 } },
          { id: 'countries-fill', type: 'fill', source: 'countries', paint: { 'fill-color': '#35544d', 'fill-opacity': 0.96 } },
          { id: 'countries-line', type: 'line', source: 'countries', paint: { 'line-color': '#a9b9a1', 'line-opacity': 0.45, 'line-width': 0.7 } },
          { id: 'country-hover', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], ''], paint: { 'fill-color': '#a4c6ac', 'fill-opacity': 0.75 } },
          { id: 'country-selected', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'fill-color': '#e8bf77', 'fill-opacity': 0.92 } },
          { id: 'selected-outline', type: 'line', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'line-color': '#fff2cc', 'line-width': 2.2 } },
        ] },
        center: [30, 22], zoom: window.innerWidth < 600 ? 0.8 : 1.34,
        attributionControl: false,
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Natural Earth · Frankfurter' }), 'bottom-right')
      map.once('load', () => map.setProjection({ type: 'globe' }))
      map.on('click', 'countries-fill', e => {
        const feature = e.features?.[0] as MapGeoJSONFeature | undefined
        const country = data.features.find(f => f.id === feature?.id)?.properties
        if (country) setSelected(country)
      })
      map.on('mousemove', 'countries-fill', e => {
        map.getCanvas().style.cursor = 'pointer'
        const iso = e.features?.[0]?.properties?.iso
        map.setFilter('country-hover', ['==', ['get', 'iso'], iso || ''])
      })
      map.on('mouseleave', 'countries-fill', () => {
        map.getCanvas().style.cursor = ''
        map.setFilter('country-hover', ['==', ['get', 'iso'], ''])
      })
      mapRef.current = map
    }).catch(err => { if (err.name !== 'AbortError') console.error(err) })
    return () => { controller.abort(); mapRef.current?.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(`${API}?base=USD`).then(r => { if (!r.ok) throw Error('latest rates'); return r.json() as Promise<Rate[]> }),
      fetch(`${API}?date=${dateBefore(30)}&base=USD`).then(r => { if (!r.ok) throw Error('past rates'); return r.json() as Promise<Rate[]> }),
    ]).then(([a, b]) => { setLatest(a); setPrevious(b); setRateState('ready') }).catch(() => setRateState('error'))
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    const iso = selected.iso
    const apply = () => {
      if (!map.getLayer('country-selected')) return
      map.setFilter('country-selected', ['==', ['get', 'iso'], iso])
      map.setFilter('selected-outline', ['==', ['get', 'iso'], iso])
      if (Number.isFinite(selected.labelX) && Number.isFinite(selected.labelY)) map.easeTo({ center: [selected.labelX, selected.labelY], duration: 800, essential: true })
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
  }, [selected])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      map.setProjection({ type: view === 'globe' ? 'globe' : 'mercator' })
      map.easeTo({ zoom: view === 'globe' ? (window.innerWidth < 600 ? 0.8 : 1.34) : (window.innerWidth < 600 ? 0.75 : 1.15), duration: 650, essential: true })
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
    return () => { map.off('load', apply) }
  }, [view])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      if (!map.getLayer('countries-fill')) return
      if (mode === 'atlas' || rateState !== 'ready') {
        map.setPaintProperty('countries-fill', 'fill-color', '#35544d')
      } else {
        for (const c of countries) {
          const a = c.currency ? current[c.currency] : undefined
          const b = c.currency ? old[c.currency] : undefined
          map.setFeatureState({ source: 'countries', id: c.id }, { change: a && b ? (a / b - 1) * 100 : null })
        }
        map.setPaintProperty('countries-fill', 'fill-color', [
          'case', ['==', ['feature-state', 'change'], null], '#35544d',
          ['>', ['feature-state', 'change'], 2], '#ca785c',
          ['>', ['feature-state', 'change'], 0.5], '#bc9c68',
          ['<', ['feature-state', 'change'], -2], '#5ba995',
          ['<', ['feature-state', 'change'], -0.5], '#86b8a4',
          '#839a85',
        ])
      }
    }
    if (map.isStyleLoaded()) apply(); else map.once('load', apply)
  }, [mode, rateState, countries, current, old])

  useEffect(() => {
    if (!selected?.currency || !current[selected.currency]) { setHistory([]); setHistoryState('error'); return }
    if (selected.currency === 'USD') { setHistory([]); setHistoryState('ready'); return }
    const controller = new AbortController()
    setHistoryState('loading')
    fetch(`${API}?from=${dateBefore(90)}&to=${new Date().toISOString().slice(0, 10)}&base=USD&quotes=${selected.currency}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw Error('history'); return r.json() as Promise<Rate[]> })
      .then(rows => { setHistory(rows); setHistoryState('ready') })
      .catch(err => { if (err.name !== 'AbortError') setHistoryState('error') })
    return () => controller.abort()
  }, [selected?.currency, current])

  const chooseCountry = (c: Country) => { setSelected(c); setQuery(''); setSearchOpen(false); document.getElementById('atlas')?.scrollIntoView({ behavior: 'smooth' }) }
  const chooseQuick = (iso: string) => { const c = countries.find(x => x.iso === iso); if (c) chooseCountry(c) }
  const togglePolicy = (x: string) => setPolicy(p => p.includes(x) ? p.filter(v => v !== x) : p.length < 2 ? [...p, x] : [p[1], x])
  const countryName = selected?.name || '选择一个国家'

  return <>
    <header className="site-header">
      <a href="#top" className="brand"><span className="brand-mark">汇</span><span>汇流 <small>FINANCE ATLAS</small></span></a>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="主导航">
        <a href="#atlas" onClick={() => setMenuOpen(false)}>交互地图</a><a href="#chapters" onClick={() => setMenuOpen(false)}>知识图谱</a><a href="#lab" onClick={() => setMenuOpen(false)}>金融实验室</a><a href="#reading" onClick={() => setMenuOpen(false)}>经典阅读</a>
      </nav>
      <div className="header-right"><span className="semester">2026 / FALL · 国际金融</span><button className="menu-btn" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <main id="top">
      <section className="hero shell">
        <div className="hero-kicker"><span className="eyebrow-line" /> 一张地图 · 六个问题 · 无数条资金的路径</div>
        <div className="hero-grid"><div><h1>世界在流动，<br/><em>汇率是它的语言。</em></h1><p>从一个国家的货币，走进国际金融的整张网络。探索每日参考汇率、比较市场变化，再用经典理论解释你看到的现象。</p><a href="#atlas" className="primary-btn">开始探索 <ArrowUpRight size={18}/></a></div><div className="hero-art" aria-hidden="true"><div className="orb orb-outer"/><div className="orb orb-middle"/><div className="orb orb-inner"/><div className="orb-axis"/><div className="orb-label top">EXCHANGE</div><div className="orb-label bottom">FLOWS / 2026</div><span className="orbit-dot one"/><span className="orbit-dot two"/><span className="orbit-dot three"/></div></div>
        <div className="hero-bottom"><span>01 — 互动地图</span><span>向下滚动以探索 <ChevronDown size={14}/></span><span>每日参考汇率 · 数据源 Frankfurter</span></div>
      </section>

      <section className="atlas-section" id="atlas">
        <div className="shell section-head"><div><span className="section-number">01 / EXPLORE</span><h2>把世界放在手边</h2><p>点选国家，观察货币与美元、人民币之间的关系。</p></div><span className="section-corner">A WORLD OF EXCHANGE</span></div>
        <div className="atlas-shell shell">
          <div className="map-card">
            <div className="map-toolbar"><div className="map-toolbar-left"><span className="live-dot"/>全球货币观察台 <span className="map-date">{date ? `参考日 ${date}` : '正在获取数据'}</span></div><div className="map-actions"><button className={mode === 'atlas' ? 'tool-active' : ''} onClick={() => setMode('atlas')}>地图</button><button className={mode === 'change' ? 'tool-active' : ''} onClick={() => setMode('change')}>30日变化</button><span className="toolbar-divider"/><button aria-label="切换地球和平面地图" title="切换地球和平面地图" onClick={() => setView(view === 'globe' ? 'flat' : 'globe')}><Globe2 size={16}/><span>{view === 'globe' ? '地球' : '平面'}</span></button></div></div>
            <div className="map-search"><Search size={16}/><input aria-label="搜索国家或货币" placeholder="搜索国家 / 货币…" value={query} onFocus={() => setSearchOpen(true)} onChange={e => { setQuery(e.target.value); setSearchOpen(true) }} />{query && <button aria-label="清除搜索" onClick={() => setQuery('')}><X size={15}/></button>}{searchOpen && query && <div className="search-results">{filtered.length ? filtered.map(c => <button key={c.id} onClick={() => chooseCountry(c)}><span>{c.name}</span><small>{c.currency || '暂无币种'} · {c.iso}</small></button>) : <div className="search-empty">没有找到对应国家</div>}</div>}</div>
            <div className="map-viewport" ref={mapEl} role="application" aria-label="可点击的世界地图，选择国家查看汇率"/>
            <div className="map-side-label" aria-hidden="true">FINANCE<br/>ATLAS</div>
            <div className="map-bottom"><div className="quick-list">{quickCountries.map(c => <button key={c.iso} onClick={() => chooseQuick(c.iso)} className={selected?.iso === c.iso ? 'quick-active' : ''}>{c.label}</button>)}</div><span>拖动旋转 · 滚轮缩放 · 点击国家</span></div>
            {mode === 'change' && <div className="map-legend"><div><i className="leg-neg"/> 本币升值</div><div><i className="leg-flat"/> 变化较小</div><div><i className="leg-pos"/> 本币贬值</div><small>比较每美元可兑换的当地货币数量；灰色代表无数据。</small></div>}
          </div>
          <aside className="country-panel">
            <div className="panel-top"><span>COUNTRY BRIEF / 国家速览</span><Layers3 size={18}/></div>
            <div className="country-name"><small>{selected?.continent || 'WORLD'}</small><h3>{countryName}</h3><span>{selected?.nameEn || 'Choose a country'}</span></div>
            <div className="currency-tag">{selected?.currency || '—'} <span>本地流通货币</span></div>
            {rateState === 'loading' ? <div className="rate-placeholder">正在获取每日参考汇率…</div> : rateState === 'error' ? <div className="rate-placeholder">汇率暂时无法连接，请稍后刷新。</div> : selectedRate ? <>
              <div className="rate-display"><span>1 USD ≈</span><strong>{fmt(selectedRate, selectedRate < 1 ? 5 : 4)}</strong><span>{selected?.currency}</span></div>
              <div className="rate-sub"><span>1 {selected?.currency} ≈ {selectedRate && cnyRate ? fmt(cnyRate / selectedRate, 4) : '—'} CNY</span><span className={delta === undefined ? '' : delta > 0 ? 'rate-up' : 'rate-down'}>{delta === undefined ? '—' : signed(delta)} / 30日 {delta !== undefined && (delta > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>)}</span></div>
              <div className="panel-rule"/><div className="chart-title"><div><span>过去 90 天</span><small>美元兑{selected?.currency} · 每日参考价</small></div><span className="mono">90D</span></div>
              {selected?.currency === 'USD' ? <div className="chart-empty">美元是当前计价基准。选择其他国家观察汇率走势。</div> : historyState === 'loading' ? <div className="chart-empty">正在加载历史走势…</div> : historyState === 'error' ? <div className="chart-empty">历史数据暂不可用</div> : <LineChart rows={history} currency={selected?.currency || ''}/>}
            </> : <div className="rate-placeholder">{selected?.currency ? '该币种暂无 Frankfurter 报价。' : '此地区未匹配到唯一流通货币。'}<br/>地图仍可浏览；请尝试其他国家。</div>}
            <div className="panel-foot"><span className="live-dot"/> {date ? `数据日期 ${date}` : '等待数据'}<br/><small>Frankfurter 每日参考汇率，非银行成交价或盘中实时价。市场休市时可能沿用最近一个数据日。</small></div>
          </aside>
        </div>
        <div className="shell data-caption"><span>读图提示</span><p>“30日变化”统一比较 1 美元可兑换的本币数量：数值上升，表示本币相对美元贬值。不同货币的原始汇率不能直接比较高低。</p><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">了解数据来源 <ExternalLink size={14}/></a></div>
      </section>

      <section className="chapters-section shell" id="chapters"><div className="section-head"><div><span className="section-number">02 / THE SYLLABUS</span><h2>从地图，走向整门课</h2><p>六条线索，把国际金融中的价格、政策、危机与制度连起来。</p></div><span className="section-corner">06 PATHS TO UNDERSTANDING</span></div><div className="chapter-grid">{chapters.map(c => <a href={`#${c.target}`} className="chapter-card" key={c.no}><div className="chapter-top"><span>{c.no} / 06</span><ArrowUpRight size={18}/></div><div className="chapter-icon">{c.no === '02' ? '¥' : c.no === '03' ? '△' : c.no === '04' ? '↘' : c.no === '05' ? '⇄' : c.no === '06' ? '◎' : '∑'}</div><small>{c.eyebrow}</small><h3>{c.title}</h3><p>{c.body}</p><div className="chapter-tags">{c.tags.map(t => <span key={t}>{t}</span>)}</div></a>)}</div></section>

      <section className="lab-section" id="lab"><div className="shell"><div className="section-head"><div><span className="section-number">03 / INTERACTIVE LAB</span><h2>让理论动起来</h2><p>改动一个选择，观察它带来的约束与风险。</p></div><span className="section-corner">LEARN BY DOING</span></div><div className="lab-grid"><div className="lab-card triangle-card"><div className="lab-top"><span>EXPERIMENT 01</span><span>开放经济政策</span></div><h3>不可能三角</h3><p>一个经济体难以同时实现以下三个目标。选择你最想保留的两个。</p><div className="triangle-graphic"><div className="triangle-lines"/><div className="triangle-core">只能<br/>选二</div>{['汇率稳定', '资本自由流动', '货币政策自主'].map((x, i) => <button key={x} className={`triangle-point p${i} ${policy.includes(x) ? 'selected' : ''}`} onClick={() => togglePolicy(x)}>{x}</button>)}</div><div className="lab-result"><span>你的政策组合</span><strong>{policy.length === 2 ? `${policy[0]} + ${policy[1]}` : '请再选择一个目标'}</strong><p>{policy.length === 2 ? `相应地，${blocked}的空间会受到约束。这是一个分析框架；现实政策仍有程度与过渡安排。` : '请选择两个目标，观察剩余目标的约束。'}</p></div></div><div className="lab-card hedge-card"><div className="lab-top"><span>EXPERIMENT 02</span><span>企业外汇风险</span></div><h3>一笔出口订单的汇率选择</h3><p>假设企业 3 个月后收取美元。改变未来即期汇率，比较未锁汇与远期锁汇的人民币收入。</p><div className="field-row"><label>收款金额 <span>USD</span><input type="number" min="1" max="1000000000" value={invoice} onChange={e => setInvoice(Number(e.target.value))}/></label><label>远期锁定汇率 <span>CNY / USD</span><input type="number" min="0.01" max="100" step="0.01" value={forwardRate} onChange={e => setForwardRate(Number(e.target.value))}/></label></div><label className="slider-label">未来即期汇率 <strong>{futureRate.toFixed(2)}</strong> <span>CNY / USD</span><input type="range" min="5.5" max="8" step="0.01" value={futureRate} onChange={e => setFutureRate(Number(e.target.value))}/><div className="range-ends"><span>5.50</span><span>8.00</span></div></label><div className="compare-bars"><div><span>不锁汇</span><strong>¥ {fmt(invoice * futureRate, 0)}</strong></div><div><span>远期锁汇</span><strong>¥ {fmt(invoice * forwardRate, 0)}</strong></div></div><div className="hedge-note">{futureRate < forwardRate ? '此情景下，锁汇收入更高；它防范本币升值带来的收入损失。' : futureRate > forwardRate ? '此情景下，不锁汇收入更高；锁汇也意味着放弃有利汇率变动的收益。' : '此情景下两种方式收入相同。'} 数值为教学假设，未计交易成本。</div><button className="reset-btn" onClick={() => { setInvoice(100000); setFutureRate(6.85); setForwardRate(6.75) }}><RotateCcw size={14}/> 重置实验</button></div></div></div></section>

      <section className="cases-section shell" id="cases"><div className="section-head"><div><span className="section-number">04 / HISTORICAL LENS</span><h2>历史不是一条直线</h2><p>三个节点，理解跨境资本、外汇市场与政策反应。</p></div><span className="section-corner">THINK IN CAUSES</span></div><div className="case-layout"><div className="case-years">{cases.map(c => <button key={c.id} className={caseId === c.id ? 'case-active' : ''} onClick={() => setCaseId(c.id)}><span>{c.year}</span><small>{c.title}</small><ArrowRight size={17}/></button>)}</div><div className="case-content"><span className="case-place">{currentCase.place} · {currentCase.year}</span><h3>{currentCase.title}</h3><p>{currentCase.clue}</p><div className="case-question"><span>带着问题去读</span><strong>{currentCase.question}</strong></div><a href={currentCase.source} target="_blank" rel="noreferrer">查看背景资料 <ArrowUpRight size={17}/></a></div></div></section>

      <section className="reading-section" id="reading"><div className="shell"><div className="section-head"><div><span className="section-number">05 / READING ROOM</span><h2>回到原始问题</h2><p>经典论文提供理论骨架，官方数据帮助检验现实世界。</p></div><BookOpen size={32} strokeWidth={1.4}/></div><div className="reading-grid">{readings.map((r, i) => <a key={r.title} href={r.href} target="_blank" rel="noreferrer" className="reading-card"><span className="reading-index">0{i + 1} / {r.type}</span><div><span className="reading-year">{r.year}</span><h3>{r.title}</h3><small>{r.author}</small><p>{r.note}</p></div><span className="reading-link">{r.label}<ArrowUpRight size={17}/></span></a>)}</div></div></section>

      <section className="closing shell"><div><span className="section-number">KEEP EXPLORING</span><h2>从一个汇率，<br/>追问整个世界。</h2></div><a href="#atlas" className="round-cta" aria-label="返回地图"><ArrowUpRight size={28}/></a></section>
    </main>
    <footer><div className="shell footer-inner"><div><span className="footer-brand">汇流</span><p>国际金融互动图谱 · 课程小组项目</p></div><div className="footer-links"><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">汇率数据 Frankfurter</a><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">地图数据 Natural Earth</a><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">国家币种 world-countries · ODbL</a><a href="https://maplibre.org/" target="_blank" rel="noreferrer">地图引擎 MapLibre</a></div><span>© 2026 · 用好奇心读懂国际金融</span></div></footer>
  </>
}

export default App
