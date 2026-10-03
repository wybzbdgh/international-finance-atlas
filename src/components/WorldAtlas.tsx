import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, Globe2, Pause, Play, RotateCcw, Search, X } from 'lucide-react'
import { lessonHref } from '../content'
import { crossRate, pairChange } from '../lib/fx'
import { convertedAmount, isoToday, monthsBefore, nearestDateIndex, pairSeries, replayTicks, shiftDate, snapshotFromRows, type ReplayRange } from '../lib/atlas-models'
import { useAtlasRates } from '../lib/atlas-rates'
import { countryName, currencyAt, currencyEpochStart, currencyName, defaultReadings, fmtAmount, fmtRate, quoteCurrencies, regimeByIso, regimeGroups, regimeSource, relatedReadings, type Country, type CountryData, type MapMode, type RegimeGroup } from '../map-data'
import AtlasMap from './AtlasMap'
import CurrencyComparison, { AtlasSparkline, rangeLabels, type ChartRange } from './AtlasCharts'
import '../atlas-updates.css'

const mapModes: { key: MapMode; label: string }[] = [{ key: 'rates', label: '汇率走势' }, { key: 'regions', label: '货币区域' }, { key: 'regimes', label: '汇率制度' }]
const replayRanges: { key: ReplayRange; label: string }[] = [{ key: 'year', label: '近 1 年' }, { key: 'five', label: '近 5 年' }, { key: 'since2008', label: '2008 年起' }]
const regionCurrencies = ['EUR', 'USD', 'XOF', 'XAF', 'XCD', 'GBP', 'AUD', 'NZD', 'CHF', 'CNY', 'JPY']

export default function WorldAtlas({ theme, visible }: { theme: 'dark' | 'light'; visible: boolean }) {
  const [today] = useState(isoToday)
  const [data, setData] = useState<CountryData | null>(null)
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selected, setSelected] = useState<Country | null>(null)
  const [mode, setMode] = useState<MapMode>('rates')
  const [quote, setQuote] = useState('USD')
  const [view, setView] = useState<'globe' | 'flat'>('globe')
  const [changeMode, setChangeMode] = useState(false)
  const [regionCurrency, setRegionCurrency] = useState('EUR')
  const [regimeFilter, setRegimeFilter] = useState<RegimeGroup>()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchIndex, setSearchIndex] = useState(-1)
  const [date, setDate] = useState(today)
  const [replayRange, setReplayRange] = useState<ReplayRange>('year')
  const [playing, setPlaying] = useState(false)
  const [range, setRange] = useState<ChartRange>(90)
  const [amount, setAmount] = useState('1000')
  const [comparisonIsos, setComparisonIsos] = useState(['CHN', 'JPN', 'DEU'])
  const [retry, setRetry] = useState(0)
  const [dataRetry, setDataRetry] = useState(0)
  const [historyRetry, setHistoryRetry] = useState(0)
  const countries = useMemo(() => data?.features.map(feature => ({ ...feature.properties, id: feature.id })) || [], [data])
  const previousDate = shiftDate(date, -30)
  const latest = useAtlasRates('?base=USD' + (date === today ? '' : '&date=' + date), retry)
  const previous = useAtlasRates('?base=USD&date=' + previousDate, retry)
  const snapshot = useMemo(() => snapshotFromRows(latest.rows), [latest.rows])
  const oldSnapshot = useMemo(() => snapshotFromRows(previous.rows), [previous.rows])
  const base = selected ? currencyAt(selected, date) : null
  const selectedRate = latest.status === 'ready' && base ? crossRate(snapshot.values, base, quote) : undefined
  const unchangedCurrency = selected && currencyAt(selected, previousDate) === base && currencyEpochStart(selected, date) === currencyEpochStart(selected, previousDate)
  const delta = base && unchangedCurrency && latest.status === 'ready' && previous.status === 'ready' ? pairChange(snapshot.values, oldSnapshot.values, base, quote) : undefined
  const referenceDates = Array.from(new Set([base, quote].filter(code => code && code !== 'USD').map(code => snapshot.dates[code!]).filter(Boolean))).sort()
  const rateDate = referenceDates.length ? referenceDates.join(' / ') : latest.rows[0]?.date
  const ticks = useMemo(() => replayTicks(today, replayRange), [today, replayRange])
  const tickIndex = nearestDateIndex(ticks, date)
  const comparisonChoices = useMemo(() => {
    const seen = new Set<string>()
    return comparisonIsos.flatMap(iso => {
      const country = countries.find(country => country.iso === iso), code = country ? currencyAt(country, date) : null
      if (!country || !code || seen.has(code)) return []
      seen.add(code); return [{ code, country }]
    })
  }, [countries, comparisonIsos, date])
  const historyQuotes = Array.from(new Set([base, quote, ...comparisonChoices.map(item => item.code)].filter((code): code is string => !!code && code !== 'USD'))).sort()
  const history = useAtlasRates(playing ? undefined : '?base=USD&quotes=' + (historyQuotes.join(',') || 'EUR') + '&from=' + monthsBefore(date, range === 30 ? 1 : range === 90 ? 3 : range === 365 ? 12 : 60) + '&to=' + date, historyRetry)
  const points = useMemo(() => base && selected ? pairSeries(history.rows, base, quote).filter(point => point.date >= currencyEpochStart(selected, date)) : [], [history.rows, base, quote, selected, date])
  const converted = convertedAmount(amount, selectedRate)
  const amountInvalid = amount.trim() !== '' && (!Number.isFinite(Number(amount)) || Number(amount) < 0 || Number(amount) > 1e12)
  const selectedRegime = selected ? regimeByIso[selected.iso] : undefined
  const members = useMemo(() => countries.filter(country => currencyAt(country, date) === regionCurrency).sort((a, b) => countryName(a).localeCompare(countryName(b), 'zh-CN')), [countries, date, regionCurrency])
  const filtered = countries.filter(country => (countryName(country) + ' ' + country.nameEn + ' ' + country.iso + ' ' + (currencyAt(country, date) || '') + ' ' + (currencyAt(country, date) ? currencyName(currencyAt(country, date)!) : '')).toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)

  useEffect(() => {
    const controller = new AbortController()
    setDataState('loading')
    void fetch(import.meta.env.BASE_URL + 'data/countries.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('地图数据不可用'); return response.json() as Promise<CountryData> })
      .then(collection => {
        if (controller.signal.aborted) return
        if (!collection.features?.length) throw new Error('地图数据为空')
        setData(collection); setDataState('ready')
        const initial = collection.features.find(feature => feature.properties.iso === 'CHN') || collection.features[0]
        setSelected(country => country || { ...initial.properties, id: initial.id })
      }).catch(() => { if (!controller.signal.aborted) setDataState('error') })
    return () => controller.abort()
  }, [dataRetry])
  useEffect(() => { if (!visible) setPlaying(false) }, [visible])
  useEffect(() => {
    if (!playing) return
    if (latest.status === 'error' || tickIndex >= ticks.length - 1) { setPlaying(false); return }
    if (latest.status !== 'ready' || previous.status === 'loading') return
    const timer = window.setTimeout(() => setDate(ticks[tickIndex + 1]), 1400)
    return () => window.clearTimeout(timer)
  }, [playing, latest.status, previous.status, tickIndex, ticks])

  const choose = (country: Country) => {
    setSelected(country); setQuery(''); setSearchOpen(false); setSearchIndex(-1)
    const currency = currencyAt(country, date)
    if (mode === 'regions' && currency) setRegionCurrency(currency)
  }
  const chooseDate = (next: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next) || next < '2008-01-01' || next > today) return
    setDate(next); setPlaying(false)
    if (next < ticks[0]) setReplayRange('since2008')
  }
  const chooseMode = (next: MapMode) => {
    setMode(next); setRegimeFilter(undefined)
    if (next !== 'rates') setView('flat')
    if (next === 'regimes') setPlaying(false)
  }
  const toggleReplay = () => {
    if (playing) { setPlaying(false); return }
    if (tickIndex >= ticks.length - 1) setDate(ticks[0])
    setPlaying(true)
  }
  const canAdd = !!selected && !!base && comparisonChoices.length < 4 && !comparisonChoices.some(item => item.code === base)

  return <main id="atlas" tabIndex={-1} hidden={!visible} className="atlas-page atlas-expanded shell">
    <header className="atlas-heading"><div><h1>世界货币<span>汇率地图</span></h1><p>点选国家，查看本币汇率；沿时间轴回看货币的变化。</p></div><a href="#learn" className="atlas-course-link">课程读本<ArrowUpRight size={16} /></a></header>
    <nav className="atlas-modes" aria-label="地图图层">{mapModes.map(item => <button type="button" key={item.key} aria-pressed={mode === item.key} onClick={() => chooseMode(item.key)}>{item.label}</button>)}<span>{mode === 'regimes' ? '制度分类 · ' + regimeSource.date : date === today ? '最新参考价' : '历史参考价 · ' + date}</span></nav>
    <div className="atlas-workspace">
      <section className="atlas-map-column" aria-label="世界地图与图例">
        <div className="atlas-layer-controls">
          {mode === 'rates' ? <><div className="atlas-view-choice" role="group" aria-label="汇率地图着色"><button type="button" aria-pressed={!changeMode} onClick={() => setChangeMode(false)}>国家</button><button type="button" aria-pressed={changeMode} onClick={() => setChangeMode(true)}>30 日涨跌</button></div><span>相对{currencyName(quote)}</span></> : mode === 'regions' ? <><label className="atlas-region-select"><span>查看货币</span><select value={regionCurrency} onChange={event => setRegionCurrency(event.target.value)} aria-label="选择货币区域">{Array.from(new Set([...regionCurrencies, regionCurrency])).map(code => <option key={code} value={code}>{currencyName(code)} · {code}</option>)}</select><ChevronDown size={14} /></label><span>{members.length} 个国家或地区</span></> : <><span>按实际汇率安排分类</span><a href={regimeSource.url} target="_blank" rel="noreferrer">IMF · 2025 年 4 月<ArrowUpRight size={13} /></a></>}
        </div>
        {data ? <AtlasMap data={data} selected={selected} onSelect={choose} date={date} previousDate={previousDate} current={snapshot.values} previous={oldSnapshot.values} quote={quote} mode={mode} changeMode={changeMode} regionCurrency={regionCurrency} regimeFilter={regimeFilter} theme={theme} visible={visible} view={view} onView={() => setView(value => value === 'globe' ? 'flat' : 'globe')} /> : <div className="atlas-map-placeholder" role="status"><Globe2 size={32} /><p>{dataState === 'error' ? '地图数据暂时无法连接。' : '正在加载地图'}</p>{dataState === 'error' && <button type="button" className="text-button" onClick={() => setDataRetry(value => value + 1)}>重新加载<RotateCcw size={14} /></button>}</div>}
        <div className="atlas-layer-legend">
          {mode === 'rates' && changeMode ? <><span><i className="atlas-swatch up" />本币升值</span><span><i className="atlas-swatch stable" />±0.5% 内</span><span><i className="atlas-swatch down" />本币贬值</span><span><i className="atlas-swatch unknown" />暂无对比</span></> : mode === 'regions' ? <><span><i className="atlas-swatch up" />使用{currencyName(regionCurrency)}</span><span><i className="atlas-swatch unknown" />其他货币</span></> : mode === 'regimes' ? Object.entries(regimeGroups).map(([key, group]) => <button type="button" key={key} aria-pressed={regimeFilter === key} onClick={() => setRegimeFilter(value => value === key ? undefined : key as RegimeGroup)}><i className="atlas-swatch" style={{ background: group[theme] }} />{group.label}</button>) : <span className="atlas-drag-hint">{view === 'globe' ? '拖动旋转' : '拖动平移'} · 点击国家 · ＋ / − 缩放</span>}
          {mode === 'regimes' && <span><i className="atlas-swatch unknown" />暂无分类</span>}
        </div>
        {mode === 'rates' && changeMode && previous.status !== 'ready' && <p className="atlas-layer-note">{previous.status === 'loading' ? '正在读取 30 日前的参考价。' : '暂未取得对比日数据。'}{previous.status === 'error' && <button className="text-button" onClick={() => setRetry(value => value + 1)}>重试</button>}</p>}
        {mode === 'regions' && <details className="atlas-region-members"><summary>使用{currencyName(regionCurrency)}的国家与地区<ChevronDown size={14} /></summary><div>{members.length ? members.map(country => <button type="button" key={country.id} aria-pressed={selected?.iso === country.iso} onClick={() => choose(country)}>{countryName(country)}</button>) : <p>地图中暂未匹配到使用这一货币的地区。</p>}</div><p>显示选定日期的主要流通货币；多币制国家不穷尽所有法定货币。</p></details>}
        {mode === 'regimes' && <p className="atlas-layer-note">{regimeFilter ? regimeGroups[regimeFilter].description : '点击图例筛选；点选国家查看具体安排。'} 制度分类固定于资料日期。</p>}
      </section>
      <aside className="country-panel atlas-country-panel" aria-label="所选国家的汇率">
        <div className="map-search"><Search size={16} /><input role="combobox" aria-label="搜索国家或货币" aria-expanded={searchOpen && !!query} aria-controls="country-results" aria-autocomplete="list" aria-activedescendant={searchOpen && searchIndex >= 0 ? 'country-result-' + searchIndex : undefined} placeholder="搜索国家或货币" value={query} onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)} onChange={event => { setQuery(event.target.value); setSearchOpen(true); setSearchIndex(-1) }} onKeyDown={event => {
          if (event.key === 'Escape') setSearchOpen(false)
          if (event.key === 'ArrowDown') { event.preventDefault(); setSearchOpen(true); setSearchIndex(value => Math.min(value + 1, filtered.length - 1)) }
          if (event.key === 'ArrowUp') { event.preventDefault(); setSearchIndex(value => Math.max(value - 1, 0)) }
          if (event.key === 'Enter' && query && filtered.length) { event.preventDefault(); choose(filtered[Math.max(searchIndex, 0)]) }
        }} />{query && <button type="button" aria-label="清除搜索" onClick={() => { setQuery(''); setSearchOpen(false); setSearchIndex(-1) }}><X size={15} /></button>}{searchOpen && query && <div className="search-results" id="country-results" role="listbox">{filtered.length ? filtered.map((country, index) => <button type="button" id={'country-result-' + index} role="option" aria-selected={index === searchIndex} className={index === searchIndex ? 'highlighted' : ''} onMouseDown={event => event.preventDefault()} key={country.id} onClick={() => choose(country)}><span>{countryName(country)}</span><small>{currencyAt(country, date) || '暂无币种'}</small></button>) : <p>未找到对应国家或货币。</p>}</div>}</div>
        <div className="country-name" aria-live="polite"><div><span>{selected?.nameEn || '选择国家'}</span><h2 className={selected && countryName(selected).length > 8 ? 'long-country-name' : ''}>{selected ? countryName(selected) : '选择一个国家'}</h2></div><span className="currency-code">{base || '—'}</span></div>
        {mode === 'regimes' && <div className="atlas-regime-detail"><span>实际汇率安排</span><strong>{selectedRegime?.label || '暂无分类'}</strong><small>{selectedRegime ? '资料日期 ' + selectedRegime.date : '这一地区未列入本表。'}</small>{selectedRegime && <p>{regimeGroups[selectedRegime.group].description}</p>}</div>}
        <div className="atlas-quote-content" aria-busy={latest.status === 'loading'}>
          {latest.status === 'loading' ? <div className="rate-loading" role="status"><span className="skeleton skeleton-number" /><p>正在读取参考汇率</p></div> : latest.status === 'error' ? <div className="rate-empty"><p>汇率服务暂时无法连接。</p><button type="button" className="text-button" onClick={() => setRetry(value => value + 1)}>重新获取<RotateCcw size={14} /></button></div> : selectedRate !== undefined ? <><div className="rate-primary" aria-live="polite"><span>1 {currencyName(base!)} 可兑换</span><div><strong>{fmtRate(selectedRate)}</strong><small>{quote}</small></div></div><div className="rate-secondary"><span>反向报价 · 1 {quote}</span><strong>{fmtRate(1 / selectedRate)} {base}</strong></div><div className="rate-change"><span>兑{currencyName(quote)} · 近 30 日</span><strong className={delta === undefined || Math.abs(delta) < .005 ? '' : delta > 0 ? 'appreciation-text' : 'depreciation-text'}>{delta === undefined ? unchangedCurrency ? '暂无对比' : '币制更替' : (delta > 0 ? '+' : '') + delta.toFixed(2) + '%'}{delta !== undefined && Math.abs(delta) >= .005 && (delta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}</strong></div></> : <div className="rate-empty"><p>{base ? '这一日期暂无该币种报价。' : '这一地区未匹配到主要流通货币。'}</p><small>可更换日期、国家或目标币种。</small></div>}
        </div>
        <fieldset className="quote-currencies"><legend>兑换成</legend><div className="currency-options">{quoteCurrencies.map(currency => <button type="button" key={currency.code} aria-pressed={quote === currency.code} className={quote === currency.code ? 'selected' : ''} onClick={() => setQuote(currency.code)}><span>{currency.name}</span><small>{currency.code}</small></button>)}</div></fieldset>
        <div className="atlas-amount-conversion"><label htmlFor="atlas-amount">金额换算</label><div className="atlas-amount-input"><input id="atlas-amount" aria-label="本币金额" aria-invalid={amountInvalid} inputMode="decimal" type="number" min="0" max="1000000000000" step="any" value={amount} onChange={event => setAmount(event.target.value)} /><span>{base || '—'}</span><ArrowRight size={14} /><output>{converted === undefined ? '—' : fmtAmount(converted)}<small>{quote}</small></output></div>{amountInvalid && <small className="atlas-amount-error">请输入 0 至 1 万亿之间的金额。</small>}</div>
        <div className="atlas-panel-chart"><div className="atlas-panel-chart-heading"><select aria-label="国家走势图范围" value={range} onChange={event => setRange(Number(event.target.value) as ChartRange)}>{([30, 90, 365, 1826] as ChartRange[]).map(value => <option key={value} value={value}>{rangeLabels[value]}走势</option>)}</select><small>{quote} / {base || '—'}</small></div>{playing ? <p className="atlas-chart-empty">暂停回放后查看这一日期前的走势。</p> : base === quote ? <p className="atlas-chart-empty">同一种货币，兑换比例恒为 1。</p> : history.status === 'loading' ? <div className="atlas-chart-loading skeleton" role="status" aria-label="正在读取历史走势" /> : history.status === 'error' ? <div className="atlas-chart-empty">历史数据暂不可用。<button type="button" className="text-button" onClick={() => setHistoryRetry(value => value + 1)}>重试</button></div> : <AtlasSparkline key={base + quote + date + range} points={points} base={base || ''} quote={quote} />}</div>
        <div className="atlas-reference-date">{rateDate ? '参考日 ' + rateDate : '每日参考汇率'}</div>
        <details className="country-reading"><summary>相关课程<ChevronDown size={13} /></summary>{(relatedReadings[selected?.iso || ''] || defaultReadings).map(item => <a key={item.id} href={lessonHref(item.id, item.section)}>{item.title}<ArrowUpRight size={13} /></a>)}</details>
      </aside>
    </div>
    {mode !== 'regimes' && <section className="atlas-timeline" aria-labelledby="atlas-time-title"><div className="atlas-timeline-heading"><h2 id="atlas-time-title">时间回放</h2><span>{replayRange === 'year' ? '每月一步' : replayRange === 'five' ? '每季度一步' : '每年一步'}</span></div><div className="atlas-timeline-content"><div className="atlas-timeline-toolbar"><div className="atlas-replay-ranges" role="group" aria-label="回放时间范围">{replayRanges.map(item => <button type="button" key={item.key} aria-pressed={replayRange === item.key} onClick={() => { setReplayRange(item.key); setPlaying(false); const nextTicks = replayTicks(today, item.key); if (date < nextTicks[0]) setDate(nextTicks[0]) }}>{item.label}</button>)}</div><label className="atlas-date-input"><span>日期</span><input type="date" min="2008-01-01" max={today} aria-label="汇率观察日期" value={date} onChange={event => chooseDate(event.target.value)} /></label><button type="button" className="atlas-today" onClick={() => chooseDate(today)}>最新</button></div><div className="atlas-time-track"><button type="button" className="atlas-replay-button" onClick={toggleReplay} aria-label={playing ? '暂停历史回放' : '播放历史回放'} aria-pressed={playing}>{playing ? <Pause size={15} /> : <Play size={15} />}</button><div><input type="range" min="0" max={ticks.length - 1} step="1" value={tickIndex} aria-label="历史回放时间轴" aria-valuetext={date} style={{ '--timeline-progress': tickIndex / (ticks.length - 1) * 100 + '%' } as CSSProperties} onChange={event => chooseDate(ticks[Number(event.target.value)])} /><div className="atlas-time-limits"><time>{ticks[0]}</time><span>{date}</span><time>{today}</time></div></div></div></div></section>}
    <CurrencyComparison key={date + quote + range + comparisonChoices.map(item => item.code).join(',')} rows={history.rows} choices={comparisonChoices} quote={quote} date={date} range={range} onRange={setRange} onRemove={code => setComparisonIsos(isos => isos.filter(iso => !countries.some(country => country.iso === iso && currencyAt(country, date) === code)))} onAdd={() => { if (canAdd && selected) setComparisonIsos(isos => [...isos, selected.iso]) }} canAdd={canAdd} status={playing ? 'replaying' : history.status} onRetry={() => setHistoryRetry(value => value + 1)} />
    <div className="atlas-data-footer"><span>Frankfurter · 每日参考价</span><details><summary>数据与口径<ChevronDown size={13} /></summary><p>报价单位为“目标货币／本币”；数值上升表示本币相对目标货币升值。金额换算按参考汇率计算，不含交易费用。30 日变化按两个参考日的报价比较；不同币种的数据日期可能不同，未取得报价或发生币制更替时不计算涨跌。</p><p>历史按现行国界展示。货币区域显示主要流通货币，不穷尽多币制国家的全部法定货币。比较图只使用所选币种共同有数据的日期，并以同一日期为 100；不将不同货币单位接成同一条序列。部分币种的历史覆盖较短。</p><p>汇率制度采用 IMF 2025 年年报的实际安排分类，主要截至 2025 年 4 月 30 日。阿富汗、委内瑞拉资料日期为 2021 年 4 月 30 日，叙利亚为 2017 年 4 月 30 日。图层不会随汇率时间回放改变。</p><div><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">汇率数据说明<ArrowUpRight size={13} /></a><a href={regimeSource.url} target="_blank" rel="noreferrer">汇率制度来源<ArrowUpRight size={13} /></a></div></details></div>
  </main>
}
