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
export const plotColor = (index) => `var(--figure-${index % 6})`;
const number = (value) =>
  Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
export const FigurePlot = view(function FigurePlot({
  title,
  series,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  xFormat = number,
  yFormat = number,
  marks = [],
  inspect = true,
  cursorX,
  onCursorChange,
}) {
  const root = keepRef(null);
  const [width, setWidth] = viewState(560);
  const [cursor, setCursor] = viewState(
    Math.floor(series[0].points.length / 2),
  );
  const id = uniqueId();
  afterRender(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, Math.round(entry.contentRect.width))),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const all = series.flatMap((s) => s.points);
  const xLo = xDomain?.[0] ?? Math.min(...all.map((p) => p.x));
  const xHi = xDomain?.[1] ?? Math.max(...all.map((p) => p.x));
  const min = Math.min(...all.map((p) => p.y)),
    max = Math.max(...all.map((p) => p.y));
  const pad = Math.max((max - min) * 0.1, 0.5);
  const yLo = yDomain?.[0] ?? min - pad,
    yHi = yDomain?.[1] ?? max + pad;
  const height = 270,
    left = width < 370 ? 46 : 52,
    right = width - 15,
    top = 35,
    bottom = 216;
  const px = (x) => left + ((x - xLo) / (xHi - xLo || 1)) * (right - left);
  const py = (y) => bottom - ((y - yLo) / (yHi - yLo || 1)) * (bottom - top);
  const nearest = (points, x) =>
    points.reduce((a, b) => (Math.abs(a.x - x) < Math.abs(b.x - x) ? a : b));
  const index =
    cursorX === undefined
      ? Math.min(cursor, series[0].points.length - 1)
      : series[0].points.indexOf(nearest(series[0].points, cursorX));
  const selected = series[0].points[index];
  const select = (next) => {
    setCursor(next);
    onCursorChange?.(series[0].points[next].x);
  };
  return markup`<div class="figure-plot" ${elementRef(root)}><svg viewBox=${ifDefined(`0 0 ${width} ${height}`)} role=${ifDefined(inspect ? "group" : "img")} aria-label=${ifDefined(title + (inspect ? "；左右方向键查看读数" : ""))} tabindex=${ifDefined(inspect ? 0 : undefined)} aria-describedby=${ifDefined(inspect ? id + "-readout" : undefined)} @keydown=${(
    event,
  ) => {
    if (
      !inspect ||
      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    select(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? series[0].points.length - 1
          : Math.max(
              0,
              Math.min(
                series[0].points.length - 1,
                index + (event.key === "ArrowRight" ? 1 : -1),
              ),
            ),
    );
  }} @pointermove=${(event) => {
    if (!inspect) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x =
      xLo +
      ((((event.clientX - box.left) * width) / box.width - left) /
        (right - left)) *
        (xHi - xLo);
    select(series[0].points.indexOf(nearest(series[0].points, x)));
  }} @pointerdown=${(event) => {
    if (inspect) {
      const box = event.currentTarget.getBoundingClientRect();
      const x =
        xLo +
        ((((event.clientX - box.left) * width) / box.width - left) /
          (right - left)) *
          (xHi - xLo);
      select(series[0].points.indexOf(nearest(series[0].points, x)));
    }
  }}><title>${renderContent(title)}</title><defs><clipPath id=${ifDefined(id + "-clip")}><rect x=${ifDefined(left)} y=${ifDefined(top - 2)} width=${ifDefined(right - left)} height=${ifDefined(bottom - top + 4)}></rect></clipPath></defs><text class="figure-axis-title" x=${ifDefined(left)} y="16">${renderContent(yLabel)}</text>${renderContent(
    [0, 1, 2, 3, 4].map((n) => {
      const y = yLo + ((yHi - yLo) * n) / 4;
      return svgMarkup`<g><line class="figure-grid" x1=${ifDefined(left)} y1=${ifDefined(py(y))} x2=${ifDefined(right)} y2=${ifDefined(py(y))}></line><text x=${ifDefined(left - 8)} y=${ifDefined(py(y) + 4)} text-anchor="end">${renderContent(yFormat(y))}</text></g>`;
    }),
  )}${renderContent(
    [0, 1, 2, 3, 4].map((n) => {
      const x = xLo + ((xHi - xLo) * n) / 4;
      return svgMarkup`<text x=${ifDefined(px(x))} y=${ifDefined(bottom + 22)} text-anchor=${ifDefined(n === 4 ? "end" : n === 0 ? "start" : "middle")}>${renderContent(xFormat(x))}</text>`;
    }),
  )}<text class="figure-axis-title" x=${ifDefined((left + right) / 2)} y="263" text-anchor="middle">${renderContent(xLabel)}</text><g clip-path=${ifDefined(`url(#${id}-clip)`)}>${renderContent(series.map((s, n) => svgMarkup`<polyline fill="none" stroke=${ifDefined(plotColor(s.color ?? n))} stroke-width="2.1" stroke-dasharray=${ifDefined(s.dashed ? "6 5" : undefined)} points=${ifDefined(s.points.map((p) => `${px(p.x)},${py(p.y)}`).join(" "))}></polyline>`))}${renderContent(
    inspect &&
      markup`<line class="figure-crosshair" x1=${ifDefined(px(selected.x))} x2=${ifDefined(px(selected.x))} y1=${ifDefined(top)} y2=${ifDefined(bottom)}></line>${renderContent(
        series.map((s, n) => {
          const point = n === 0 ? selected : nearest(s.points, selected.x);
          return svgMarkup`<circle cx=${ifDefined(px(point.x))} cy=${ifDefined(py(point.y))} r="3.5" fill=${ifDefined(plotColor(s.color ?? n))}></circle>`;
        }),
      )}`,
  )}</g>${renderContent(marks.map((mark, n) => svgMarkup`<g><circle cx=${ifDefined(px(mark.x))} cy=${ifDefined(py(mark.y))} r="4.5" class="figure-equilibrium"></circle><text class="figure-mark-label" x=${ifDefined(Math.max(left + 15, Math.min(right - 15, px(mark.x))))} y=${ifDefined(Math.max(top + 10, py(mark.y) + (n % 2 ? 19 : -12)))} text-anchor="middle">${renderContent(mark.label)}</text></g>`))}</svg><div class="figure-legend">${renderContent(
    series.map(
      (s, n) =>
        markup`<span><i style=${styles({
          background: plotColor(s.color ?? n),
          opacity: s.dashed ? 0.65 : 1,
        })}></i>${renderContent(s.name)}</span>`,
    ),
  )}</div>${renderContent(inspect && markup`<div class="figure-readout" id=${ifDefined(id + "-readout")} aria-live="polite"><strong>${renderContent(xFormat(selected.x))}</strong>${renderContent(series.map((s, n) => markup`<span>${renderContent(s.name)}<b>${renderContent(yFormat((n === 0 ? selected : nearest(s.points, selected.x)).y))}</b></span>`))}</div><div class="figure-pointer-hint">点按查看 · 方向键移动</div>`)}</div>`;
});
export const FigureBars = view(function FigureBars({
  data,
  selected,
  onSelect,
  domain,
  format = (n) => n.toFixed(1) + "%",
  label,
}) {
  const lo = domain?.[0] ?? Math.min(0, ...data.map((d) => d.value)),
    hi = domain?.[1] ?? Math.max(...data.map((d) => d.value)) * 1.08;
  const position = (n) => ((n - lo) / (hi - lo || 1)) * 100;
  return markup`<div class="figure-bars" role="group" aria-label=${ifDefined(label)}>${renderContent(
    data.map(
      (d, n) =>
        markup`<button class=${ifDefined("figure-bar-row" + (selected === d.name ? " selected" : ""))} aria-pressed=${ifDefined(selected === d.name)} @click=${() => onSelect(d.name)}><span>${renderContent(d.name)}</span><span class="figure-bar-track"><i class="figure-bar-zero" style=${styles(
          {
            left: position(0) + "%",
          },
        )}></i><i class="figure-bar-fill" style=${styles({
          "--bar-color": plotColor(d.value < 0 ? 2 : n % 3),
          left: position(Math.min(0, d.value)) + "%",
          width: (Math.abs(d.value) / (hi - lo || 1)) * 100 + "%",
        })}></i></span><strong>${renderContent(format(d.value))}</strong></button>`,
    ),
  )}</div>`;
});
export const FigureData = view(function FigureData({ headers, rows }) {
  return markup`<details class="figure-data"><summary>查看数据</summary><div class="figure-data-scroll" tabindex="0"><table><thead><tr>${renderContent(headers.map((h) => markup`<th scope="col">${renderContent(h)}</th>`))}</tr></thead><tbody>${renderContent(rows.map((row, i) => markup`<tr>${renderContent(row.map((value, j) => (j === 0 ? markup`<th scope="row">${renderContent(value)}</th>` : markup`<td>${renderContent(value)}</td>`)))}</tr>`))}</tbody></table></div></details>`;
});
