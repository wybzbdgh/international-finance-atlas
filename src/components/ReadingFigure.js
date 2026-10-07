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
  figureTitles,
  weightMetrics,
  fxYears,
  fxShares,
  bigMac,
  equityShares,
  cipsHistory,
} from "../figures-data.js";
import {
  foreignReturn,
  policyEquilibrium,
  relativePppPath,
  riskSharing,
  sample,
  trancheLoss,
  uipSpot,
} from "../lib/figure-models.js";
import { debtPath, exportHedge } from "../lib/models.js";
import { moneyAdjustment } from "../lib/extended-figure-models.js";
import { FigureBars, FigureData, FigurePlot } from "./FigureCharts.js";
import { Slider, Tabs, Reset } from "./ExperimentUI.js";
import {
  BalassaSamuelson,
  CipCashflow,
  CurrencyMismatch,
  IipValuation,
  IntertemporalChoice,
  JCurve,
  MoneyAdjustment,
  PolicyCapitalMobility,
  RepoLiquidity,
  SpecieFlow,
} from "./ExtendedFigures.js";
import "../figure-updates.css";
const fixed = (n, digits = 2) => n.toFixed(digits);
const signed = (n, digits = 1) => (n > 0 ? "+" : "") + n.toFixed(digits);
const year = (n) => n.toFixed(0);
const Note = view(function Note({ children }) {
  return markup`<details class="figure-method"><summary>数据与口径</summary><div><p>${renderContent(children)}</p></div></details>`;
});
const Insight = view(function Insight({ children }) {
  return markup`<div class="figure-insight" aria-live="polite">${renderContent(children)}</div>`;
});
const CurrencyWeight = view(function CurrencyWeight() {
  const [metric, setMetric] = viewState("0"),
    [selected, setSelected] = viewState("中国 / 人民币");
  const item = weightMetrics[Number(metric)];
  const data = ["中国 / 人民币", "美国 / 美元", "欧元区 / 欧元"].map(
    (name, n) => ({
      name,
      value: item.values[n],
    }),
  );
  return markup`${Tabs({
    value: metric,
    onChange: setMetric,
    items: weightMetrics.map((m, n) => [String(n), m.label]),
    label: "比较指标",
  })}<div class="figure-period">${renderContent(item.unit)} · ${renderContent(item.year)}</div>${FigureBars(
    {
      data: data,
      selected: selected,
      onSelect: setSelected,
      domain: [0, 65],
      label: item.unit,
    },
  )}${FigureData({
    headers: ["指标", "中国 / 人民币", "美国 / 美元", "欧元区 / 欧元"],
    rows: weightMetrics.map((m) => [
      m.label,
      ...m.values.map((v) => v.toFixed(1) + "%"),
    ]),
  })}${Note({
    children: markup`${renderContent(item.note)} 沿用讲义图中标注值。GDP 与货物贸易：World Bank WDI；储备：IMF COFER；支付：Swift。各指标分母不同。`,
  })}`;
});
const AccountBridge = view(function AccountBridge() {
  const [nx, setNx] = viewState(20),
    [pi, setPi] = viewState(-5),
    [si, setSi] = viewState(3),
    [stage, setStage] = viewState(3);
  const values = [100, 100 + nx, 100 + nx + pi, 100 + nx + pi + si];
  const names = ["GNE", "GDP", "GNI", "GNDI"];
  const labels = [
    "国内总支出",
    "国内生产总值",
    "国民总收入",
    "国民可支配总收入",
  ];
  const descriptions = [
    "C + I + G：本国消费、投资和政府购买之和。",
    `在国内总支出基础上，加上货物与服务净出口 ${signed(nx)}。`,
    `在国内生产总值基础上，加上初次收入净额 ${signed(pi)}。`,
    `在国民总收入基础上，加上二次收入净额 ${signed(si)}。`,
  ];
  return markup`<div class="account-column-chart" role="group" aria-label="国民账户的四级总量">${renderContent(
    names.map(
      (name, n) =>
        markup`<button class=${ifDefined(stage === n ? "selected" : "")} aria-pressed=${ifDefined(stage === n)} @click=${() => setStage(n)}><strong>${renderContent(values[n])}</strong><span class="account-column-space"><i style=${styles(
          {
            height: (values[n] / 165) * 100 + "%",
          },
        )}></i></span><b>${renderContent(name)}</b><small>${renderContent(labels[n])}</small></button>`,
    ),
  )}</div>${Insight({
    children: markup`<strong>${renderContent(names[stage])} = ${renderContent(values[stage])}</strong><p>${renderContent(descriptions[stage])}</p><p>经常账户差额 CA = GNDI − GNE = ${renderContent(signed(nx + pi + si))}。资本账户与净误差遗漏取零时，金融账户净贷出 FA 与之相等。</p>`,
  })}<div class="figure-controls">${Slider({
    label: "货物与服务净出口",
    amount: nx,
    min: -30,
    max: 30,
    onChange: setNx,
  })}${Slider({
    label: "初次收入净额",
    amount: pi,
    min: -20,
    max: 20,
    onChange: setPi,
  })}${Slider({
    label: "二次收入净额",
    amount: si,
    min: -15,
    max: 15,
    onChange: setSi,
  })}</div>${Reset({
    onClick: () => {
      setNx(20);
      setPi(-5);
      setSi(3);
      setStage(3);
    },
  })}${Note({
    children: markup`根据讲义的国民账户衔接图绘制。国内总支出设为 100，其余数值为教学参数；四个总量不能相加。`,
  })}`;
});
const FxTurnover = view(function FxTurnover() {
  const [visible, setVisible] = viewState([
    "欧元",
    "日元",
    "英镑",
    "人民币",
    "瑞士法郎",
  ]);
  const series = fxShares
    .filter((s) => visible.includes(s.name))
    .map((s) => ({
      name: s.name,
      color: fxShares.indexOf(s),
      points: s.values.map((y, i) => ({
        x: fxYears[i],
        y,
      })),
    }));
  return markup`<div class="figure-series-controls" aria-label="显示币种">${renderContent(
    fxShares.map(
      (s, n) =>
        markup`<button aria-pressed=${ifDefined(visible.includes(s.name))} ?disabled=${visible.length === 1 && visible.includes(s.name)} @click=${() => setVisible(visible.includes(s.name) ? visible.filter((v) => v !== s.name) : [...visible, s.name])}><i style=${styles(
          {
            background: `var(--figure-${n})`,
          },
        )}></i>${renderContent(s.name)}</button>`,
    ),
  )}</div>${FigurePlot({
    title: "历届 BIS 调查中的外汇成交份额",
    series: series,
    xLabel: "调查年份",
    yLabel: "占全球成交的份额（%）",
    xFormat: year,
    yDomain: [0, visible.includes("美元") ? 100 : 40],
  })}${Insight({
    children: markup`<p>每笔交易涉及两种货币，全部币种份额合计为 200%。人民币交易份额增加，可以与美元的媒介货币地位同时存在。</p>`,
  })}${FigureData({
    headers: ["货币", ...fxYears.map(String)],
    rows: fxShares.map((s) => [
      s.name,
      ...s.values.map((v) => v.toFixed(1) + "%"),
    ]),
  })}${Note({
    children: markup`BIS 历届调查，2013—2025 年；沿用讲义表中数值，2025 年采用最终修订值。折线只连接各次调查观测。`,
  })}`;
});
const BigMac = view(function BigMac() {
  const [selected, setSelected] = viewState("中国"),
    [mode, setMode] = viewState("gap");
  const data = bigMac.map((d) => ({
    ...d,
    value: mode === "gap" ? d.value : 100 + d.value,
  }));
  return markup`${Tabs({
    value: mode,
    onChange: setMode,
    items: [
      ["gap", "相对价差"],
      ["price", "美国价格 = 100"],
    ],
    label: "价格表示方式",
  })}<div class="figure-period">2026 年 1 月 · 按市场汇率折算</div>${FigureBars(
    {
      data: data,
      selected: selected,
      onSelect: setSelected,
      domain: mode === "gap" ? [-65, 55] : [0, 155],
      format: (n) => (mode === "gap" ? signed(n, 0) + "%" : fixed(n, 0)),
      label: "各地巨无霸价格",
    },
  )}${Note({
    children: markup`The Economist 开源数据，沿用讲义图中四舍五入至整数的价差。价格指数由这些约数换算，不是对汇率应当升贬多少的预测。`,
  })}`;
});
const RelativePpp = view(function RelativePpp() {
  const [home, setHome] = viewState(6),
    [foreign, setForeign] = viewState(2);
  const path = relativePppPath(home, foreign);
  return markup`${FigurePlot({
    title: "相对购买力平价的累计路径",
    series: [
      {
        name: "相对 PPP 基准",
        points: path,
      },
      {
        name: "初始汇率",
        points: sample(0, 10, () => 7, 11),
        dashed: true,
        color: 4,
      },
    ],
    xLabel: "年数",
    yLabel: "汇率 E（本币 / 外币）",
    xFormat: year,
  })}<div class="figure-controls">${Slider({
    label: "本国年通胀率",
    amount: home,
    min: -2,
    max: 15,
    step: 0.5,
    unit: "%",
    onChange: setHome,
  })}${Slider({
    label: "外国年通胀率",
    amount: foreign,
    min: -2,
    max: 15,
    step: 0.5,
    unit: "%",
    onChange: setForeign,
  })}</div>${Insight({
    children: markup`<strong>十年后基准汇率：${renderContent(fixed(path[10].y))}</strong><p>Eₜ = E₀ × [(1 + π) / (1 + π*)]ᵗ。持续的通胀差会累积，汇率上升表示本币贬值。</p>`,
  })}${Reset({
    onClick: () => {
      setHome(6);
      setForeign(2);
    },
  })}${Note({
    children: markup`按讲义相对购买力平价公式绘制，初始汇率设为 7。通胀率固定、相对价格关系不变；这是一条理论基准路径。`,
  })}`;
});
const UipFigure = view(function UipFigure() {
  const [home, setHome] = viewState(2),
    [foreign, setForeign] = viewState(5),
    [expected, setExpected] = viewState(7.2);
  const spot = uipSpot(home, foreign, expected);
  return markup`${FigurePlot({
    title: "本外币存款预期收益的交点",
    series: [
      {
        name: "外币存款预期收益",
        points: sample(5.5, 9, (x) => foreignReturn(x, foreign, expected)),
      },
      {
        name: "本币存款收益",
        points: sample(5.5, 9, () => home),
        color: 2,
      },
    ],
    xDomain: [5.5, 9],
    yDomain: [-15, 25],
    xLabel: "即期汇率 E（本币 / 外币）",
    yLabel: "本币计价预期收益率（%）",
    marks: [
      {
        x: spot,
        y: home,
        label: "均衡",
      },
    ],
  })}<div class="figure-controls">${Slider({
    label: "本币存款利率",
    amount: home,
    min: 0,
    max: 10,
    step: 0.25,
    unit: "%",
    onChange: setHome,
  })}${Slider({
    label: "外币存款利率",
    amount: foreign,
    min: 0,
    max: 10,
    step: 0.25,
    unit: "%",
    onChange: setForeign,
  })}${Slider({
    label: "一年后预期汇率",
    amount: expected,
    min: 6.5,
    max: 8,
    step: 0.05,
    onChange: setExpected,
  })}</div>${Insight({
    children: markup`<strong>均衡即期汇率 E = ${renderContent(fixed(spot, 4))}</strong><p>本币利率变化移动水平线；外国利率或预期汇率变化移动外币预期收益曲线。两条线相交时，两种存款的预期收益相等。</p>`,
  })}${Reset({
    onClick: () => {
      setHome(2);
      setForeign(5);
      setExpected(7.2);
    },
  })}${Note({
    children: markup`按讲义的外汇市场均衡图及例题绘制。假定风险中性、资产完全可替代、资本自由流动；预期汇率不等于未来实际汇率。`,
  })}`;
});
const Overshooting = view(function Overshooting() {
  const [shock, setShock] = viewState(10),
    [speed, setSpeed] = viewState(0.6),
    [mode, setMode] = viewState("sticky");
  const flexible = mode === "flexible";
  const terminal = 7 * (1 + shock / 100);
  const impact = moneyAdjustment(shock, speed, 2, 0, flexible).exchange;
  const points = [
    {
      x: -1,
      y: 7,
    },
    {
      x: 0,
      y: 7,
    },
    ...sample(
      0,
      12,
      (x) => moneyAdjustment(shock, speed, 2, x, flexible).exchange,
      49,
    ),
  ];
  return markup`${Tabs({
    value: mode,
    onChange: setMode,
    items: [
      ["sticky", "价格逐步调整"],
      ["flexible", "价格立即调整"],
    ],
    label: "价格调整方式",
  })}${FigurePlot({
    title: "永久货币扩张后的汇率调整",
    series: [
      {
        name: "即期汇率",
        points,
      },
      {
        name: "长期水平",
        points: sample(-1, 12, () => terminal),
        color: 1,
        dashed: true,
      },
      {
        name: "冲击前水平",
        points: sample(-1, 12, () => 7),
        color: 4,
        dashed: true,
      },
    ],
    xDomain: [-1, 12],
    xLabel: "年数（0 为冲击时点）",
    yLabel: "汇率 E（本币 / 外币）",
    xFormat: (n) => (n < 0 ? "冲击前" : fixed(n, 0)),
  })}<div class="figure-controls">${Slider({
    label: "永久货币扩张幅度",
    amount: shock,
    min: 0,
    max: 20,
    unit: "%",
    onChange: setShock,
  })}${renderContent(
    !flexible &&
      Slider({
        label: "价格调整速度 θ",
        amount: speed,
        min: 0.2,
        max: 1.2,
        step: 0.1,
        onChange: setSpeed,
      }),
  )}</div>${Insight({
    children: markup`<strong>冲击时 ${renderContent(fixed(impact, 3))} → 长期 ${renderContent(fixed(terminal, 3))}</strong><p>${renderContent(flexible ? "物价立即调整时，汇率直接达到长期水平。" : "物价逐步调整时，即期汇率先超过长期水平，随后回落。提高价格调整速度，可比较超调幅度的变化。")}</p>`,
  })}${Reset({
    onClick: () => {
      setShock(10);
      setSpeed(0.6);
      setMode("sticky");
    },
  })}${Note({
    children: markup`简化联动模型：价格按 dp/dt = θ(m−p) 调整，货币需求满足 m−p = −λ(i−i*)，UIP 要求 de/dt = i−i*。m、p、e 为相对初始水平的对数变化，λ 取 2；长期 e=p=m。稳定路径 e=m+[m/(λθ)]exp(−θt)，即时反应由方程决定。产出和外国利率不变，参数为教学设定。`,
  })}`;
});
const PolicyMarkets = view(function PolicyMarkets() {
  const [regime, setRegime] = viewState("float"),
    [instrument, setInstrument] = viewState("money"),
    [strength, setStrength] = viewState(10),
    [stage, setStage] = viewState("2");
  const q = policyEquilibrium(regime, instrument, strength, Number(stage));
  const baseline = sample(70, 145, (y) => 4 + (100 - y) / q.isSlope);
  const text =
    regime === "float"
      ? instrument === "money"
        ? "货币扩张使 LM 右移，利率下降、本币贬值；投资与净出口共同推动产出增加。"
        : "财政扩张使 IS 右移。利率上升与本币升值挤出部分投资和净出口，削弱产出增量。"
      : stage === "1"
        ? instrument === "money"
          ? "国内货币扩张使利率暂时下降，出现资本外流和贬值压力。这里尚未加入央行维持汇率的干预。"
          : "财政扩张使产出和利率上升，出现资本流入与升值压力。央行随后买入外汇、投放本币。"
        : instrument === "money"
          ? "为维持固定汇率，央行售汇回笼本币，货币供给回到原位。利率、产出与汇率恢复初始水平。"
          : "央行买入外汇并被动扩张货币供给，LM 右移。最终产出提高，利率回到原位。";
  return markup`${Tabs({
    value: regime,
    onChange: (v) => {
      setRegime(v);
      setStage("2");
    },
    items: [
      ["float", "浮动汇率"],
      ["fixed", "固定汇率"],
    ],
    label: "汇率制度",
  })}${Tabs({
    value: instrument,
    onChange: (v) => {
      setInstrument(v);
      setStage("2");
    },
    items: [
      ["money", "货币扩张"],
      ["fiscal", "财政扩张"],
    ],
    label: "政策工具",
  })}${renderContent(
    regime === "fixed" &&
      Tabs({
        value: stage,
        onChange: setStage,
        items: [
          ["0", "初始均衡"],
          ["1", "干预前"],
          ["2", "干预后"],
        ],
        label: "政策传导阶段",
      }),
  )}${FigurePlot({
    title: "商品与货币市场",
    series: [
      {
        name: "初始 IS",
        points: baseline,
        color: 4,
        dashed: true,
      },
      {
        name: "初始 LM",
        points: sample(70, 145, (y) => 4 + 0.12 * (y - 100)),
        color: 5,
        dashed: true,
      },
      {
        name: "当前 IS",
        points: sample(70, 145, (y) => 4 + (100 + q.fiscal - y) / q.isSlope),
        color: 0,
      },
      {
        name: "当前 LM",
        points: sample(70, 145, (y) => 4 + 0.12 * (y - 100) - q.money),
        color: 1,
      },
    ],
    xLabel: "产出 Y",
    yLabel: "利率 i（%）",
    yDomain: [-1, 10],
    marks: [
      {
        x: 100,
        y: 4,
        label: "初始",
      },
      {
        x: q.output,
        y: q.rate,
        label: "当前",
      },
    ],
    inspect: false,
  })}${FigurePlot({
    title: "外汇市场",
    series: [
      {
        name: "外币预期收益",
        points: sample(5.75, 8.25, (e) => 4 - 4 * (e - 7)),
      },
      {
        name: "本币利率",
        points: sample(5.75, 8.25, () => q.rate),
        color: 1,
      },
    ],
    xLabel: "汇率 E（上升为本币贬值）",
    yLabel: "预期收益率（%）",
    yDomain: [-1, 10],
    marks: [
      {
        x: q.pressureSpot,
        y: q.rate,
        label: regime === "fixed" && stage === "1" ? "压力方向" : "均衡",
      },
    ],
    inspect: false,
  })}${Slider({
    label: "扩张力度",
    amount: strength,
    min: 0,
    max: 20,
    onChange: setStrength,
  })}${Insight({
    children: markup`<strong>Y = ${renderContent(fixed(q.output, 1))} · i = ${renderContent(fixed(q.rate))}% · E = ${renderContent(fixed(q.spot, 3))}</strong><p>${renderContent(stage === "0" ? "初始均衡：产出 100，利率 4%，汇率 7。" : text)}</p>${renderContent(regime === "fixed" && stage === "1" && markup`<p>外汇图的交点表示没有干预时的隐含汇率；公布的固定汇率仍为 7。</p>`)}`,
  })}${Reset({
    onClick: () => {
      setRegime("float");
      setInstrument("money");
      setStrength(10);
      setStage("2");
    },
  })}<details class="figure-data"><summary>模型条件与方程</summary><p>Y = 100 + F − 3(i − 4) + 8(E − 7)；LM：i = 4 + 0.12(Y − 100) − M；UIP 的局部线性近似：i = 4 − 4(E − 7)。财政扩张力度为 F，货币扩张时 M 为力度的十分之一。浮动汇率图中的 IS 已代入汇率对净出口的反馈。固定汇率干预完成后 E = 7、i = 4，M 随之调整。</p></details>${Note(
    {
      children: markup`根据讲义四种政策情形绘制，系数为教学参数。假定价格黏性、预期与风险溢价稳定；固定汇率承诺可信。`,
    },
  )}`;
});
const SharingFigure = view(function SharingFigure() {
  const [weight, setWeight] = viewState(50);
  const result = riskSharing(weight / 100);
  const names = ["两国丰收", "本国丰收", "外国丰收", "两国歉收"];
  const [selected, setSelected] = viewState("本国丰收");
  return markup`${FigureBars({
    data: names.map((name, i) => ({
      name,
      value: result.consumption[i],
    })),
    selected: selected,
    onSelect: setSelected,
    domain: [0, 125],
    format: (n) => fixed(n, 0),
    label: "四种状态下的本国消费",
  })}${Slider({
    label: "持有外国资产的比例",
    amount: weight,
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    onChange: setWeight,
  })}${Insight({
    children: markup`<strong>消费方差 ${renderContent(fixed(result.variance, 0))}；自留本国资产时为 400</strong><p>${renderContent(selected)}时，本国消费为 ${renderContent(fixed(result.consumption[names.indexOf(selected)], 0))}。分散化可以减少特异性风险，两国同时歉收的共同风险仍然存在。</p>`,
  })}${Note({
    children: markup`讲义“两国交换产出索取权”的例子：丰年产出 120、歉年 80，四种状态等概率。横向长度表示消费水平。`,
  })}`;
});
const Securitization = view(function Securitization() {
  const [step, setStep] = viewState(0),
    [loss, setLoss] = viewState(12);
  const stages = [
    ["购房家庭", "借入房贷，未来还本付息。"],
    [
      "贷款发起机构",
      "发放贷款后出售打包，把持有到期的部分风险转给证券购买者。",
    ],
    ["MBS", "以房贷现金流为基础发行证券，按约定顺序分配现金流和损失。"],
    ["CDO 分层", "再证券化使投资者更难追踪多层证券与底层房贷之间的关系。"],
    [
      "影子银行持有者",
      "投资载体、交易商和欧洲银行等持有证券，并使用回购、ABCP 等短期批发融资。",
    ],
    [
      "货币市场基金",
      "提供短期资金。抵押品折扣率上调、融资不再续作时，持有者被迫寻找现金或出售资产。",
    ],
  ];
  const tranches = trancheLoss(loss);
  return markup`<div class="figure-flow" role="group" aria-label="证券化链条">${renderContent(stages.map(([name], n) => markup`<button class=${ifDefined(step === n ? "selected" : "")} @click=${() => setStep(n)} aria-pressed=${ifDefined(step === n)}><small>${renderContent(n < 4 ? "资产转移" : n === 4 ? "证券持有与抵押融资" : "短期资金供给")}</small><strong>${renderContent(name)}</strong>${renderContent(n < 4 ? markup`<span aria-hidden="true">${renderContent(n === 1 || n === 3 ? "↓" : "→")}</span>` : n === 4 ? markup`<span aria-hidden="true">←</span>` : null)}</button>`))}</div>${Insight(
    {
      children: markup`<strong>${renderContent(stages[step][0])}</strong><p>${renderContent(stages[step][1])}</p>`,
    },
  )}<div class="tranche-chart" aria-label="各层本金及损失">${renderContent(
    tranches.map(
      (t) =>
        markup`<div><span>${renderContent(t.name)}<small>本金 ${renderContent(t.face)} 亿元</small></span><div><i style=${styles(
          {
            width: (t.remaining / t.face) * 100 + "%",
          },
        )}></i><em style=${styles({
          width: (t.loss / t.face) * 100 + "%",
        })}></em></div><strong>${renderContent(t.remaining)}<small>剩余</small></strong></div>`,
    ),
  )}</div>${Slider({
    label: "资产池总损失",
    amount: loss,
    min: 0,
    max: 100,
    unit: "亿元",
    onChange: setLoss,
  })}${Insight({
    children: markup`<p>劣后层先承担 ${renderContent(tranches[2].loss)} 亿元，夹层承担 ${renderContent(tranches[1].loss)} 亿元，优先层承担 ${renderContent(tranches[0].loss)} 亿元。分层改变了损失的承担顺序，却没有消除资产池的总损失。</p>`,
  })}${Note({
    children: markup`依据讲义证券化链条及 100 亿元房贷资产池的例子。优先层、夹层、劣后层本金分别为 80、15、5 亿元；红色表示损失。融资从货币市场基金流向持有者，评级与 CDS 支持未在此简图展开。`,
  })}`;
});
const DebtFigure = view(function DebtFigure() {
  const [rate, setRate] = viewState(5),
    [growth, setGrowth] = viewState(3),
    [surplus, setSurplus] = viewState(1);
  const points = debtPath(80, rate / 100, growth / 100, surplus, 15);
  const required = ((rate - growth) / (100 + growth)) * 80;
  return markup`${FigurePlot({
    title: "十五年的政府债务率路径",
    series: [
      {
        name: "债务 / GDP",
        points,
      },
      {
        name: "初始债务率",
        points: sample(0, 15, () => 80, 16),
        color: 4,
        dashed: true,
      },
    ],
    xLabel: "年数",
    yLabel: "债务占 GDP 的比重（%）",
    xFormat: year,
  })}<div class="figure-controls">${Slider({
    label: "实际利率 r",
    amount: rate,
    min: 0,
    max: 10,
    step: 0.5,
    unit: "%",
    onChange: setRate,
  })}${Slider({
    label: "实际增长率 g",
    amount: growth,
    min: -3,
    max: 8,
    step: 0.5,
    unit: "%",
    onChange: setGrowth,
  })}${Slider({
    label: "基本财政盈余 / GDP",
    amount: surplus,
    min: -5,
    max: 5,
    step: 0.25,
    unit: "%",
    onChange: setSurplus,
  })}</div>${Insight({
    children: markup`<strong>第十五年债务率 ${renderContent(fixed(points[15].y, 1))}%</strong><p>维持初始 80% 债务率所需的基本财政余额约为 GDP 的 ${renderContent(fixed(required))}%。基本财政余额不含利息支出，正值为盈余，负值为赤字。</p>`,
  })}${Reset({
    onClick: () => {
      setRate(5);
      setGrowth(3);
      setSurplus(1);
    },
  })}${Note({
    children: markup`按讲义债务动态公式绘制：dₜ = [(1 + r) / (1 + g)]dₜ₋₁ − pbₜ。各参数固定，债务下限设为零，未计入汇率和增长反馈；曲线本身不能判定违约。`,
  })}`;
});
const EquityMarkets = view(function EquityMarkets() {
  const [selected, setSelected] = viewState("中国内地"),
    [mode, setMode] = viewState("share");
  return markup`${Tabs({
    value: mode,
    onChange: setMode,
    items: [
      ["share", "全球份额"],
      ["amount", "市值金额"],
    ],
    label: "市值表示方式",
  })}<div class="figure-period">2024 年末 · 全球股票市值 126.7 万亿美元</div>${FigureBars(
    {
      data: equityShares.map((d) => ({
        ...d,
        value: mode === "share" ? d.value : (126.7 * d.value) / 100,
      })),
      selected: selected,
      onSelect: setSelected,
      format: (n) => fixed(n, 1) + (mode === "share" ? "%" : ""),
      label: mode === "share" ? "全球股票市值份额" : "市值，万亿美元",
    },
  )}${Note({
    children: markup`SIFMA《2025 年资本市场概况》，沿用讲义图中份额。金额按已四舍五入的份额换算，属于约数；各项份额可能因舍入略有误差。`,
  })}`;
});
const HedgeFigure = view(function HedgeFigure() {
  const [ratio, setRatio] = viewState(100),
    [forward, setForward] = viewState(7),
    [premium, setPremium] = viewState(0.12);
  const series = [
    {
      name: "未对冲",
      points: sample(5.5, 8.5, (x) => x * 100),
      color: 4,
      dashed: true,
    },
    {
      name: "远期",
      points: sample(5.5, 8.5, (x) =>
        exportHedge(100, x, forward, ratio / 100, "forward"),
      ),
      color: 0,
    },
    {
      name: "买入美元看跌期权",
      points: sample(5.5, 8.5, (x) =>
        exportHedge(100, x, forward, ratio / 100, "option", premium),
      ),
      color: 1,
    },
  ];
  return markup`${FigurePlot({
    title: "出口收入的套期保值比较",
    series: series,
    xLabel: "到期汇率（元 / 美元）",
    yLabel: "人民币净收入（万元）",
  })}<div class="figure-controls">${Slider({
    label: "套期保值比例",
    amount: ratio,
    min: 0,
    max: 100,
    step: 10,
    unit: "%",
    onChange: setRatio,
  })}${Slider({
    label: "远期汇率与期权执行价",
    amount: forward,
    min: 6,
    max: 8,
    step: 0.05,
    onChange: setForward,
  })}${Slider({
    label: "期权费（元 / 美元）",
    amount: premium,
    min: 0,
    max: 0.4,
    step: 0.02,
    onChange: setPremium,
  })}</div>${Insight({
    children: markup`<p>远期锁定已对冲部分的收款汇率。期权保留美元升值带来的收入增加，但需要支付期权费；未对冲部分仍随市场汇率变化。</p>`,
  })}${Reset({
    onClick: () => {
      setRatio(100);
      setForward(7);
      setPremium(0.12);
    },
  })}${Note({
    children: markup`依据讲义交易敞口与金融对冲的分析绘制。设出口应收款为 100 万美元；期权为买入美元看跌、人民币看涨期权，净收入已扣期权费，忽略费用的时间价值。`,
  })}`;
});
const DollarNetwork = view(function DollarNetwork() {
  const nodes = [
    ["贸易计价 → 融资需求", "美元计价增加支付、融资和风险管理需求。"],
    [
      "融资市场 → 资产供给",
      "银行、债券市场与外汇掉期扩大美元融资及金融工具的供给。",
    ],
    ["资产需求 → 市场深度", "美元资产需求支持市场深度和抵押品功能。"],
    [
      "市场深度 → 货币使用",
      "市场越深，交易和套保成本越低；使用者越多，金融机构越愿意继续提供美元工具。",
    ],
  ];
  return markup`<div class="figure-network-static" aria-label="美元使用的相互强化关系">${renderContent(nodes.map(([title, text]) => markup`<div><strong>${renderContent(title)}</strong><p>${renderContent(text)}</p></div>`))}</div>${Note(
    {
      children: markup`依据讲义美元网络反馈图。各环节相互影响；它不是逐笔交易必须经过的顺序。`,
    },
  )}`;
});
const PaymentRoute = view(function PaymentRoute() {
  const [rail, setRail] = viewState("chips"),
    [step, setStep] = viewState("0");
  const labels = ["付款行扣账", "银行间结算", "收款行入账"];
  return markup`${Tabs({
    value: rail,
    onChange: setRail,
    items: [
      ["chips", "CHIPS"],
      ["fedwire", "Fedwire Funds"],
    ],
    label: "银行间替代结算路径",
  })}<div class="payment-message-lane"><strong>报文层 · Swift 等网络</strong><span>传递指令与状态信息</span></div><div class="payment-account-lane" data-stage=${ifDefined(step)}><div class=${ifDefined(step === "0" ? "active" : "")}><strong>土耳其银行</strong><span>借记客户账户</span></div><span aria-hidden="true">→</span><div class="payment-us-node"><strong>美国代理行 A</strong><span>借记付款行美元账户</span></div><div class="payment-clearing"><span aria-hidden="true">↓</span><strong>${renderContent(rail === "chips" ? "CHIPS" : "Fedwire Funds")}</strong><span>${renderContent(rail === "chips" ? "流动性节约与终局结算" : "央行账户内实时全额结算")}</span><span aria-hidden="true">↓</span></div><div class="payment-us-node"><strong>美国代理行 B</strong><span>贷记收款行美元账户</span></div><span aria-hidden="true">→</span><div class=${ifDefined(step === "2" ? "active" : "")}><strong>巴西银行</strong><span>贷记出口商账户</span></div></div>${Tabs(
    {
      value: step,
      onChange: setStep,
      items: labels.map((l, n) => [String(n), l]),
      label: "查看支付环节",
    },
  )}${Insight({
    children: markup`<strong>${renderContent(labels[Number(step)])}</strong><p>${renderContent(step === "0" ? "付款行按客户指令借记账户，必要时先换汇。报文可以传递支付信息，但报文本身不完成资金结算。" : step === "1" ? (rail === "chips" ? "两家代理行经 CHIPS 完成银行间支付，使用流动性节约机制。" : "两家代理行通过 Fedwire Funds，在美联储账户内实时全额结算。") + "这里展示的是两条替代路径中的一条。" : "收款行在收到资金并完成相关处理后贷记客户账户，必要时再换汇。")}</p>`,
  })}${Note({
    children: markup`依据讲义跨境美元支付路径图。CHIPS 与 Fedwire 不是先后经过的两站；Swift 不持有资金，也不承担最终结算。本图假定两家境外银行分别使用美国境内代理行。`,
  })}`;
});
const CipsGrowth = view(function CipsGrowth() {
  const [metric, setMetric] = viewState("amount"),
    [mode, setMode] = viewState("level"),
    [start, setStart] = viewState(2015),
    [end, setEnd] = viewState(2025);
  const value = (item) =>
    metric === "amount" ? item.amountBillion / 1000 : item.transactions / 1e6;
  const allPoints = cipsHistory
    .map((item, index) => ({
      x: item.year,
      y:
        mode === "level"
          ? value(item)
          : index
            ? (value(item) / value(cipsHistory[index - 1]) - 1) * 100
            : 0,
    }))
    .filter((point) => mode === "level" || point.x >= 2017);
  const points = allPoints.filter(
    (point) => point.x >= start && point.x <= end,
  );
  const unit =
    mode === "growth"
      ? "同比增长（%）"
      : metric === "amount"
        ? "处理金额（万亿元）"
        : "业务笔数（百万笔）";
  return markup`${Tabs({
    value: metric,
    onChange: setMetric,
    items: [
      ["amount", "处理金额"],
      ["count", "业务笔数"],
    ],
    label: "CIPS 业务指标",
  })}${Tabs({
    value: mode,
    onChange: (next) => {
      setMode(next);
      if (next === "growth") {
        setStart(Math.max(start, 2017));
        setEnd(Math.max(end, 2018));
      }
    },
    items: [
      ["level", "年度规模"],
      ["growth", "同比变化"],
    ],
    label: "年度规模或增速",
  })}${FigurePlot({
    title: "CIPS 历年业务",
    series: [
      {
        name: metric === "amount" ? "处理金额" : "业务笔数",
        points,
      },
    ],
    xLabel: "年份",
    yLabel: unit,
    xFormat: year,
    yFormat: (value) =>
      value.toFixed(mode === "growth" ? 1 : metric === "amount" ? 2 : 3) +
      (mode === "growth" ? "%" : ""),
  })}<div class="figure-controls">${Slider({
    label: "起始年份",
    amount: start,
    min: mode === "growth" ? 2017 : 2015,
    max: 2024,
    onChange: (value) => {
      setStart(value);
      setEnd(Math.max(end, value + 1));
    },
  })}${Slider({
    label: "结束年份",
    amount: end,
    min: start + 1,
    max: 2025,
    onChange: setEnd,
  })}</div>${Reset({
    onClick: () => {
      setMetric("amount");
      setMode("level");
      setStart(2015);
      setEnd(2025);
    },
  })}${FigureData({
    headers: ["年份", "处理金额（万亿元）", "业务笔数（笔）"],
    rows: cipsHistory.map((item) => [
      item.year,
      (item.amountBillion / 1000).toFixed(4),
      item.transactions.toLocaleString("zh-CN"),
    ]),
  })}${Note({
    children: markup`<a href="https://www.cips.com.cn/kjjqgsyyingw/articleFileDir/2025-12/10/7776329b413141ea94e6e5588d8d048c.pdf" target="_blank" rel="noreferrer">CIPS 官方历年业务统计</a>，2015—2025 年。原表金额单位为十亿元，本站换算为万亿元；笔数曲线以百万笔显示。2015 年是系统启用后的部分年度，因此同比图从 2017 年起显示，避免将 2016 年与部分年度直接比较。曲线连接年度观测，不表示年内走势；处理活动不等于人民币全球支付份额。`,
  })}`;
});
const ReserveGold = view(function ReserveGold() {
  const [view, setView] = viewState("gold"),
    [selected, setSelected] = viewState("2024 年");
  const gold = [
    {
      name: "2022 年",
      value: 1136,
    },
    {
      name: "2023 年",
      value: 1051,
    },
    {
      name: "2024 年",
      value: 1092,
    },
    {
      name: "2025 年",
      value: 863,
    },
  ];
  const dollar = [
    {
      name: "2000 Q1",
      value: 70.8,
    },
    {
      name: "2026 Q1",
      value: 57.1,
    },
  ];
  const data = view === "gold" ? gold : dollar;
  return markup`${Tabs({
    value: view,
    onChange: (v) => {
      setView(v);
      setSelected(v === "gold" ? "2024 年" : "2026 Q1");
    },
    items: [
      ["gold", "央行净购金"],
      ["dollar", "美元储备份额"],
    ],
    label: "储备分散化的观察口径",
  })}<div class="figure-period">${renderContent(view === "gold" ? "年度净购金流量 · 吨" : "官方外汇储备的币种份额 · %")}</div>${FigureBars(
    {
      data: data,
      selected: selected,
      onSelect: setSelected,
      format: (n) =>
        fixed(n, view === "gold" ? 0 : 1) + (view === "gold" ? " 吨" : "%"),
      label: view === "gold" ? "各年央行净购金" : "两个时点的美元储备份额",
    },
  )}${Note({
    children: markup`IMF COFER、世界黄金协会，沿用讲义标注值。美元面板仅比较讲义正文列出的起止季度；COFER 采用同一修订口径。两种指标不能相加。`,
  })}`;
});
const components = {
  "currency-weight": CurrencyWeight,
  "account-bridge": AccountBridge,
  "fx-turnover": FxTurnover,
  "big-mac": BigMac,
  "relative-ppp": RelativePpp,
  uip: UipFigure,
  overshooting: Overshooting,
  "policy-markets": PolicyMarkets,
  "risk-sharing": SharingFigure,
  securitization: Securitization,
  "debt-dynamics": DebtFigure,
  "equity-markets": EquityMarkets,
  "hedge-payoff": HedgeFigure,
  "dollar-network": DollarNetwork,
  "payment-route": PaymentRoute,
  "cips-growth": CipsGrowth,
  "reserve-gold": ReserveGold,
  "iip-valuation": IipValuation,
  "balassa-samuelson": BalassaSamuelson,
  "cip-cashflow": CipCashflow,
  "j-curve": JCurve,
  "currency-mismatch": CurrencyMismatch,
  "repo-liquidity": RepoLiquidity,
  "policy-capital-mobility": PolicyCapitalMobility,
  "money-adjustment": MoneyAdjustment,
  "specie-flow": SpecieFlow,
  "intertemporal-choice": IntertemporalChoice,
};
const ReadingFigure = view(function ReadingFigure({ kind }) {
  const Component = components[kind];
  return markup`<figure class="reading-figure" id=${ifDefined("figure-" + kind)} data-figure=${ifDefined(kind)} aria-labelledby=${ifDefined("figure-title-" + kind)}><figcaption><span>随文图解</span><h4 id=${ifDefined("figure-title-" + kind)}>${renderContent(figureTitles[kind])}</h4></figcaption>${Component({})}</figure>`;
});
export default ReadingFigure;
