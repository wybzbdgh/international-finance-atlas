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
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Globe2,
  RotateCcw,
  Search,
  X,
} from "../ui/icons.js";
import { lessonHref } from "../content.js";
import { crossRate, pairChange } from "../lib/fx.js";
import {
  convertedAmount,
  isoToday,
  pairSeries,
  shiftDate,
  snapshotFromRows,
} from "../lib/atlas-models.js";
import { useAtlasRates } from "../lib/atlas-rates.js";
import { presetPeriod } from "../lib/date-range.js";
import {
  countryName,
  currencyAt,
  currencyEpochStart,
  currencyName,
  defaultReadings,
  fmtAmount,
  fmtRate,
  quoteCurrencies,
  regimeByIso,
  regimeGroups,
  regimeSource,
  relatedReadings,
} from "../map-data.js";
import AtlasMap from "./AtlasMap.js";
import CurrencyComparison, {
  AtlasSparkline,
  rangeLabels,
} from "./AtlasCharts.js";
import "../atlas-updates.css";
const mapModes = [
  {
    key: "rates",
    label: "汇率走势",
  },
  {
    key: "regions",
    label: "货币区域",
  },
  {
    key: "regimes",
    label: "汇率制度",
  },
];
const regionCurrencies = [
  "EUR",
  "USD",
  "XOF",
  "XAF",
  "XCD",
  "GBP",
  "AUD",
  "NZD",
  "CHF",
  "CNY",
  "JPY",
];
const WorldAtlas = view(function WorldAtlas({ theme, visible }) {
  const [today] = viewState(isoToday);
  const [data, setData] = viewState(null);
  const [dataState, setDataState] = viewState("loading");
  const [selected, setSelected] = viewState(null);
  const [mode, setMode] = viewState("rates");
  const [quote, setQuote] = viewState("USD");
  const [view, setView] = viewState("globe");
  const [changeMode, setChangeMode] = viewState(false);
  const [regionCurrency, setRegionCurrency] = viewState("EUR");
  const [regimeFilter, setRegimeFilter] = viewState();
  const [query, setQuery] = viewState("");
  const [searchOpen, setSearchOpen] = viewState(false);
  const [searchIndex, setSearchIndex] = viewState(-1);
  const date = today;
  const [range, setRange] = viewState(90);
  const [comparisonRange, setComparisonRange] = viewState(90);
  const [customPeriod, setCustomPeriod] = viewState(null);
  const comparisonPeriod =
    comparisonRange === "custom"
      ? customPeriod
      : presetPeriod(today, comparisonRange);
  const [amount, setAmount] = viewState("1000");
  const [comparisonIsos, setComparisonIsos] = viewState(["CHN", "JPN", "DEU"]);
  const [retry, setRetry] = viewState(0);
  const [dataRetry, setDataRetry] = viewState(0);
  const [historyRetry, setHistoryRetry] = viewState(0);
  const [comparisonRetry, setComparisonRetry] = viewState(0);
  const countries = compute(
    () =>
      data?.features.map((feature) => ({
        ...feature.properties,
        id: feature.id,
      })) || [],
    [data],
  );
  const previousDate = shiftDate(date, -30);
  const latest = useAtlasRates("?base=USD", retry);
  const previous = useAtlasRates("?base=USD&date=" + previousDate, retry);
  const snapshot = compute(() => snapshotFromRows(latest.rows), [latest.rows]);
  const oldSnapshot = compute(
    () => snapshotFromRows(previous.rows),
    [previous.rows],
  );
  const base = selected ? currencyAt(selected, date) : null;
  const selectedRate =
    latest.status === "ready" && base
      ? crossRate(snapshot.values, base, quote)
      : undefined;
  const unchangedCurrency =
    selected &&
    currencyAt(selected, previousDate) === base &&
    currencyEpochStart(selected, date) ===
      currencyEpochStart(selected, previousDate);
  const delta =
    base &&
    unchangedCurrency &&
    latest.status === "ready" &&
    previous.status === "ready"
      ? pairChange(snapshot.values, oldSnapshot.values, base, quote)
      : undefined;
  const referenceDates = Array.from(
    new Set(
      [base, quote]
        .filter((code) => code && code !== "USD")
        .map((code) => snapshot.dates[code])
        .filter(Boolean),
    ),
  ).sort();
  const rateDate = referenceDates.length
    ? referenceDates.join(" / ")
    : latest.rows[0]?.date;
  const comparisonChoices = compute(() => {
    const seen = new Set();
    return comparisonIsos.flatMap((iso) => {
      const country = countries.find((country) => country.iso === iso),
        code = country ? currencyAt(country, comparisonPeriod.to) : null;
      if (!country || !code || seen.has(code)) return [];
      seen.add(code);
      return [
        {
          code,
          country,
        },
      ];
    });
  }, [countries, comparisonIsos, comparisonPeriod.to]);
  const historyQuotes = Array.from(
    new Set([base, quote].filter((code) => !!code && code !== "USD")),
  ).sort();
  const countryPeriod = presetPeriod(today, range);
  const history = useAtlasRates(
    "?base=USD&quotes=" +
      (historyQuotes.join(",") || "EUR") +
      "&from=" +
      countryPeriod.from +
      "&to=" +
      countryPeriod.to,
    historyRetry,
  );
  const comparisonQuotes = Array.from(
    new Set(
      [quote, ...comparisonChoices.map((item) => item.code)].filter(
        (code) => code !== "USD",
      ),
    ),
  ).sort();
  const comparisonHistory = useAtlasRates(
    comparisonChoices.length
      ? "?base=USD&quotes=" +
          (comparisonQuotes.join(",") || "EUR") +
          "&from=" +
          comparisonPeriod.from +
          "&to=" +
          comparisonPeriod.to
      : undefined,
    comparisonRetry,
  );
  const points = compute(
    () =>
      base && selected
        ? pairSeries(history.rows, base, quote).filter(
            (point) => point.date >= currencyEpochStart(selected, date),
          )
        : [],
    [history.rows, base, quote, selected, date],
  );
  const converted = convertedAmount(amount, selectedRate);
  const amountInvalid =
    amount.trim() !== "" &&
    (!Number.isFinite(Number(amount)) ||
      Number(amount) < 0 ||
      Number(amount) > 1e12);
  const selectedRegime = selected ? regimeByIso[selected.iso] : undefined;
  const members = compute(
    () =>
      countries
        .filter((country) => currencyAt(country, date) === regionCurrency)
        .sort((a, b) => countryName(a).localeCompare(countryName(b), "zh-CN")),
    [countries, date, regionCurrency],
  );
  const filtered = countries
    .filter((country) =>
      (
        countryName(country) +
        " " +
        country.nameEn +
        " " +
        country.iso +
        " " +
        (currencyAt(country, date) || "") +
        " " +
        (currencyAt(country, date)
          ? currencyName(currencyAt(country, date))
          : "")
      )
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 8);
  afterRender(() => {
    const controller = new AbortController();
    setDataState("loading");
    void fetch(import.meta.env.BASE_URL + "data/countries.json", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("地图数据不可用");
        return response.json();
      })
      .then((collection) => {
        if (controller.signal.aborted) return;
        if (!collection.features?.length) throw new Error("地图数据为空");
        setData(collection);
        setDataState("ready");
        const initial =
          collection.features.find(
            (feature) => feature.properties.iso === "CHN",
          ) || collection.features[0];
        setSelected(
          (country) =>
            country || {
              ...initial.properties,
              id: initial.id,
            },
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setDataState("error");
      });
    return () => controller.abort();
  }, [dataRetry]);
  const choose = (country) => {
    setSelected(country);
    setQuery("");
    setSearchOpen(false);
    setSearchIndex(-1);
    const currency = currencyAt(country, date);
    if (mode === "regions" && currency) setRegionCurrency(currency);
  };
  const chooseMode = (next) => {
    setMode(next);
    setRegimeFilter(undefined);
    if (next !== "rates") setView("flat");
  };
  const comparisonBase = selected
    ? currencyAt(selected, comparisonPeriod.to)
    : null;
  const canAdd =
    !!selected &&
    !!comparisonBase &&
    comparisonChoices.length < 4 &&
    !comparisonChoices.some((item) => item.code === comparisonBase);
  return markup`<main id="atlas" tabindex=${ifDefined(-1)} ?hidden=${!visible} class="atlas-page atlas-expanded shell"><header class="atlas-heading"><div><h1>世界货币<span>汇率地图</span></h1></div><a href="#learn" class="atlas-course-link">课程读本${ArrowUpRight(
    {
      size: 16,
    },
  )}</a></header><nav class="atlas-modes" aria-label="地图图层">${renderContent(mapModes.map((item) => markup`<button type="button" aria-pressed=${ifDefined(mode === item.key)} @click=${() => chooseMode(item.key)}>${renderContent(item.label)}</button>`))}<span>${renderContent(mode === "regimes" ? "制度分类 · " + regimeSource.date : "最新参考价")}</span></nav><div class="atlas-workspace"><section class="atlas-map-column" aria-label="世界地图与图例"><div class="atlas-layer-controls">${renderContent(
    mode === "rates"
      ? markup`<div class="atlas-view-choice" role="group" aria-label="汇率地图着色"><button type="button" aria-pressed=${ifDefined(!changeMode)} @click=${() => setChangeMode(false)}>国家</button><button type="button" aria-pressed=${ifDefined(changeMode)} @click=${() => setChangeMode(true)}>30 日涨跌</button></div><span>相对${renderContent(currencyName(quote))}</span>`
      : mode === "regions"
        ? markup`<label class="atlas-region-select"><span>查看货币</span><select ${selectValue(regionCurrency)} @input=${(event) => setRegionCurrency(event.target.value)} aria-label="选择货币区域">${renderContent(Array.from(new Set([...regionCurrencies, regionCurrency])).map((code) => markup`<option value=${ifDefined(code)}>${renderContent(currencyName(code))} · ${renderContent(code)}</option>`))}</select>${ChevronDown(
            {
              size: 14,
            },
          )}</label><span>${renderContent(members.length)} 个国家或地区</span>`
        : markup`<span>按实际汇率安排分类</span><a href=${ifDefined(regimeSource.url)} target="_blank" rel="noreferrer">IMF · 2025 年 4 月${ArrowUpRight(
            {
              size: 13,
            },
          )}</a>`,
  )}</div>${renderContent(
    data
      ? AtlasMap({
          data: data,
          selected: selected,
          onSelect: choose,
          date: date,
          previousDate: previousDate,
          current: snapshot.values,
          previous: oldSnapshot.values,
          quote: quote,
          mode: mode,
          changeMode: changeMode,
          regionCurrency: regionCurrency,
          regimeFilter: regimeFilter,
          theme: theme,
          visible: visible,
          view: view,
          onView: () =>
            setView((value) => (value === "globe" ? "flat" : "globe")),
        })
      : markup`<div class="atlas-map-placeholder" role="status">${Globe2({
          size: 32,
        })}<p>${renderContent(dataState === "error" ? "地图数据暂时无法连接。" : "正在加载地图")}</p>${renderContent(
          dataState === "error" &&
            markup`<button type="button" class="text-button" @click=${() => setDataRetry((value) => value + 1)}>重新加载${RotateCcw(
              {
                size: 14,
              },
            )}</button>`,
        )}</div>`,
  )}<div class="atlas-layer-legend">${renderContent(
    mode === "rates" && changeMode
      ? markup`<span><i class="atlas-swatch up"></i>本币升值</span><span><i class="atlas-swatch stable"></i>±0.5% 内</span><span><i class="atlas-swatch down"></i>本币贬值</span><span><i class="atlas-swatch unknown"></i>暂无对比</span>`
      : mode === "regions"
        ? markup`<span><i class="atlas-swatch up"></i>使用${renderContent(currencyName(regionCurrency))}</span><span><i class="atlas-swatch unknown"></i>其他货币</span>`
        : mode === "regimes"
          ? Object.entries(regimeGroups).map(
              ([key, group]) =>
                markup`<button type="button" aria-pressed=${ifDefined(regimeFilter === key)} @click=${() => setRegimeFilter((value) => (value === key ? undefined : key))}><i class="atlas-swatch" style=${styles(
                  {
                    background: group[theme],
                  },
                )}></i>${renderContent(group.label)}</button>`,
            )
          : markup`<span class="atlas-drag-hint">${renderContent(view === "globe" ? "拖动旋转" : "拖动平移")} · 点击国家 · ＋ / − 缩放</span>`,
  )}${renderContent(mode === "regimes" && markup`<span><i class="atlas-swatch unknown"></i>暂无分类</span>`)}</div>${renderContent(mode === "rates" && changeMode && previous.status !== "ready" && markup`<p class="atlas-layer-note">${renderContent(previous.status === "loading" ? "正在读取 30 日前的参考价。" : "暂未取得对比日数据。")}${renderContent(previous.status === "error" && markup`<button class="text-button" @click=${() => setRetry((value) => value + 1)}>重试</button>`)}</p>`)}${renderContent(
    mode === "regions" &&
      markup`<details class="atlas-region-members"><summary>使用${renderContent(currencyName(regionCurrency))}的国家与地区${ChevronDown(
        {
          size: 14,
        },
      )}</summary><div>${renderContent(members.length ? members.map((country) => markup`<button type="button" aria-pressed=${ifDefined(selected?.iso === country.iso)} @click=${() => choose(country)}>${renderContent(countryName(country))}</button>`) : markup`<p>地图中暂未匹配到使用这一货币的地区。</p>`)}</div><p>显示当前主要流通货币；多币制国家不穷尽所有法定货币。</p></details>`,
  )}${renderContent(mode === "regimes" && markup`<p class="atlas-layer-note">${renderContent(regimeFilter ? regimeGroups[regimeFilter].description : "点击图例筛选；点选国家查看具体安排。")} 制度分类固定于资料日期。</p>`)}</section><aside class="country-panel atlas-country-panel" aria-label="所选国家的汇率"><div class="map-search">${Search(
    {
      size: 16,
    },
  )}<input role="combobox" aria-label="搜索国家或货币" aria-expanded=${ifDefined(searchOpen && !!query)} aria-controls="country-results" aria-autocomplete="list" aria-activedescendant=${ifDefined(searchOpen && searchIndex >= 0 ? "country-result-" + searchIndex : undefined)} placeholder="搜索国家或货币" .value=${live(query)} @focus=${() => setSearchOpen(true)} @blur=${() => setSearchOpen(false)} @input=${(
    event,
  ) => {
    setQuery(event.target.value);
    setSearchOpen(true);
    setSearchIndex(-1);
  }} @keydown=${(event) => {
    if (event.key === "Escape") setSearchOpen(false);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setSearchIndex((value) => Math.min(value + 1, filtered.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchIndex((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && query && filtered.length) {
      event.preventDefault();
      choose(filtered[Math.max(searchIndex, 0)]);
    }
  }}>${renderContent(
    query &&
      markup`<button type="button" aria-label="清除搜索" @click=${() => {
        setQuery("");
        setSearchOpen(false);
        setSearchIndex(-1);
      }}>${X({
        size: 15,
      })}</button>`,
  )}${renderContent(searchOpen && query && markup`<div class="search-results" id="country-results" role="listbox">${renderContent(filtered.length ? filtered.map((country, index) => markup`<button type="button" id=${ifDefined("country-result-" + index)} role="option" aria-selected=${ifDefined(index === searchIndex)} class=${ifDefined(index === searchIndex ? "highlighted" : "")} @mousedown=${(event) => event.preventDefault()} @click=${() => choose(country)}><span>${renderContent(countryName(country))}</span><small>${renderContent(currencyAt(country, date) || "暂无币种")}</small></button>`) : markup`<p>未找到对应国家或货币。</p>`)}</div>`)}</div><div class="country-name" aria-live="polite"><div><span>${renderContent(selected?.nameEn || "选择国家")}</span><h2 class=${ifDefined(selected && countryName(selected).length > 8 ? "long-country-name" : "")}>${renderContent(selected ? countryName(selected) : "选择一个国家")}</h2></div><span class="currency-code">${renderContent(base || "—")}</span></div>${renderContent(mode === "regimes" && markup`<div class="atlas-regime-detail"><span>实际汇率安排</span><strong>${renderContent(selectedRegime?.label || "暂无分类")}</strong><small>${renderContent(selectedRegime ? "资料日期 " + selectedRegime.date : "这一地区未列入本表。")}</small>${renderContent(selectedRegime && markup`<p>${renderContent(regimeGroups[selectedRegime.group].description)}</p>`)}</div>`)}<div class="atlas-quote-content" aria-busy=${ifDefined(latest.status === "loading")}>${renderContent(
    latest.status === "loading"
      ? markup`<div class="rate-loading" role="status"><span class="skeleton skeleton-number"></span><p>正在读取参考汇率</p></div>`
      : latest.status === "error"
        ? markup`<div class="rate-empty"><p>汇率服务暂时无法连接。</p><button type="button" class="text-button" @click=${() => setRetry((value) => value + 1)}>重新获取${RotateCcw(
            {
              size: 14,
            },
          )}</button></div>`
        : selectedRate !== undefined
          ? markup`<div class="rate-primary" aria-live="polite"><span>1 ${renderContent(currencyName(base))} 可兑换</span><div><strong>${renderContent(fmtRate(selectedRate))}</strong><small>${renderContent(quote)}</small></div></div><div class="rate-secondary"><span>反向报价 · 1 ${renderContent(quote)}</span><strong>${renderContent(fmtRate(1 / selectedRate))} ${renderContent(base)}</strong></div><div class="rate-change"><span>兑${renderContent(currencyName(quote))} · 近 30 日</span><strong class=${ifDefined(delta === undefined || Math.abs(delta) < 0.005 ? "" : delta > 0 ? "appreciation-text" : "depreciation-text")}>${renderContent(delta === undefined ? (unchangedCurrency ? "暂无对比" : "币制更替") : (delta > 0 ? "+" : "") + delta.toFixed(2) + "%")}${renderContent(
              delta !== undefined &&
                Math.abs(delta) >= 0.005 &&
                (delta > 0
                  ? ArrowUpRight({
                      size: 13,
                    })
                  : ArrowDownRight({
                      size: 13,
                    })),
            )}</strong></div>`
          : markup`<div class="rate-empty"><p>${renderContent(base ? "这一日期暂无该币种报价。" : "这一地区未匹配到主要流通货币。")}</p><small>可更换国家或目标币种。</small></div>`,
  )}</div><fieldset class="quote-currencies"><legend>兑换成</legend><div class="currency-options">${renderContent(quoteCurrencies.map((currency) => markup`<button type="button" aria-pressed=${ifDefined(quote === currency.code)} class=${ifDefined(quote === currency.code ? "selected" : "")} @click=${() => setQuote(currency.code)}><span>${renderContent(currency.name)}</span><small>${renderContent(currency.code)}</small></button>`))}</div></fieldset><div class="atlas-amount-conversion"><label for="atlas-amount">金额换算</label><div class="atlas-amount-input"><input id="atlas-amount" aria-label="本币金额" aria-invalid=${ifDefined(amountInvalid)} inputMode="decimal" type="number" min="0" max="1000000000000" step="any" .value=${live(amount)} @input=${(event) => setAmount(event.target.value)}><span>${renderContent(base || "—")}</span>${ArrowRight(
    {
      size: 14,
    },
  )}<output>${renderContent(converted === undefined ? "—" : fmtAmount(converted))}<small>${renderContent(quote)}</small></output></div>${renderContent(amountInvalid && markup`<small class="atlas-amount-error">请输入 0 至 1 万亿之间的金额。</small>`)}</div><div class="atlas-panel-chart"><div class="atlas-panel-chart-heading"><select aria-label="国家走势图范围" ${selectValue(range)} @input=${(event) => setRange(Number(event.target.value))}>${renderContent([30, 90, 365, 1826].map((value) => markup`<option value=${ifDefined(value)}>${renderContent(rangeLabels[value])}走势</option>`))}</select><small>${renderContent(quote)} / ${renderContent(base || "—")}</small></div>${renderContent(
    base === quote
      ? markup`<p class="atlas-chart-empty">同一种货币，兑换比例恒为 1。</p>`
      : history.status === "loading"
        ? markup`<div class="atlas-chart-loading skeleton" role="status" aria-label="正在读取历史走势"></div>`
        : history.status === "error"
          ? markup`<div class="atlas-chart-empty">历史数据暂不可用。<button type="button" class="text-button" @click=${() => setHistoryRetry((value) => value + 1)}>重试</button></div>`
          : keyed(
              base + quote + date + range,
              AtlasSparkline({
                points: points,
                base: base || "",
                quote: quote,
              }),
            ),
  )}</div><div class="atlas-reference-date">${renderContent(rateDate ? "参考日 " + rateDate : "每日参考汇率")}</div><details class="country-reading"><summary>相关课程${ChevronDown(
    {
      size: 13,
    },
  )}</summary>${renderContent(
    (relatedReadings[selected?.iso || ""] || defaultReadings).map(
      (item) =>
        markup`<a href=${ifDefined(lessonHref(item.id, item.section))}>${renderContent(item.title)}${ArrowUpRight(
          {
            size: 13,
          },
        )}</a>`,
    ),
  )}</details></aside></div>${CurrencyComparison({
    rows: comparisonHistory.rows,
    choices: comparisonChoices,
    quote: quote,
    date: comparisonPeriod.to,
    today: today,
    period: comparisonPeriod,
    range: comparisonRange,
    onRange: setComparisonRange,
    onCustomRange: (period) => {
      setCustomPeriod(period);
      setComparisonRange("custom");
    },
    onRemove: (code) =>
      setComparisonIsos((isos) =>
        isos.filter(
          (iso) =>
            !countries.some(
              (country) =>
                country.iso === iso &&
                currencyAt(country, comparisonPeriod.to) === code,
            ),
        ),
      ),
    onAdd: () => {
      if (canAdd && selected)
        setComparisonIsos((isos) => [...isos, selected.iso]);
    },
    canAdd: canAdd,
    status: comparisonHistory.status,
    onRetry: () => setComparisonRetry((value) => value + 1),
  })}<div class="atlas-data-footer"><span>Frankfurter · 每日参考价</span><details><summary>数据与口径${ChevronDown(
    {
      size: 13,
    },
  )}</summary><p>报价单位为“目标货币／本币”；数值上升表示本币相对目标货币升值。金额换算按参考汇率计算，不含交易费用。30 日变化按两个参考日的报价比较；不同币种的数据日期可能不同，未取得报价或发生币制更替时不计算涨跌。</p><p>货币区域显示当前主要流通货币，不穷尽多币制国家的全部法定货币。比较图采用所选结束日期的货币单位，只使用所选币种共同有数据的日期，并以同一日期为 100；不将不同货币单位接成同一条序列。部分币种的历史覆盖较短。</p><p>汇率制度采用 IMF 2025 年年报的实际安排分类，主要截至 2025 年 4 月 30 日。阿富汗、委内瑞拉资料日期为 2021 年 4 月 30 日，叙利亚为 2017 年 4 月 30 日。制度分类固定于资料日期。</p><div><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">汇率数据说明${ArrowUpRight(
    {
      size: 13,
    },
  )}</a><a href=${ifDefined(regimeSource.url)} target="_blank" rel="noreferrer">汇率制度来源${ArrowUpRight(
    {
      size: 13,
    },
  )}</a></div></details></div></main>`;
});
export default WorldAtlas;
