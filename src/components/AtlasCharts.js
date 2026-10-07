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
import { ArrowUpRight, Plus, X } from "../ui/icons.js";
import {
  countryName,
  currencyEpochStart,
  currencyName,
  fmtRate,
} from "../map-data.js";
import { normalizeComparison, nearestDateIndex } from "../lib/atlas-models.js";
export { rangeLabels } from "../lib/date-range.js";
import DateRangePicker from "./DateRangePicker.js";
function keyboardIndex(event, active, length) {
  let value;
  if (event.key === "ArrowRight") value = Math.min(active + 1, length - 1);
  if (event.key === "ArrowLeft") value = Math.max(active - 1, 0);
  if (event.key === "Home") value = 0;
  if (event.key === "End") value = length - 1;
  if (value !== undefined) event.preventDefault();
  return value;
}
function pointerIndex(event, dates, left, right, width) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * width;
  const fraction = Math.max(0, Math.min(1, (x - left) / (right - left)));
  const date = new Date(
    Date.parse(dates[0]) +
      fraction * (Date.parse(dates.at(-1)) - Date.parse(dates[0])),
  )
    .toISOString()
    .slice(0, 10);
  return nearestDateIndex(dates, date);
}
export const AtlasSparkline = view(function AtlasSparkline({
  points,
  base,
  quote,
}) {
  const [active, setActive] = viewState(null);
  if (points.length < 2)
    return markup`<p class="atlas-chart-empty">这一期间暂无足够的历史数据。</p>`;
  const dates = points.map((point) => point.date),
    index = Math.min(active ?? points.length - 1, points.length - 1),
    point = points[index];
  const values = points.map((point) => point.value),
    low = Math.min(...values),
    high = Math.max(...values),
    spread = high - low || Math.abs(high) * 0.01 || 1;
  const start = Date.parse(dates[0]),
    end = Date.parse(dates.at(-1));
  const x = (date) => 6 + ((Date.parse(date) - start) / (end - start)) * 288;
  const y = (value) => 91 - ((value - low) / spread) * 72;
  const shape = points.map((p) => x(p.date) + "," + y(p.value)).join(" ");
  return markup`<div class="atlas-sparkline chart-wrap"><div class="atlas-sparkline-reading"><time>${renderContent(point.date)}</time><strong>${renderContent(fmtRate(point.value))} <small>${renderContent(quote)}</small></strong></div><svg viewBox="0 0 300 105" role="slider" tabindex="0" aria-label=${ifDefined(`${base} 兑 ${quote} 走势图，左右方向键选择日期`)} aria-valuemin="0" aria-valuemax=${ifDefined(points.length - 1)} aria-valuenow=${ifDefined(index)} aria-valuetext=${ifDefined(point.date + "，1 " + base + "兑换 " + fmtRate(point.value) + " " + quote)} @pointerdown=${(event) => setActive(pointerIndex(event, dates, 6, 294, 300))} @pointermove=${(event) => setActive(pointerIndex(event, dates, 6, 294, 300))} @keydown=${(
    event,
  ) => {
    const value = keyboardIndex(event, index, points.length);
    if (value !== undefined) setActive(value);
  }}>${renderContent([19, 55, 91].map((height) => svgMarkup`<line class="chart-grid" x1="6" x2="294" y1=${ifDefined(height)} y2=${ifDefined(height)}></line>`))}<polyline class="chart-line" points=${ifDefined(shape)} fill="none" vector-effect="non-scaling-stroke"></polyline><line x1=${ifDefined(x(point.date))} x2=${ifDefined(x(point.date))} y1="10" y2="98" class="atlas-crosshair"></line><circle cx=${ifDefined(x(point.date))} cy=${ifDefined(y(point.value))} r="3" class="chart-dot"></circle></svg><div class="chart-dates"><time>${renderContent(dates[0])}</time><time>${renderContent(dates.at(-1))}</time></div></div>`;
});
const CurrencyComparison = view(function CurrencyComparison({
  rows,
  choices,
  quote,
  date,
  today,
  period,
  range,
  onRange,
  onCustomRange,
  onRemove,
  onAdd,
  canAdd,
  status,
  onRetry,
}) {
  const comparison = compute(
    () =>
      normalizeComparison(
        rows,
        choices.map((choice) => choice.code),
        quote,
        Object.fromEntries(
          choices.map((choice) => [
            choice.code,
            currencyEpochStart(choice.country, date),
          ]),
        ),
      ),
    [rows, choices, quote, date],
  );
  const [active, setActive] = viewState(null);
  afterRender(() => setActive(null), [rows, quote, choices]);
  const plotRef = keepRef(null),
    [compact, setCompact] = viewState(false);
  afterRender(() => {
    if (!plotRef.current) return;
    const observer = new ResizeObserver((entries) =>
      setCompact(entries[0].contentRect.width < 600),
    );
    observer.observe(plotRef.current);
    return () => observer.disconnect();
  }, []);
  const dates = comparison.series[0]?.points.map((point) => point.date) || [];
  const index = Math.max(
    0,
    Math.min(active ?? dates.length - 1, dates.length - 1),
  );
  const allValues = comparison.series.flatMap((item) =>
    item.points.map((point) => point.value),
  );
  const low = Math.min(100, ...allValues),
    high = Math.max(100, ...allValues),
    gap = high - low || 4;
  const min = Math.max(0, low - gap * 0.12),
    max = high + gap * 0.12;
  const tickPrecision = Math.max(
    0,
    Math.min(4, Math.ceil(-Math.log10((max - min) / 4))),
  );
  const width = compact ? 520 : 940,
    left = compact ? 45 : 62,
    right = width - (compact ? 14 : 28);
  const start = dates.length ? Date.parse(dates[0]) : 0,
    end = dates.length ? Date.parse(dates.at(-1)) : 1;
  const x = (date) =>
    left + ((Date.parse(date) - start) / (end - start || 1)) * (right - left);
  const y = (value) => 286 - ((value - min) / (max - min)) * 248;
  return markup`<section class="atlas-comparison" aria-labelledby="atlas-comparison-title"><div class="atlas-comparison-heading"><div><h2 id="atlas-comparison-title">货币走势比较</h2><p>统一兑${renderContent(currencyName(quote))}，共同起点为 100。</p></div>${DateRangePicker(
    {
      today,
      range,
      period,
      onRange,
      onCustomRange,
    },
  )}</div><div class="atlas-comparison-layout"><div class="atlas-comparison-list">${renderContent(
    choices.map((choice, i) => {
      const item = comparison.series.find((item) => item.code === choice.code),
        value = item?.points[index]?.value;
      const change = value === undefined ? undefined : value - 100;
      return markup`<div class=${ifDefined("comparison-currency currency-line-" + i)}><div class="comparison-currency-name"><i aria-hidden="true"></i><span>${renderContent(currencyName(choice.code))}<small>${renderContent(countryName(choice.country))} · ${renderContent(choice.code)}</small></span><button type="button" class="icon-button" aria-label=${ifDefined("移除" + currencyName(choice.code) + "的比较")} @click=${() => onRemove(choice.code)}>${X(
        {
          size: 15,
        },
      )}</button></div><div class="comparison-currency-reading"><strong>${renderContent(status !== "ready" || change === undefined ? "—" : (change > 0 ? "+" : "") + change.toFixed(2) + "%")}</strong>${renderContent(item?.raw[index] && status === "ready" && markup`<span>1 ${renderContent(choice.code)} = ${renderContent(fmtRate(item.raw[index].value))} ${renderContent(quote)}</span>`)}</div></div>`;
    }),
  )}<button type="button" class="comparison-add" ?disabled=${!canAdd} @click=${onAdd}>${Plus(
    {
      size: 16,
    },
  )}加入当前国家的货币</button><p class="comparison-help">可比较四种货币。点选地图上的国家后加入。</p></div><div class=${ifDefined("atlas-comparison-plot" + (compact ? " is-compact" : ""))} ${elementRef(plotRef)} aria-busy=${ifDefined(status === "loading")}>${renderContent(
    status === "loading"
      ? markup`<div class="atlas-series-loading skeleton" role="status">正在读取历史数据</div>`
      : status === "error"
        ? markup`<div class="atlas-series-empty"><p>历史数据暂时无法连接。</p><button class="text-button" @click=${onRetry}>重新读取${ArrowUpRight(
            {
              size: 14,
            },
          )}</button></div>`
        : dates.length < 2
          ? markup`<div class="atlas-series-empty"><p>${renderContent(choices.length ? "所选币种在这一期间没有足够的共同数据。" : "从地图选择国家，加入想比较的货币。")}</p></div>`
          : markup`<div class="comparison-observation"><time>${renderContent(dates[index])}</time></div><svg viewBox=${ifDefined("0 0 " + width + " 330")} role="slider" tabindex="0" aria-label="货币比较走势图，左右方向键选择日期" aria-valuemin="0" aria-valuemax=${ifDefined(dates.length - 1)} aria-valuenow=${ifDefined(index)} aria-valuetext=${ifDefined(dates[index] + "，" + comparison.series.map((item) => item.code + "指数" + item.points[index].value.toFixed(2)).join("，"))} @pointerdown=${(event) => setActive(pointerIndex(event, dates, left, right, width))} @pointermove=${(event) => setActive(pointerIndex(event, dates, left, right, width))} @keydown=${(
              event,
            ) => {
              const value = keyboardIndex(event, index, dates.length);
              if (value !== undefined) setActive(value);
            }}>${renderContent(
              Array.from(
                {
                  length: 5,
                },
                (_, i) => min + ((max - min) * i) / 4,
              ).map(
                (value) =>
                  svgMarkup`<g><line x1=${ifDefined(left)} x2=${ifDefined(right)} y1=${ifDefined(y(value))} y2=${ifDefined(y(value))} class="chart-grid"></line><text x=${ifDefined(left - 10)} y=${ifDefined(y(value) + 4)} text-anchor="end">${renderContent(
                    new Intl.NumberFormat("zh-CN", {
                      notation: value >= 1000 ? "compact" : "standard",
                      maximumFractionDigits: value >= 1000 ? 1 : tickPrecision,
                    }).format(value),
                  )}</text></g>`,
              ),
            )}<line x1=${ifDefined(left)} x2=${ifDefined(right)} y1=${ifDefined(y(100))} y2=${ifDefined(y(100))} class="atlas-baseline"></line>${renderContent(comparison.series.map((item, i) => svgMarkup`<g class=${ifDefined("currency-line-" + choices.findIndex((choice) => choice.code === item.code))}><polyline points=${ifDefined(item.points.map((point) => x(point.date) + "," + y(point.value)).join(" "))} fill="none" vector-effect="non-scaling-stroke" class="comparison-line" stroke-dasharray=${ifDefined(i === 3 ? "4 3" : undefined)}></polyline><circle cx=${ifDefined(x(item.points[index].date))} cy=${ifDefined(y(item.points[index].value))} r="4" class="comparison-dot"></circle></g>`))}<line x1=${ifDefined(x(dates[index]))} x2=${ifDefined(x(dates[index]))} y1="26" y2="286" class="atlas-crosshair"></line><text x=${ifDefined(left)} y="318">${renderContent(dates[0])}</text><text x=${ifDefined(right)} y="318" text-anchor="end">${renderContent(dates.at(-1))}</text></svg>`,
  )}${renderContent(status === "ready" && comparison.missing.length > 0 && markup`<p class="comparison-missing">缺少共同历史数据：${renderContent(comparison.missing.map(currencyName).join("、"))}。</p>`)}</div></div></section>`;
});
export default CurrencyComparison;
