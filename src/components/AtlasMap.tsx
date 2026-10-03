import { useEffect, useRef, useState } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { Globe2, Maximize2, RotateCcw } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { countryName, currencyAt, currencyEpochStart, fmtRate, regimeByIso, regimeGroups, type Country, type CountryData, type MapMode, type RegimeGroup } from '../map-data'
import { crossRate, pairChange, type RateSnapshot } from '../lib/fx'

const graticule: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [
  ...Array.from({ length: 5 }, (_, i) => ({ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: Array.from({ length: 73 }, (_, x) => [-180 + x * 5, -60 + i * 30]) } })),
  ...Array.from({ length: 12 }, (_, i) => ({ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: Array.from({ length: 33 }, (_, x) => [-150 + i * 30, -80 + x * 5]) } })),
] }
const palette = {
  dark: { ocean: '#11161d', land: '#303d48', border: '#98a9b6', selected: '#88cbb9', outline: '#e0f4ef', hover: '#779c90', up: '#88cbb9', down: '#ca9188', flat: '#667783' },
  light: { ocean: '#f1f4f6', land: '#cad5da', border: '#7a8e9b', selected: '#528e7d', outline: '#1d5145', hover: '#87aea0', up: '#4d8d79', down: '#ac7168', flat: '#a9b8bf' },
}
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function AtlasMap({ data, selected, onSelect, date, previousDate, current, previous, quote, mode, changeMode, regionCurrency, regimeFilter, theme, visible, view, onView }: {
  data: CountryData; selected: Country | null; onSelect: (country: Country) => void; date: string; previousDate: string;
  current: RateSnapshot; previous: RateSnapshot; quote: string; mode: MapMode; changeMode: boolean; regionCurrency: string;
  regimeFilter?: RegimeGroup; theme: 'dark' | 'light'; visible: boolean; view: 'globe' | 'flat'; onView: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null), mapRef = useRef<MapLibreMap | null>(null), popupRef = useRef<maplibregl.Popup | null>(null)
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading'), [retry, setRetry] = useState(0)
  const onSelectRef = useRef(onSelect); onSelectRef.current = onSelect
  const info = useRef({ date, current, quote, mode }); info.current = { date, current, quote, mode }
  const zoom = () => Math.log2(Math.max(Math.min(viewport.current?.clientWidth || 400, viewport.current?.clientHeight || 500) * .92, 180) * Math.PI / 512)
  const flatZoom = () => Math.log2((viewport.current?.clientWidth || 400) * .94 / 512)
  useEffect(() => {
    if (!viewport.current) return
    setMapState('loading')
    let map: MapLibreMap | undefined, observer: ResizeObserver | undefined, popup: maplibregl.Popup | undefined
    try {
      const p = palette.dark
      map = new maplibregl.Map({ container: viewport.current, renderWorldCopies: false, style: { version: 8, sources: { countries: { type: 'geojson', data }, graticule: { type: 'geojson', data: graticule } }, layers: [
        { id: 'ocean', type: 'background', paint: { 'background-color': p.ocean } },
        { id: 'graticule', type: 'line', source: 'graticule', paint: { 'line-color': p.border, 'line-opacity': .13, 'line-width': .6 } },
        { id: 'countries-fill', type: 'fill', source: 'countries', paint: { 'fill-color': p.land } },
        { id: 'countries-line', type: 'line', source: 'countries', paint: { 'line-color': p.border, 'line-opacity': .4, 'line-width': .55 } },
        { id: 'country-hover', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], ''], paint: { 'fill-color': p.hover, 'fill-opacity': .3 } },
        { id: 'country-hover-line', type: 'line', source: 'countries', filter: ['==', ['get', 'iso'], ''], paint: { 'line-color': p.outline, 'line-opacity': .65, 'line-width': 1 } },
        { id: 'country-selected', type: 'fill', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'fill-color': p.selected, 'fill-opacity': .85 } },
        { id: 'selected-outline', type: 'line', source: 'countries', filter: ['==', ['get', 'iso'], 'CHN'], paint: { 'line-color': p.outline, 'line-width': 1.6 } },
      ] }, center: [104, 25], zoom: zoom(), attributionControl: false, canvasContextAttributes: { antialias: true } })
      mapRef.current = map; map.scrollZoom.disable()
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Natural Earth' }), 'bottom-left')
      popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: '240px', className: 'atlas-map-popup' })
      popupRef.current = popup
      map.once('load', () => { map!.setProjection({ type: 'globe' }); setMapState('ready') })
      map.on('error', () => { if (!map?.loaded()) setMapState('error') })
      map.on('click', 'countries-fill', event => {
        const feature = data.features.find(feature => feature.id === event.features?.[0]?.id)
        if (feature) onSelectRef.current({ ...feature.properties, id: feature.id })
      })
      map.on('mousemove', 'countries-fill', event => {
        if (!map) return
        const feature = data.features.find(feature => feature.id === event.features?.[0]?.id)
        if (!feature) return
        map.getCanvas().style.cursor = 'pointer'; map.setFilter('country-hover', ['==', ['get', 'iso'], feature.properties.iso]); map.setFilter('country-hover-line', ['==', ['get', 'iso'], feature.properties.iso])
        const country = { ...feature.properties, id: feature.id }, code = currencyAt(country, info.current.date)
        const container = document.createElement('div'), title = document.createElement('strong'), detail = document.createElement('span')
        title.textContent = countryName(country)
        if (info.current.mode === 'regimes') detail.textContent = regimeByIso[country.iso]?.label || '暂无制度分类'
        else {
          const value = code ? crossRate(info.current.current, code, info.current.quote) : undefined
          detail.textContent = code ? (info.current.mode === 'regions' ? code : value === undefined ? code + ' · 暂无报价' : `1 ${code} = ${fmtRate(value)} ${info.current.quote}`) : '未匹配币种'
        }
        container.append(title, detail); popup?.setLngLat(event.lngLat).setDOMContent(container).addTo(map)
      })
      map.on('mouseleave', 'countries-fill', () => { if (map) { map.getCanvas().style.cursor = ''; map.setFilter('country-hover', ['==', ['get', 'iso'], '']); map.setFilter('country-hover-line', ['==', ['get', 'iso'], '']) }; popup?.remove() })
      let width = viewport.current.clientWidth, height = viewport.current.clientHeight
      observer = new ResizeObserver(() => {
        if (!viewport.current?.offsetWidth || !map) return
        map.resize()
        if (width !== viewport.current.clientWidth || height !== viewport.current.clientHeight) {
          width = viewport.current.clientWidth; height = viewport.current.clientHeight
          map.jumpTo({ zoom: map.getProjection()?.type === 'globe' ? zoom() : flatZoom() })
        }
      }); observer.observe(viewport.current)
    } catch { setMapState('error') }
    return () => { observer?.disconnect(); popup?.remove(); map?.remove(); mapRef.current = null; popupRef.current = null }
  }, [data, retry])
  useEffect(() => {
    const map = mapRef.current
    if (!map || mapState !== 'ready') return
    const p = palette[theme]
    for (const feature of data.features) {
      const currency = currencyAt(feature.properties, date)
      const change = currency && currencyAt(feature.properties, previousDate) === currency && currencyEpochStart(feature.properties, date) === currencyEpochStart(feature.properties, previousDate) ? pairChange(current, previous, currency, quote) : undefined
      map.setFeatureState({ source: 'countries', id: feature.id }, { change: change ?? null, region: currency === regionCurrency, group: regimeByIso[feature.properties.iso]?.group || 'unknown' })
    }
    map.setPaintProperty('ocean', 'background-color', p.ocean)
    map.setPaintProperty('graticule', 'line-color', p.border)
    map.setPaintProperty('countries-line', 'line-color', p.border)
    map.setPaintProperty('country-hover', 'fill-color', p.hover)
    map.setPaintProperty('country-hover', 'fill-opacity', mode === 'rates' && !changeMode ? .3 : 0)
    map.setPaintProperty('country-hover-line', 'line-color', p.outline)
    map.setFilter('country-hover', ['==', ['get', 'iso'], '']); map.setFilter('country-hover-line', ['==', ['get', 'iso'], '']); popupRef.current?.remove()
    map.setPaintProperty('country-selected', 'fill-color', p.selected)
    map.setPaintProperty('selected-outline', 'line-color', p.outline)
    map.setPaintProperty('country-selected', 'fill-opacity', mode === 'rates' && !changeMode ? .85 : 0)
    map.setPaintProperty('countries-fill', 'fill-opacity', mode === 'regimes' && regimeFilter ? ['case', ['==', ['feature-state', 'group'], regimeFilter], .95, .16] : 1)
    if (mode === 'regions') map.setPaintProperty('countries-fill', 'fill-color', ['case', ['==', ['feature-state', 'region'], true], p.selected, p.land])
    else if (mode === 'regimes') map.setPaintProperty('countries-fill', 'fill-color', ['match', ['feature-state', 'group'], ...Object.entries(regimeGroups).flatMap(([key, value]) => [key, value[theme]]), p.land] as maplibregl.ExpressionSpecification)
    else if (changeMode) map.setPaintProperty('countries-fill', 'fill-color', ['case', ['==', ['feature-state', 'change'], null], p.land, ['>', ['feature-state', 'change'], .5], p.up, ['<', ['feature-state', 'change'], -.5], p.down, p.flat])
    else map.setPaintProperty('countries-fill', 'fill-color', p.land)
  }, [data, date, previousDate, current, previous, quote, mode, regionCurrency, regimeFilter, theme, changeMode, mapState])
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected || mapState !== 'ready') return
    map.setFilter('country-selected', ['==', ['get', 'iso'], selected.iso]); map.setFilter('selected-outline', ['==', ['get', 'iso'], selected.iso])
    if (visible && (view === 'globe' || map.getZoom() > flatZoom() + .5)) map.easeTo({ center: [selected.labelX, selected.labelY], duration: reducedMotion() ? 0 : 650 })
  }, [selected, visible, mapState])
  useEffect(() => {
    const map = mapRef.current
    if (!map || mapState !== 'ready') return
    map.setProjection({ type: view === 'globe' ? 'globe' : 'mercator' })
    map.easeTo({ zoom: view === 'globe' ? zoom() : flatZoom(), center: view === 'globe' && selected ? [selected.labelX, selected.labelY] : [0, 15], duration: reducedMotion() ? 0 : 650 })
  }, [view, mode, mapState])
  useEffect(() => { if (visible) { const frame = requestAnimationFrame(() => mapRef.current?.resize()); return () => cancelAnimationFrame(frame) } }, [visible])
  return <div className="map-stage atlas-map-stage" data-map-state={mapState}>
    <div className="map-viewport" ref={viewport} role="region" aria-label="交互世界地图，可拖动和点击国家；也可用国家搜索选择。" />
    <div className="atlas-map-camera"><button type="button" className="icon-button" aria-label={view === 'globe' ? '切换为平面地图' : '切换为地球'} title={view === 'globe' ? '平面地图' : '地球'} onClick={onView}>{view === 'globe' ? <Maximize2 size={17} /> : <Globe2 size={17} />}</button><button type="button" className="icon-button" aria-label="重置地图视角" onClick={() => mapRef.current?.easeTo({ center: view === 'globe' && selected ? [selected.labelX, selected.labelY] : [0, 15], zoom: view === 'globe' ? zoom() : flatZoom(), duration: reducedMotion() ? 0 : 650 })}><RotateCcw size={17} /></button></div>
    {mapState === 'loading' && <div className="map-loading" role="status"><div className="skeleton globe-skeleton" /><span>正在加载地图</span></div>}
    {mapState === 'error' && <div className="map-error" role="status"><Globe2 size={34} /><p>地图暂时无法显示。</p><button className="secondary-button" onClick={() => setRetry(n => n + 1)}>重新加载地图</button><small>仍可使用国家搜索查看汇率。</small></div>}
  </div>
}
