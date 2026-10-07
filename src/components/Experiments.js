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
import { ArrowDown, ArrowRight, Check, ChevronRight } from "../ui/icons.js";
import { money, Slider, Reset, Tabs } from "./ExperimentUI.js";
import {
  Arbitrage,
  Prices,
  Parity,
  Overshoot,
  Debt,
  Funding,
  Hedge,
  Stablecoin,
  Sharing,
  Trilemma,
  Iip,
} from "./AdvancedExperiments.js";
const Accounts = view(function Accounts() {
  const [stage, setStage] = viewState(0);
  const titles = ["交付货物", "收到美元", "境内结汇"];
  return markup`<div class="experiment-heading"><h2>国际收支分录</h2><p>选择交易时点，查看对应分录。</p></div><div class="step-controls" aria-label="订单时点">${renderContent(titles.map((title, i) => markup`<button class=${ifDefined(stage === i ? "active" : "")} aria-pressed=${ifDefined(stage === i)} @click=${() => setStage(i)}><span>${renderContent(i + 1)}</span>${renderContent(title)}</button>`))}</div><div class="transaction-route"><div><span>${renderContent(stage === 1 ? "美国客户" : "中国出口企业")}</span><small>${renderContent(stage === 0 ? "交付货物" : stage === 1 ? "支付货款" : "卖出美元资产")}</small></div>${ArrowRight(
    {
      size: 24,
    },
  )}<div><span>${renderContent(stage === 2 ? "境内商业银行" : stage === 0 ? "美国客户" : "中国出口企业")}</span><small>${renderContent(stage === 0 ? "形成付款义务" : stage === 1 ? "持有境外存款" : "接收美元资产")}</small></div></div><div class="ledger" aria-live="polite"><div class="ledger-title"><span>${renderContent(stage === 2 ? "居民之间的资产转让" : "本时点的国际收支记录")}</span><small>万美元</small></div>${renderContent(stage === 0 ? markup`<div class="ledger-entry"><span>经常账户<small>货物出口</small></span><strong>+10</strong></div><div class="ledger-entry"><span>金融账户<small>贸易信贷资产净获得</small></span><strong>+10</strong></div>` : stage === 1 ? markup`<div class="ledger-entry"><span>金融账户<small>贸易信贷资产净获得</small></span><strong>−10</strong></div><div class="ledger-entry"><span>金融账户<small>境外存款资产净获得</small></span><strong>+10</strong></div>` : markup`<div class="ledger-entry"><span>标准国际收支<small>双方都是中国居民</small></span><strong>不新增</strong></div>`)}</div><p class="result-explanation" aria-live="polite">${renderContent(stage === 0 ? "交货时经济所有权转移。货物出口和贸易信贷资产增加同时入账，金额均为 10 万美元。" : stage === 1 ? "收款时，贸易信贷资产减少 10 万美元，境外存款增加 10 万美元。金融账户净额为零。" : "企业将美元资产转让给境内银行，交易双方均为居民，不新增标准国际收支交易。")}</p><div class="experiment-foot">沿用讲义 BPM6 符号：金融账户以净贷出为正。忽略费用、估值变化及其他交易。</div>`;
});
const transmissions = {
  "floating-money": {
    steps: [
      "央行增加货币供给",
      "短期利率下降",
      "资本配置转向外币资产",
      "本币贬值，净出口增加",
    ],
    result:
      "在模型条件下，货币扩张降低利率，增加投资；本币贬值增加净出口，总需求上升。",
    triangle: ["资本自由流动", "货币政策自主"],
    constraint: "汇率稳定受到约束",
  },
  "fixed-money": {
    steps: [
      "央行增加货币供给",
      "利率下降引起贬值压力",
      "央行售汇、收回本币",
      "初始货币扩张被抵消",
    ],
    result: "央行干预抵消货币扩张，本国利率回到世界利率。",
    triangle: ["汇率稳定", "资本自由流动"],
    constraint: "货币政策自主受到约束",
  },
  "floating-fiscal": {
    steps: [
      "政府增加购买",
      "需求与利率上升压力",
      "资本流入，本币升值",
      "净出口下降，削弱财政扩张",
    ],
    result:
      "本币升值引起净出口下降，抵消部分财政扩张。资本完全流动是完全挤出的极限条件。",
    triangle: ["资本自由流动", "货币政策自主"],
    constraint: "汇率稳定受到约束",
  },
  "fixed-fiscal": {
    steps: [
      "政府增加购买",
      "利率上升引起升值压力",
      "央行购汇、投放本币",
      "货币供给配合需求扩张",
    ],
    result: "央行购汇阻止本币升值，货币供给增加，产出上升。",
    triangle: ["汇率稳定", "资本自由流动"],
    constraint: "货币政策自主受到约束",
  },
};
const PolicyDiagram = view(function PolicyDiagram({ regime, policy }) {
  const temporary = regime === "fixed" && policy === "money";
  const isIntercept = temporary
    ? 9
    : policy === "fiscal"
      ? regime === "fixed"
        ? 11
        : 10.4
      : 10;
  const lmIntercept = temporary
    ? -1.5
    : policy === "money"
      ? -1.5
      : regime === "fixed"
        ? -1
        : 0;
  const finalY = temporary ? 6 : (isIntercept - lmIntercept) / 1.5;
  const finalI = temporary ? 3 : finalY * 0.5 + lmIntercept;
  const px = (y) => 36 + (y / 12) * 276;
  const py = (i) => 183 - (i / 9) * 153;
  const curve = (intercept, slope) =>
    [
      slope > 0 ? Math.max(2, -intercept / slope) : 2,
      slope < 0 ? Math.min(10, -intercept / slope) : 10,
    ]
      .map((y) => px(y) + "," + py(intercept + slope * y))
      .join(" ");
  return markup`<figure class="model-chart policy-chart"><figcaption>IS–LM 调整示意</figcaption><svg viewBox="0 0 340 223" role="img" aria-label=${ifDefined(temporary ? "货币扩张暂时推动 LM 右移，维持固定汇率的干预使 LM 回到原位。" : "新均衡的产出上升；" + (finalI > 3 ? "利率上升。" : finalI < 3 ? "利率下降。" : "利率不变。"))}><title>IS–LM 调整示意</title><line x1="36" y1="183" x2="321" y2="183" class="plot-axis"></line><line x1="36" y1="183" x2="36" y2="22" class="plot-axis"></line><text x="24" y="19">i</text><text x="322" y="201">Y</text><polyline points=${ifDefined(curve(9, -1))} class="policy-original"></polyline><polyline points=${ifDefined(curve(0, 0.5))} class="policy-original"></polyline><text x=${ifDefined(px(9))} y=${ifDefined(py(0) + 18)}>IS₀</text><text x=${ifDefined(px(10))} y=${ifDefined(py(5) - 10)}>LM₀</text><polyline points=${ifDefined(curve(isIntercept, -1))} class=${ifDefined(temporary ? "policy-original" : "plot-line")}></polyline><polyline points=${ifDefined(curve(lmIntercept, 0.5))} class=${ifDefined(temporary ? "plot-reference" : "plot-line")}></polyline><circle cx=${ifDefined(px(6))} cy=${ifDefined(py(3))} r="3" class="policy-initial-point"></circle><text x=${ifDefined(px(6) - 17)} y=${ifDefined(py(3) - 10)}>E₀</text><circle cx=${ifDefined(px(finalY))} cy=${ifDefined(py(finalI))} r="4" class="plot-point"></circle><text x=${ifDefined(px(finalY) + 8)} y=${ifDefined(py(finalI) + 17)}>${renderContent(temporary ? "E₁ = E₀" : "E₁")}</text><text x="40" y="219">${renderContent(temporary ? "虚线：暂时的货币扩张" : "灰线：初始状态；绿色：调整后的曲线")}</text></svg><p class="plot-key">曲线用于表示方向，斜率与位移不代表实际估计。</p></figure>`;
});
const Policy = view(function Policy() {
  const [regime, setRegime] = viewState("floating");
  const [policy, setPolicy] = viewState("money");
  const [restricted, setRestricted] = viewState(false);
  const selected = transmissions[regime + "-" + policy];
  return markup`<div class="experiment-heading"><h2>汇率制度与政策传导</h2><p>比较两种制度下的货币扩张与财政扩张。</p></div><fieldset class="choice-field"><legend>汇率制度</legend><div class="segmented">${renderContent(
    [
      ["floating", "浮动汇率"],
      ["fixed", "固定汇率"],
    ].map(
      ([id, name]) =>
        markup`<button class=${ifDefined(regime === id ? "active" : "")} aria-pressed=${ifDefined(regime === id)} @click=${() => setRegime(id)}>${renderContent(name)}</button>`,
    ),
  )}</div></fieldset><fieldset class="choice-field"><legend>扩张政策</legend><div class="segmented">${renderContent(
    [
      ["money", "增加货币供给"],
      ["fiscal", "增加政府购买"],
    ].map(
      ([id, name]) =>
        markup`<button class=${ifDefined(policy === id ? "active" : "")} aria-pressed=${ifDefined(policy === id)} @click=${() => setPolicy(id)}>${renderContent(name)}</button>`,
    ),
  )}</div></fieldset>${PolicyDiagram({
    regime: regime,
    policy: policy,
  })}<ol class="transmission" aria-live="polite">${renderContent(
    selected.steps.map(
      (step, i) =>
        markup`<li><span class="chain-number">${renderContent(i + 1)}</span><span>${renderContent(step)}</span>${renderContent(
          i < 3 &&
            ArrowDown({
              size: 13,
              className: "chain-arrow",
            }),
        )}</li>`,
    ),
  )}</ol><p class="result-explanation">${renderContent(selected.result)}</p><details class="triangle-detail"><summary>三元悖论${ChevronRight(
    {
      size: 15,
    },
  )}</summary><div class="triangle-summary">${renderContent(
    selected.triangle.map(
      (item) =>
        markup`<span>${Check({
          size: 14,
        })}${renderContent(item)}</span>`,
    ),
  )}<strong>${renderContent(selected.constraint)}</strong></div><label class="check-field"><input type="checkbox" .checked=${live(restricted)} @input=${(e) => setRestricted(e.target.checked)}>考虑资本流动管理</label><p>${renderContent(restricted ? "资本流动管理限制跨境资产转换，国内外利差可能持续。上述完全流动条件下的传导不再直接适用。" : "以上传导假设资本自由流动、资产可替代且风险溢价给定。")}</p></details><div class="experiment-foot">模型条件：小型开放经济、短期价格给定，风险与预期不变。</div>`;
});
const Crisis = view(function Crisis() {
  const [rate, setRate] = viewState(7);
  const [assetCurrency, setAssetCurrency] = viewState("cny");
  const [renewal, setRenewal] = viewState(false);
  const debt = 100000 * rate;
  const asset = assetCurrency === "cny" ? 800000 : (800000 / 7) * rate;
  const equity = asset - debt;
  return markup`<div class="experiment-heading"><h2>货币错配与净资产</h2><p>借入 10 万美元，初始汇率 7.00，加上 10 万元自有资金，购入价值 80 万元的长期资产。本例单独计算，不计入前述出口应收款。</p></div><fieldset class="choice-field"><legend>资产与收入的计价货币</legend><div class="segmented"><button aria-pressed=${ifDefined(assetCurrency === "cny")} class=${ifDefined(assetCurrency === "cny" ? "active" : "")} @click=${() => setAssetCurrency("cny")}>人民币</button><button aria-pressed=${ifDefined(assetCurrency === "usd")} class=${ifDefined(assetCurrency === "usd" ? "active" : "")} @click=${() => setAssetCurrency("usd")}>美元</button></div></fieldset>${Slider(
    {
      label: "人民币／美元汇率",
      amount: rate,
      unit: "CNY / USD",
      min: 6,
      max: 9,
      step: 0.1,
      onChange: setRate,
    },
  )}<dl class="balance-sheet" aria-live="polite"><div><dt>资产的人民币价值</dt><dd>¥ ${renderContent(money(asset))}</dd></div><div><dt>美元债务折合人民币</dt><dd>¥ ${renderContent(money(debt))}</dd></div><div class=${ifDefined(equity < 0 ? "negative-result" : "accent-result")}><dt>简化净资产</dt><dd>¥ ${renderContent(money(equity))}</dd></div></dl><p class="result-explanation">${renderContent(assetCurrency === "cny" ? "人民币资产价值不变。人民币贬值提高美元负债的人民币价值，净资产减少。" : "资产与负债均以美元计价，人民币价值随汇率同比例变化。币种匹配不消除资产的经营风险或信用风险。")}</p><label class="check-field risk-toggle"><input type="checkbox" .checked=${live(renewal)} @input=${(e) => setRenewal(e.target.checked)}>短期债到期，贷款人不再续借</label>${renderContent(renewal && markup`<div class="risk-feedback" role="status">到期须筹集 10 万美元偿债。净资产为正不保证能够及时变现；长期资产与短期负债仍有期限错配。</div>`)}${Reset(
    {
      onClick: () => {
        setRate(7);
        setAssetCurrency("cny");
        setRenewal(false);
      },
    },
  )}<div class="experiment-foot">仅展示汇率换算与到期压力。忽略利息、资产价格变化、现金储备与其他债务。</div>`;
});
const paymentLayers = [
  {
    title: "交易义务",
    usd: "合同约定付款人、收款人、金额 10 万美元及付款期限。",
    cny: "双方重新约定人民币金额和期限。客户需要安排人民币资金或换汇。",
  },
  {
    title: "支付报文",
    usd: "银行发送并认证付款指令。SWIFT 属于报文网络，不承担资金结算。",
    cny: "银行可使用相应的报文通道。使用人民币，不意味着所有指令必须走同一个通信网络。",
  },
  {
    title: "清算",
    usd: "银行或清算机构核对付款，计算应收应付；轧差可减少银行间所需划转的结算资产。",
    cny: "人民币代理行或相关清算安排处理银行间头寸。路径取决于参与资格和开户关系。",
  },
  {
    title: "结算",
    usd: "相应美元账户完成划转，收款银行贷记客户账户。实际路径可能涉及代理行或银行内部账簿。",
    cny: "相应人民币结算资产完成划转。相关银行可通过 CIPS 或其他适用安排完成跨境支付。",
  },
];
const System = view(function System({ initialCurrency = "usd" }) {
  const [currency, setCurrency] = viewState(initialCurrency);
  const [restriction, setRestriction] = viewState("none");
  const [layer, setLayer] = viewState(0);
  return markup`<div class="experiment-heading"><h2>跨境支付的四个环节</h2><p>选择合同币种和支付环节，查看对应安排。</p></div><div class="segmented"><button class=${ifDefined(currency === "usd" ? "active" : "")} aria-pressed=${ifDefined(currency === "usd")} @click=${() => setCurrency("usd")}>美元合同</button><button class=${ifDefined(currency === "cny" ? "active" : "")} aria-pressed=${ifDefined(currency === "cny")} @click=${() => setCurrency("cny")}>人民币合同</button></div><div class="payment-route">${renderContent(
    paymentLayers.map(
      (item, i) =>
        markup`<button class=${ifDefined(i === layer ? "selected" : "")} aria-pressed=${ifDefined(i === layer)} @click=${() => setLayer(i)}><span class="chain-number">${renderContent(i + 1)}</span><span>${renderContent(item.title)}</span>${ChevronRight(
          {
            size: 16,
          },
        )}</button>`,
    ),
  )}</div><div class="payment-description" aria-live="polite"><h3>${renderContent(paymentLayers[layer].title)}</h3><p>${renderContent(paymentLayers[layer][currency])}</p></div><div class="custody-note"><span>资产控制</span><strong>托管</strong><p>托管机构记录和控制证券等金融资产，影响出售、质押、付息与划转。托管与上述支付环节并行。</p></div><label class="select-field"><span>限制发生在哪里</span><select ${selectValue(restriction)} @input=${(event) => setRestriction(event.target.value)}><option value="none">没有额外限制</option><option value="message">报文网络接入</option><option value="clearing">清算参与资格</option><option value="settlement">结算账户或代理行</option><option value="custody">托管资产冻结</option></select></label>${renderContent(restriction !== "none" && markup`<div class="risk-feedback" role="status">${renderContent(restriction === "message" ? "失去报文网络接入会妨碍指令传递，但不等于账户资金自动被冻结。替代报文也需要银行接受和认证。" : restriction === "clearing" ? "无法参与原清算安排时，需要寻找合法可行的参与机构或替代路径；这并不保证结算账户可以使用。" : restriction === "settlement" ? "结算账户或代理行关系受限，会妨碍资金最终划转。报文送达也不能保证收款。" : "托管资产冻结会限制相关证券或储备资产的转让、出售及使用。它与支付报文是否送达是不同问题。")} 更换合同币种并不自动改变机构受到的限制；仍须核对参与银行、资产和适用规则。</div>`)}${Reset(
    {
      onClick: () => {
        setCurrency(initialCurrency);
        setLayer(0);
        setRestriction("none");
      },
    },
  )}<div class="experiment-foot">路径示意。实际安排取决于开户关系、代理行网络和支付系统规则。</div>`;
});
const AccountsWithValuation = view(function AccountsWithValuation() {
  const [tab, setTab] = viewState("ledger");
  return markup`${Tabs({
    value: tab,
    onChange: setTab,
    label: "国际账户计算",
    items: [
      ["ledger", "复式记账"],
      ["valuation", "估值与净头寸"],
    ],
  })}<div class="calculator-body">${renderContent(tab === "ledger" ? Accounts({}) : Iip({}))}</div>`;
});
const experimentNames = {
  accounts: "国际账户",
  arbitrage: "三角套利",
  prices: "价格与汇率",
  parity: "利率平价",
  overshoot: "汇率超调",
  policy: "政策传导",
  sharing: "风险分担",
  trilemma: "三元悖论",
  crisis: "资产负债表",
  debt: "债务计算",
  funding: "融资成本",
  hedge: "套期保值",
  payment: "跨境支付",
  stablecoin: "储备与赎回",
};
const Experiment = view(function Experiment({ kinds, topicId }) {
  const [kind, setKind] = viewState(kinds[0]);
  const content =
    kind === "accounts"
      ? AccountsWithValuation({})
      : kind === "arbitrage"
        ? Arbitrage({})
        : kind === "prices"
          ? Prices({})
          : kind === "parity"
            ? Parity({})
            : kind === "overshoot"
              ? Overshoot({})
              : kind === "policy"
                ? Policy({})
                : kind === "sharing"
                  ? Sharing({})
                  : kind === "trilemma"
                    ? Trilemma({})
                    : kind === "crisis"
                      ? Crisis({})
                      : kind === "debt"
                        ? Debt({})
                        : kind === "funding"
                          ? Funding({})
                          : kind === "hedge"
                            ? Hedge({})
                            : kind === "stablecoin"
                              ? Stablecoin({})
                              : System({
                                  initialCurrency:
                                    topicId === "renminbi" ? "cny" : "usd",
                                });
  return markup`<div class="experiment-panel" data-experiment=${ifDefined(kind)}>${renderContent(
    kinds.length > 1 &&
      Tabs({
        value: kind,
        onChange: setKind,
        label: "本篇交互",
        items: kinds.map((id) => [id, experimentNames[id]]),
      }),
  )}<div class=${ifDefined(kinds.length > 1 ? "calculator-body" : "")}>${renderContent(content)}</div></div>`;
});
export default Experiment;
