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
import katex from "katex";
import "katex/dist/katex.min.css";
const courseMath = {
  "CA + KA + EO = FA": String.raw`CA+KA+EO=FA`,
  "CA = S − I": "CA=S-I",
  "GDP → GNI → GNDI": String.raw`GDP\longrightarrow GNI\longrightarrow GNDI`,
  "期末 NIIP = 期初 NIIP + FA + 估值变化 + 其他调整": String.raw`NIIP_t=NIIP_{t-1}+FA_t+V_t+O_t`,
  "交叉汇率：CNY/EUR = (CNY/USD) × (USD/EUR)": String.raw`\frac{\mathrm{CNY}}{\mathrm{EUR}}=\frac{\mathrm{CNY}}{\mathrm{USD}}\times\frac{\mathrm{USD}}{\mathrm{EUR}}`,
  "q = E × P* / P": String.raw`q=\frac{EP^*}{P}`,
  "Pᵢ = E × Pᵢ*": String.raw`P_i=EP_i^*`,
  "E_PPP = P / P*；q = E × P* / P": String.raw`E_{PPP}=\frac{P}{P^*},\qquad q=\frac{EP^*}{P}`,
  "E₁/E₀ = (1 + π)/(1 + π*)": String.raw`\frac{E_1}{E_0}=\frac{1+\pi}{1+\pi^*}`,
  "E = (M/M*) × [L(i*,Y*)/L(i,Y)]": String.raw`E=\frac{M}{M^*}\frac{L(i^*,Y^*)}{L(i,Y)}`,
  "1 + iT = (1 + i*T) × Eᵉ(t+T) / Eₜ": String.raw`1+iT=(1+i^*T)\frac{E^e_{t+T}}{E_t}`,
  "rx* ≈ i* − i + (E₁−E₀)/E₀": String.raw`rx^*\approx i^*-i+\frac{E_1-E_0}{E_0}`,
  "F = E × (1 + iT)/(1 + i*T)": String.raw`F=E\frac{1+iT}{1+i^*T}`,
  "IS：Y = C(Y−T) + I(i) + G + NX(E,Y,Y*)": String.raw`\mathrm{IS}:\quad Y=C(Y-T)+I(i)+G+NX(E,Y,Y^*)`,
  "LM：M/P = L(i,Y)": String.raw`\mathrm{LM}:\quad \frac{M}{P}=L(i,Y)`,
  "FX：i ≈ i* + (Eᵉ−E)/E + ρ": String.raw`\mathrm{FX}:\quad i\approx i^*+\frac{E^e-E}{E}+\rho`,
  "dₜ = [(1+r)/(1+g)] dₜ₋₁ − pbₜ": String.raw`d_t=\frac{1+r}{1+g}d_{t-1}-pb_t`,
  "PV = Σₜ CFₜ/(1+k)ᵗ": String.raw`PV=\sum_t\frac{CF_t}{(1+k)^t}`,
  "套期后本币偿付额 = (本币本金/E) × (1+i*T) × F": String.raw`\text{本币偿付额}=\frac{\text{本币本金}}{E}(1+i^*T)F`,
  "储备净值 = 现金 + 储备证券市值；兑付义务 = 流通代币面值": String.raw`\begin{gathered}\text{储备净值}=\text{现金}+\text{储备证券市值}\\\text{兑付义务}=\text{流通代币面值}\end{gathered}`,
};
const MathExpression = view(function MathExpression({ expression }) {
  const html = compute(() => {
    const tex = courseMath[expression] ?? expression;
    try {
      return katex.renderToString(tex, {
        displayMode: true,
        throwOnError: true,
        strict: "ignore",
        trust: false,
        output: "htmlAndMathml",
      });
    } catch {
      return null;
    }
  }, [expression]);
  return html
    ? markup`<div class="math-expression">${unsafeHTML(
        {
          __html: html,
        }.__html,
      )}</div>`
    : markup`<div class="formula-expression">${renderContent(expression)}</div>`;
});
export default MathExpression;
