import {
  html as markup,
  svg as svgMarkup,
  content as renderContent,
  view,
  viewState,
  afterRender,
  compute,
  keepRef,
  uniqueId,
  elementRef,
  styles,
  ifDefined,
  live,
  keyed,
  unsafeHTML,
  selectValue,
} from "../ui/view.js";
import maplibregl from "maplibre-gl";
import { Globe2, Maximize2, RotateCcw } from "../ui/icons.js";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  countryName,
  currencyAt,
  currencyEpochStart,
  fmtRate,
  regimeByIso,
  regimeGroups,
} from "../map-data.js";
import { crossRate, pairChange } from "../lib/fx.js";
const graticule = {
  type: "FeatureCollection",
  features: [
    ...Array.from(
      {
        length: 5,
      },
      (_, i) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: Array.from(
            {
              length: 73,
            },
            (_, x) => [-180 + x * 5, -60 + i * 30],
          ),
        },
      }),
    ),
    ...Array.from(
      {
        length: 12,
      },
      (_, i) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: Array.from(
            {
              length: 33,
            },
            (_, x) => [-150 + i * 30, -80 + x * 5],
          ),
        },
      }),
    ),
  ],
};
const palette = {
  dark: {
    ocean: "#11161d",
    land: "#303d48",
    border: "#98a9b6",
    selected: "#88cbb9",
    outline: "#e0f4ef",
    hover: "#779c90",
    up: "#88cbb9",
    down: "#ca9188",
    flat: "#667783",
  },
  light: {
    ocean: "#f1f4f6",
    land: "#cad5da",
    border: "#7a8e9b",
    selected: "#528e7d",
    outline: "#1d5145",
    hover: "#87aea0",
    up: "#4d8d79",
    down: "#ac7168",
    flat: "#a9b8bf",
  },
};
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const AtlasMap = view(function AtlasMap({
  data,
  selected,
  onSelect,
  date,
  previousDate,
  current,
  previous,
  quote,
  mode,
  changeMode,
  regionCurrency,
  regimeFilter,
  theme,
  visible,
  view,
  onView,
}) {
  const viewport = keepRef(null),
    mapRef = keepRef(null),
    popupRef = keepRef(null);
  const [mapState, setMapState] = viewState("loading"),
    [retry, setRetry] = viewState(0);
  const onSelectRef = keepRef(onSelect);
  onSelectRef.current = onSelect;
  const info = keepRef({
    date,
    current,
    quote,
    mode,
  });
  info.current = {
    date,
    current,
    quote,
    mode,
  };
  const zoom = () =>
    Math.log2(
      (Math.max(
        Math.min(
          viewport.current?.clientWidth || 400,
          viewport.current?.clientHeight || 500,
        ) * 0.92,
        180,
      ) *
        Math.PI) /
        512,
    );
  const flatZoom = () =>
    Math.log2(((viewport.current?.clientWidth || 400) * 0.94) / 512);
  afterRender(() => {
    if (!viewport.current) return;
    setMapState("loading");
    let map, observer, popup;
    try {
      const p = palette.dark;
      map = new maplibregl.Map({
        container: viewport.current,
        renderWorldCopies: false,
        style: {
          version: 8,
          sources: {
            countries: {
              type: "geojson",
              data,
            },
            graticule: {
              type: "geojson",
              data: graticule,
            },
          },
          layers: [
            {
              id: "ocean",
              type: "background",
              paint: {
                "background-color": p.ocean,
              },
            },
            {
              id: "graticule",
              type: "line",
              source: "graticule",
              paint: {
                "line-color": p.border,
                "line-opacity": 0.13,
                "line-width": 0.6,
              },
            },
            {
              id: "countries-fill",
              type: "fill",
              source: "countries",
              paint: {
                "fill-color": p.land,
              },
            },
            {
              id: "countries-line",
              type: "line",
              source: "countries",
              paint: {
                "line-color": p.border,
                "line-opacity": 0.4,
                "line-width": 0.55,
              },
            },
            {
              id: "country-hover",
              type: "fill",
              source: "countries",
              filter: ["==", ["get", "iso"], ""],
              paint: {
                "fill-color": p.hover,
                "fill-opacity": 0.3,
              },
            },
            {
              id: "country-hover-line",
              type: "line",
              source: "countries",
              filter: ["==", ["get", "iso"], ""],
              paint: {
                "line-color": p.outline,
                "line-opacity": 0.65,
                "line-width": 1,
              },
            },
            {
              id: "country-selected",
              type: "fill",
              source: "countries",
              filter: ["==", ["get", "iso"], "CHN"],
              paint: {
                "fill-color": p.selected,
                "fill-opacity": 0.85,
              },
            },
            {
              id: "selected-outline",
              type: "line",
              source: "countries",
              filter: ["==", ["get", "iso"], "CHN"],
              paint: {
                "line-color": p.outline,
                "line-width": 1.6,
              },
            },
          ],
        },
        center: [104, 25],
        zoom: zoom(),
        attributionControl: false,
        canvasContextAttributes: {
          antialias: true,
        },
      });
      mapRef.current = map;
      map.scrollZoom.disable();
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
        }),
        "bottom-right",
      );
      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: "Natural Earth",
        }),
        "bottom-left",
      );
      popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 14,
        maxWidth: "240px",
        className: "atlas-map-popup",
      });
      popupRef.current = popup;
      map.once("load", () => {
        map.setProjection({
          type: "globe",
        });
        setMapState("ready");
      });
      map.on("error", () => {
        if (!map?.loaded()) setMapState("error");
      });
      map.on("click", "countries-fill", (event) => {
        const feature = data.features.find(
          (feature) => feature.id === event.features?.[0]?.id,
        );
        if (feature)
          onSelectRef.current({
            ...feature.properties,
            id: feature.id,
          });
      });
      map.on("mousemove", "countries-fill", (event) => {
        if (!map) return;
        const feature = data.features.find(
          (feature) => feature.id === event.features?.[0]?.id,
        );
        if (!feature) return;
        map.getCanvas().style.cursor = "pointer";
        map.setFilter("country-hover", [
          "==",
          ["get", "iso"],
          feature.properties.iso,
        ]);
        map.setFilter("country-hover-line", [
          "==",
          ["get", "iso"],
          feature.properties.iso,
        ]);
        const country = {
            ...feature.properties,
            id: feature.id,
          },
          code = currencyAt(country, info.current.date);
        const container = document.createElement("div"),
          title = document.createElement("strong"),
          detail = document.createElement("span");
        title.textContent = countryName(country);
        if (info.current.mode === "regimes")
          detail.textContent =
            regimeByIso[country.iso]?.label || "暂无制度分类";
        else {
          const value = code
            ? crossRate(info.current.current, code, info.current.quote)
            : undefined;
          detail.textContent = code
            ? info.current.mode === "regions"
              ? code
              : value === undefined
                ? code + " · 暂无报价"
                : `1 ${code} = ${fmtRate(value)} ${info.current.quote}`
            : "未匹配币种";
        }
        container.append(title, detail);
        popup?.setLngLat(event.lngLat).setDOMContent(container).addTo(map);
      });
      map.on("mouseleave", "countries-fill", () => {
        if (map) {
          map.getCanvas().style.cursor = "";
          map.setFilter("country-hover", ["==", ["get", "iso"], ""]);
          map.setFilter("country-hover-line", ["==", ["get", "iso"], ""]);
        }
        popup?.remove();
      });
      let width = viewport.current.clientWidth,
        height = viewport.current.clientHeight;
      observer = new ResizeObserver(() => {
        if (!viewport.current?.offsetWidth || !map) return;
        map.resize();
        if (
          width !== viewport.current.clientWidth ||
          height !== viewport.current.clientHeight
        ) {
          width = viewport.current.clientWidth;
          height = viewport.current.clientHeight;
          map.jumpTo({
            zoom: map.getProjection()?.type === "globe" ? zoom() : flatZoom(),
          });
        }
      });
      observer.observe(viewport.current);
    } catch {
      setMapState("error");
    }
    return () => {
      observer?.disconnect();
      popup?.remove();
      map?.remove();
      mapRef.current = null;
      popupRef.current = null;
    };
  }, [data, retry]);
  afterRender(() => {
    const map = mapRef.current;
    if (!map || mapState !== "ready") return;
    const p = palette[theme];
    for (const feature of data.features) {
      const currency = currencyAt(feature.properties, date);
      const change =
        currency &&
        currencyAt(feature.properties, previousDate) === currency &&
        currencyEpochStart(feature.properties, date) ===
          currencyEpochStart(feature.properties, previousDate)
          ? pairChange(current, previous, currency, quote)
          : undefined;
      map.setFeatureState(
        {
          source: "countries",
          id: feature.id,
        },
        {
          change: change ?? null,
          region: currency === regionCurrency,
          group: regimeByIso[feature.properties.iso]?.group || "unknown",
        },
      );
    }
    map.setPaintProperty("ocean", "background-color", p.ocean);
    map.setPaintProperty("graticule", "line-color", p.border);
    map.setPaintProperty("countries-line", "line-color", p.border);
    map.setPaintProperty("country-hover", "fill-color", p.hover);
    map.setPaintProperty(
      "country-hover",
      "fill-opacity",
      mode === "rates" && !changeMode ? 0.3 : 0,
    );
    map.setPaintProperty("country-hover-line", "line-color", p.outline);
    map.setFilter("country-hover", ["==", ["get", "iso"], ""]);
    map.setFilter("country-hover-line", ["==", ["get", "iso"], ""]);
    popupRef.current?.remove();
    map.setPaintProperty("country-selected", "fill-color", p.selected);
    map.setPaintProperty("selected-outline", "line-color", p.outline);
    map.setPaintProperty(
      "country-selected",
      "fill-opacity",
      mode === "rates" && !changeMode ? 0.85 : 0,
    );
    map.setPaintProperty(
      "countries-fill",
      "fill-opacity",
      mode === "regimes" && regimeFilter
        ? ["case", ["==", ["feature-state", "group"], regimeFilter], 0.95, 0.16]
        : 1,
    );
    if (mode === "regions")
      map.setPaintProperty("countries-fill", "fill-color", [
        "case",
        ["==", ["feature-state", "region"], true],
        p.selected,
        p.land,
      ]);
    else if (mode === "regimes")
      map.setPaintProperty("countries-fill", "fill-color", [
        "match",
        ["feature-state", "group"],
        ...Object.entries(regimeGroups).flatMap(([key, value]) => [
          key,
          value[theme],
        ]),
        p.land,
      ]);
    else if (changeMode)
      map.setPaintProperty("countries-fill", "fill-color", [
        "case",
        ["==", ["feature-state", "change"], null],
        p.land,
        [">", ["feature-state", "change"], 0.5],
        p.up,
        ["<", ["feature-state", "change"], -0.5],
        p.down,
        p.flat,
      ]);
    else map.setPaintProperty("countries-fill", "fill-color", p.land);
  }, [
    data,
    date,
    previousDate,
    current,
    previous,
    quote,
    mode,
    regionCurrency,
    regimeFilter,
    theme,
    changeMode,
    mapState,
  ]);
  afterRender(() => {
    const map = mapRef.current;
    if (!map || !selected || mapState !== "ready") return;
    map.setFilter("country-selected", ["==", ["get", "iso"], selected.iso]);
    map.setFilter("selected-outline", ["==", ["get", "iso"], selected.iso]);
    if (visible && (view === "globe" || map.getZoom() > flatZoom() + 0.5))
      map.easeTo({
        center: [selected.labelX, selected.labelY],
        duration: reducedMotion() ? 0 : 650,
      });
  }, [selected, visible, mapState]);
  afterRender(() => {
    const map = mapRef.current;
    if (!map || mapState !== "ready") return;
    map.setProjection({
      type: view === "globe" ? "globe" : "mercator",
    });
    map.easeTo({
      zoom: view === "globe" ? zoom() : flatZoom(),
      center:
        view === "globe" && selected
          ? [selected.labelX, selected.labelY]
          : [0, 15],
      duration: reducedMotion() ? 0 : 650,
    });
  }, [view, mode, mapState]);
  afterRender(() => {
    if (visible) {
      const frame = requestAnimationFrame(() => mapRef.current?.resize());
      return () => cancelAnimationFrame(frame);
    }
  }, [visible]);
  return markup`<div class="map-stage atlas-map-stage" data-map-state=${ifDefined(mapState)}><div class="map-viewport" ${elementRef(viewport)} role="region" aria-label="交互世界地图，可拖动和点击国家；也可用国家搜索选择。"></div><div class="atlas-map-camera"><button type="button" class="icon-button" aria-label=${ifDefined(view === "globe" ? "切换为平面地图" : "切换为地球")} title=${ifDefined(view === "globe" ? "平面地图" : "地球")} @click=${onView}>${renderContent(
    view === "globe"
      ? Maximize2({
          size: 17,
        })
      : Globe2({
          size: 17,
        }),
  )}</button><button type="button" class="icon-button" aria-label="重置地图视角" @click=${() =>
    mapRef.current?.easeTo({
      center:
        view === "globe" && selected
          ? [selected.labelX, selected.labelY]
          : [0, 15],
      zoom: view === "globe" ? zoom() : flatZoom(),
      duration: reducedMotion() ? 0 : 650,
    })}>${RotateCcw({
    size: 17,
  })}</button></div>${renderContent(mapState === "loading" && markup`<div class="map-loading" role="status"><div class="skeleton globe-skeleton"></div><span>正在加载地图</span></div>`)}${renderContent(
    mapState === "error" &&
      markup`<div class="map-error" role="status">${Globe2({
        size: 34,
      })}<p>地图暂时无法显示。</p><button class="secondary-button" @click=${() => setRetry((n) => n + 1)}>重新加载地图</button><small>仍可使用国家搜索查看汇率。</small></div>`,
  )}</div>`;
});
export default AtlasMap;
