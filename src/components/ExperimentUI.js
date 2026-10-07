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
import { RotateCcw } from "../ui/icons.js";
export const money = (n, digits = 0) =>
  new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
export const decimal = (n, digits = 2) => n.toFixed(digits);
export const Slider = view(function Slider({
  label,
  amount,
  unit,
  min,
  max,
  step = 1,
  onChange,
}) {
  const digits = String(step).split(".")[1]?.length || 0;
  return markup`<label class="range-field"><span class="range-heading"><span>${renderContent(label)}</span><strong>${renderContent(decimal(amount, digits))}<small>${renderContent(unit)}</small></strong></span><input aria-label=${ifDefined(label)} type="range" min=${ifDefined(min)} max=${ifDefined(max)} step=${ifDefined(step)} .value=${live(amount)} @input=${(event) => onChange(Number(event.target.value))}><span class="range-limits"><span>${renderContent(min)}</span><span>${renderContent(max)}</span></span></label>`;
});
export const Reset = view(function Reset({ onClick }) {
  return markup`<button class="text-button reset" @click=${onClick}>${RotateCcw(
    {
      size: 14,
    },
  )}恢复初始值</button>`;
});
export const Tabs = view(function Tabs({ value, onChange, items, label }) {
  return markup`<div class="segmented calculator-tabs" aria-label=${ifDefined(label)}>${renderContent(items.map(([id, text]) => markup`<button class=${ifDefined(value === id ? "active" : "")} aria-pressed=${ifDefined(value === id)} @click=${() => onChange(id)}>${renderContent(text)}</button>`))}</div>`;
});
export const Result = view(function Result({
  label,
  result,
  unit = "",
  negative = false,
}) {
  return markup`<div class=${ifDefined("single-result" + (negative ? " negative-result" : ""))} aria-live="polite"><span>${renderContent(label)}</span><strong>${renderContent(result)}<small>${renderContent(unit)}</small></strong></div>`;
});
export const LinePlot = view(function LinePlot({
  points,
  reference,
  title,
  xLabel,
  yLabel,
  digits = 1,
}) {
  const xMin = points[0].x,
    xMax = points[points.length - 1].x;
  const values = points
    .map((point) => point.y)
    .concat(reference === undefined ? [] : [reference]);
  const minimum = Math.min(...values),
    maximum = Math.max(...values);
  const pad = Math.max(
    (maximum - minimum) * 0.15,
    Math.abs(maximum) * 0.012,
    0.05,
  );
  const lo = minimum - pad,
    hi = maximum + pad;
  const px = (x) => 47 + ((x - xMin) / (xMax - xMin || 1)) * 273;
  const py = (y) => 174 - ((y - lo) / (hi - lo)) * 141;
  return markup`<figure class="model-chart"><figcaption>${renderContent(title)}</figcaption><svg viewBox="0 0 340 218" role="img" aria-label=${ifDefined(title + "，起点 " + decimal(points[0].y, digits) + "，终点 " + decimal(points[points.length - 1].y, digits))}><title>${renderContent(title)}</title><text x="47" y="15">${renderContent(yLabel)}</text>${renderContent([lo, (lo + hi) / 2, hi].map((y) => svgMarkup`<g><line x1="47" y1=${ifDefined(py(y))} x2="320" y2=${ifDefined(py(y))} class="plot-grid"></line><text x="39" y=${ifDefined(py(y) + 4)} text-anchor="end">${renderContent(decimal(y, digits))}</text></g>`))}<line x1="47" y1="174" x2="320" y2="174" class="plot-axis"></line>${renderContent(reference !== undefined && svgMarkup`<line x1="47" y1=${ifDefined(py(reference))} x2="320" y2=${ifDefined(py(reference))} class="plot-reference"></line>`)}<polyline class="plot-line" points=${ifDefined(points.map((p) => px(p.x) + "," + py(p.y)).join(" "))}></polyline><circle class="plot-point" cx=${ifDefined(px(points[0].x))} cy=${ifDefined(py(points[0].y))} r="3"></circle><circle class="plot-point" cx=${ifDefined(px(points[points.length - 1].x))} cy=${ifDefined(py(points[points.length - 1].y))} r="3"></circle><text x="47" y="194" text-anchor="middle">${renderContent(xMin)}</text><text x="320" y="194" text-anchor="middle">${renderContent(xMax)}</text><text x="185" y="213" text-anchor="middle">${renderContent(xLabel)}</text></svg>${renderContent(reference !== undefined && markup`<p class="plot-key">实线为调整路径，虚线为比较基准。</p>`)}</figure>`;
});
