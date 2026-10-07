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
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Move,
  RotateCcw,
} from "../ui/icons.js";
import {
  accountBuckets,
  accountCards,
  activityTitles,
  digitalLiabilities,
  futureScenarios,
  monetaryPeriods,
  moneyFunctionCards,
  moneyFunctions,
  moneyScopes,
  policySequences,
  safetyTools,
} from "../activities-data.js";
import {
  completeRegionalCentre,
  initialRepoBalance,
  monetaryScenario,
  repayRepo,
  repoPosition,
  sellSecurities,
} from "../lib/activities.js";
const amount = (n) =>
  new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
  }).format(n);
const Restart = view(function Restart({ onClick }) {
  return markup`<button class="activity-reset" @click=${onClick}>${RotateCcw({
    size: 14,
  })}重新开始</button>`;
});
const History = view(function History() {
  const [index, setIndex] = viewState(0);
  const [compare, setCompare] = viewState(null);
  const period = monetaryPeriods[index];
  const fields = [
    ["名义锚", "anchor"],
    ["汇率安排", "exchange"],
    ["资本与信用", "capital"],
    ["外部调整", "adjustment"],
  ];
  return markup`<p class="activity-instruction">点选一个时期，比较名义锚、汇率安排与外部调整方式。</p><div class="history-timeline" aria-label="国际货币制度时间轴">${renderContent(
    monetaryPeriods.map(
      (item, i) =>
        markup`<button aria-pressed=${ifDefined(index === i)} class=${ifDefined(index === i ? "selected" : "")} @click=${() => {
          setIndex(i);
          if (compare === i) setCompare(null);
        }}><span>${renderContent(item.year)}</span><strong>${renderContent(item.label)}</strong></button>`,
    ),
  )}</div><div class="history-detail" aria-live="polite"><p>${renderContent(period.text)}</p><label class="activity-select"><span>对照另一个时期</span><select ${selectValue(compare ?? "")} @input=${(e) => setCompare(e.target.value === "" ? null : Number(e.target.value))}><option value="">暂不对照</option>${renderContent(monetaryPeriods.map((item, i) => i !== index && markup`<option value=${ifDefined(i)}>${renderContent(item.year)} · ${renderContent(item.label)}</option>`))}</select></label><div class=${ifDefined("period-comparison" + (compare !== null ? " comparing" : ""))}>${renderContent([period, ...(compare !== null ? [monetaryPeriods[compare]] : [])].map((item) => markup`<div><h4>${renderContent(item.label)}</h4><dl>${renderContent(fields.map(([title, field]) => markup`<div><dt>${renderContent(title)}</dt><dd>${renderContent(item[field])}</dd></div>`))}</dl><p class="activity-note">${renderContent(item.cost)}</p></div>`))}</div></div>`;
});
const LedgerSort = view(function LedgerSort() {
  const [active, setActive] = viewState(null);
  const [assigned, setAssigned] = viewState({});
  const [checked, setChecked] = viewState(false);
  const place = (id, bucket) => {
    if (!id || !accountCards.some((card) => card.id === id)) return;
    setAssigned((previous) => ({
      ...previous,
      [id]: bucket,
    }));
    setActive(null);
    setChecked(false);
  };
  const correct = accountCards.filter(
    (card) => assigned[card.id] === card.bucket,
  ).length;
  return markup`<p class="activity-premise">做分录时可以固定采用两步：先识别交易的经济内容，确定第一条记录属于哪个账户；再问付款如何完成或资产负债如何变化，寻找等额对应项。</p><p class="activity-instruction">选一张交易卡，再点账户。电脑上也可以把卡片拖到账户中。</p><div class="transaction-cards" aria-label="待分类的经济事项">${renderContent(
    accountCards.map(
      (card) =>
        markup`<button draggable=${ifDefined(true)} aria-pressed=${ifDefined(active === card.id)} class=${ifDefined(active === card.id ? "selected" : "")} @click=${() => setActive(card.id)} @dragstart=${(
          event,
        ) => {
          event.dataTransfer.setData("text/plain", card.id);
          event.dataTransfer.effectAllowed = "move";
          setActive(card.id);
        }}>${Move({
          size: 15,
        })}<span><strong>${renderContent(card.title)}</strong><span>${renderContent(card.text)}</span><small>${renderContent(assigned[card.id] !== undefined ? "已归入：" + accountBuckets[assigned[card.id]] : "尚未归类")}</small></span></button>`,
    ),
  )}</div><div class="account-buckets" aria-label="选择归入的账户">${renderContent(
    accountBuckets.map(
      (bucket, i) =>
        markup`<button @click=${() => place(active, i)} @dragover=${(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }} @drop=${(event) => {
          event.preventDefault();
          place(event.dataTransfer.getData("text/plain"), i);
        }} aria-label=${ifDefined("归入" + bucket)}><strong>${renderContent(bucket)}</strong><span>${renderContent(
          accountCards
            .filter((card) => assigned[card.id] === i)
            .map((card) => card.title)
            .join("、") || (active ? "点此放入所选事项" : "选择交易卡后归类"),
        )}</span></button>`,
    ),
  )}</div><div class="activity-actions"><button class="secondary-button" ?disabled=${Object.keys(assigned).length < accountCards.length} @click=${() => setChecked(true)}>核对分录</button><span class="assignment-count">已归类 ${renderContent(Object.keys(assigned).length)} / ${renderContent(accountCards.length)}</span>${Restart(
    {
      onClick: () => {
        setAssigned({});
        setActive(null);
        setChecked(false);
      },
    },
  )}</div>${renderContent(
    checked &&
      markup`<div class="activity-feedback" role="status"><strong>${renderContent(correct === accountCards.length ? "六项归类均正确" : "归类正确 " + correct + " / " + accountCards.length)}</strong><div class="account-explanations">${renderContent(
        accountCards.map(
          (card) =>
            markup`<div><h4 class=${ifDefined(assigned[card.id] === card.bucket ? "" : "needs-correction")}>${renderContent(
              assigned[card.id] === card.bucket &&
                Check({
                  size: 14,
                }),
            )}${renderContent(card.title)} · ${renderContent(accountBuckets[card.bucket])}</h4><p>${renderContent(card.explanation)}</p></div>`,
        ),
      )}</div></div>`,
  )}`;
});
const PolicyOrder = view(function PolicyOrder() {
  const [scenarioIndex, setScenarioIndex] = viewState(0);
  const [order, setOrder] = viewState([0, 2, 3, 1]);
  const [checked, setChecked] = viewState(false);
  const scenario = policySequences[scenarioIndex];
  const move = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= order.length) return;
    setOrder((previous) => {
      const copy = [...previous];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setChecked(false);
  };
  const correct = order.every((id, i) => id === i);
  return markup`<p class="activity-instruction">选择制度与政策，用上下箭头调整四个环节的次序。</p><label class="activity-select"><span>政策情境</span><select ${selectValue(scenarioIndex)} @input=${(
    e,
  ) => {
    setScenarioIndex(Number(e.target.value));
    setOrder([0, 2, 3, 1]);
    setChecked(false);
  }}>${renderContent(policySequences.map((item, i) => markup`<option value=${ifDefined(i)}>${renderContent(item.label)}</option>`))}</select></label><ol class="policy-order">${renderContent(
    order.map(
      (id, i) =>
        markup`<li><span class="order-position">${renderContent(i + 1)}</span><span class="policy-step-text">${renderContent(scenario.steps[id])}</span><div><button aria-label=${ifDefined("上移：" + scenario.steps[id])} ?disabled=${i === 0} @click=${() => move(i, -1)}>${ArrowUp(
          {
            size: 17,
          },
        )}</button><button aria-label=${ifDefined("下移：" + scenario.steps[id])} ?disabled=${i === order.length - 1} @click=${() => move(i, 1)}>${ArrowDown(
          {
            size: 17,
          },
        )}</button></div></li>`,
    ),
  )}</ol><div class="activity-actions"><button class="secondary-button" @click=${() => setChecked(true)}>核对次序</button>${Restart(
    {
      onClick: () => {
        setOrder([0, 2, 3, 1]);
        setChecked(false);
      },
    },
  )}</div>${renderContent(checked && markup`<div class="activity-feedback" role="status"><strong>${renderContent(correct ? "传导次序正确" : "再检查利率、汇率压力与央行操作的先后")}</strong>${renderContent(!correct && markup`<p>正确次序：${renderContent(scenario.steps.join(" → "))}</p>`)}<p>${renderContent(scenario.explanation)}</p></div>`)}<p class="activity-note">模型条件：小型开放经济，短期价格给定，资本完全流动，预期与风险溢价不变。浮动汇率下的国内投资通道与汇率通道可以同时发生。</p>`;
});
const RepoRun = view(function RepoRun() {
  const [balance, setBalance] = viewState({
    ...initialRepoBalance,
  });
  const [events, setEvents] = viewState([]);
  const position = repoPosition(balance);
  const execute = (next, text) => {
    setBalance(next);
    setEvents((previous) => [...previous, text]);
  };
  const sold = Math.min(10, balance.securities);
  const paid = Math.min(balance.cash, position.gap);
  return markup`<p class="activity-premise">折扣率表示抵押品价值中不能用于借款的比例，折扣率上升意味着同一抵押品能够获得的融资减少。</p><p class="activity-instruction">机构持有 100 亿元证券，以 5% 的折扣率借入 95 亿元。先提高融资折扣率，再比较卖资产与借入过桥资金的结果。</p><button class="repo-shock" ?disabled=${balance.haircut === 0.25} @click=${() =>
    execute(
      {
        ...balance,
        haircut: 0.25,
      },
      "融资折扣率从 5% 提高至 25%，同一证券组合可借金额从 95 降至 75 亿元。",
    )}><span>资金提供者要求</span><strong>融资折扣率 5% → 25%</strong>${ArrowRight(
    {
      size: 18,
    },
  )}</button><dl class="activity-balance" aria-live="polite"><div><dt>证券账面价值</dt><dd>${renderContent(amount(balance.securities))}<small>亿元</small></dd></div><div><dt>手头现金</dt><dd>${renderContent(amount(balance.cash))}<small>亿元</small></dd></div><div><dt>回购融资余额</dt><dd>${renderContent(amount(balance.repoDebt))}<small>亿元</small></dd></div><div><dt>过桥借款</dt><dd>${renderContent(amount(balance.bridgeDebt))}<small>亿元</small></dd></div><div class=${ifDefined(position.gap > 0 ? "negative-result" : "accent-result")}><dt>仍需补足的回购缺口</dt><dd>${renderContent(amount(position.gap))}<small>亿元</small></dd></div><div class=${ifDefined(position.equity < 0 ? "negative-result" : "")}><dt>净资产</dt><dd>${renderContent(amount(position.equity))}<small>亿元</small></dd></div></dl><div class="repo-actions"><button class="secondary-button" ?disabled=${balance.haircut < 0.25 || !balance.securities} @click=${() => execute(sellSecurities(balance), "折价出售 " + amount(sold) + " 亿元证券，得到 " + amount(sold * 0.8) + " 亿元现金，损失 " + amount(sold * 0.2) + " 亿元。")}>折价出售 10 亿元证券</button><button class="secondary-button" ?disabled=${balance.haircut < 0.25 || balance.bridgeDebt > 0} @click=${() =>
    execute(
      {
        ...balance,
        cash: balance.cash + 20,
        bridgeDebt: 20,
      },
      "取得 20 亿元过桥借款。现金与负债同时增加，净资产不变。",
    )}>取得 20 亿元过桥借款</button><button class="secondary-button" ?disabled=${paid <= 0.001} @click=${() => execute(repayRepo(balance), "用现金偿还 " + amount(paid) + " 亿元回购融资。现金与回购负债同时减少。")}>用现金偿还回购融资</button></div><div class="activity-feedback" role="status"><strong>${renderContent(position.equity < 0 ? "净资产转负，偿付能力也出现问题" : position.gap <= 0.001 ? "当前回购融资满足抵押要求" : "融资缺口仍有 " + amount(position.gap) + " 亿元")}</strong><p>${renderContent(balance.haircut < 0.25 ? "初始净资产为 5 亿元，现金为零。资产大于负债，不等于随时有现金还款。" : balance.bridgeDebt > 0 && position.gap <= 0.001 ? "过桥借款补上了眼前的回购缺口，但形成了另一笔到期负债。" : "卖出抵押品会增加现金，也会缩小抵押品池；折价出售还会侵蚀净资产。")}</p></div>${renderContent(events.length > 0 && markup`<ol class="repo-events" aria-label="操作记录">${renderContent(events.slice(-5).map((event, i) => markup`<li>${renderContent(event)}</li>`))}</ol>`)}<div class="activity-actions">${Restart(
    {
      onClick: () => {
        setBalance({
          ...initialRepoBalance,
        });
        setEvents([]);
      },
    },
  )}</div><p class="activity-note">100、95、75 与 20 亿元沿用讲义例子。假定债权人允许处置抵押品，卖出与还款分步列示；证券按账面价值的八折出售，未售出部分估值不变。过桥额度只可取得一次，忽略利息、费用和新增保证金。</p>`;
});
const SafetyNet = view(function SafetyNet() {
  const [persistent, setPersistent] = viewState(false);
  const [selected, setSelected] = viewState(["reserves"]);
  const [dollarSwap, setDollarSwap] = viewState(false);
  const toggle = (id) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  return markup`<p class="activity-premise">四层并不是严格的先后顺序，而是融资规模、准入条件、币种和政治成本不同的工具组合。</p><fieldset class="activity-choice"><legend>当前困难</legend><div class="segmented"><button aria-pressed=${ifDefined(!persistent)} class=${ifDefined(!persistent ? "active" : "")} @click=${() => setPersistent(false)}>美元融资突然中断</button><button aria-pressed=${ifDefined(persistent)} class=${ifDefined(persistent ? "active" : "")} @click=${() => setPersistent(true)}>国际收支持续困难</button></div></fieldset><p class="activity-instruction">勾选工具，比较它们提供什么币种、如何取得、需要承担什么成本。</p><div class="safety-tool-list">${renderContent(safetyTools.map((tool) => markup`<div class=${ifDefined(selected.includes(tool.id) ? "selected" : "")}><label><input type="checkbox" .checked=${live(selected.includes(tool.id))} @input=${() => toggle(tool.id)}><span>${renderContent(tool.title)}</span></label>${renderContent(selected.includes(tool.id) && markup`<div class="safety-tool-detail"><dl><div><dt>币种</dt><dd>${renderContent(tool.currency)}</dd></div><div><dt>准入</dt><dd>${renderContent(tool.access)}</dd></div><div><dt>成本</dt><dd>${renderContent(tool.cost)}</dd></div></dl><p>${renderContent(persistent ? tool.persistent : tool.acute)}</p>${renderContent(tool.id === "swap" && markup`<label class="check-field"><input type="checkbox" .checked=${live(dollarSwap)} @input=${(event) => setDollarSwap(event.target.checked)}>假定已获美元互换安排的参与资格</label><p class="activity-note">${renderContent(dollarSwap ? "可以继续核对额度、期限、抵押与提款程序。签有协议仍不意味着资金自动到账。" : "不能假定可以向主要储备货币央行直接取得美元。本币互换的名义金额不能直接计作美元融资。")}</p>`)}</div>`)}</div>`))}</div><div class="activity-feedback" role="status"><strong>${renderContent(selected.length ? "同时考察 " + selected.length + " 类工具" : "尚未选择工具")}</strong><p>${renderContent(selected.length ? (persistent ? "融资可以缓冲国际收支压力；能否持续偿付，还取决于外部调整和债务结构。" : "需要匹配资金到账时间与到期负债。储备规模、已签额度、可提款资金和实际到账金额是不同口径。") : "从一个工具开始，再加入其他工具比较。")}</p></div>`;
});
const MoneyFunctions = view(function MoneyFunctions() {
  const [index, setIndex] = viewState(0);
  const [scope, setScope] = viewState(null);
  const [functions, setFunctions] = viewState([]);
  const [checked, setChecked] = viewState(false);
  const item = moneyFunctionCards[index];
  const scopeRight = scope === item.scope;
  const functionsRight =
    functions.length === item.functions.length &&
    functions.every((value) => item.functions.includes(value));
  return markup`<p class="activity-premise">境外使用的范围与货币功能是两个不同维度。</p><div class="function-cases" aria-label="人民币使用情境">${renderContent(
    moneyFunctionCards.map(
      (card, i) =>
        markup`<button class=${ifDefined(index === i ? "selected" : "")} aria-pressed=${ifDefined(index === i)} @click=${() => {
          setIndex(i);
          setScope(null);
          setFunctions([]);
          setChecked(false);
        }}><span>${renderContent(i + 1)}</span>${renderContent(card.title)}</button>`,
    ),
  )}</div><p class="function-case-text">${renderContent(item.text)}</p><fieldset class="activity-choice"><legend>人民币在哪里使用？选一项。</legend><div class="scope-options">${renderContent(
    moneyScopes.map(
      (text, i) =>
        markup`<label><input type="radio" name="money-scope" .value=${live(i)} .checked=${live(scope === i)} @input=${() => {
          setScope(i);
          setChecked(false);
        }}>${renderContent(text)}</label>`,
    ),
  )}</div></fieldset><fieldset class="activity-choice"><legend>题干指出了哪些人民币功能？可多选。</legend><div class="function-options">${renderContent(
    moneyFunctions.map(
      (text, i) =>
        markup`<label><input type="checkbox" .checked=${live(functions.includes(i))} @input=${() => {
          setFunctions((previous) =>
            previous.includes(i)
              ? previous.filter((value) => value !== i)
              : [...previous, i],
          );
          setChecked(false);
        }}>${renderContent(text)}</label>`,
    ),
  )}</div></fieldset><div class="activity-actions"><button class="secondary-button" ?disabled=${scope === null || functions.length === 0} @click=${() => setChecked(true)}>核对两个维度</button></div>${renderContent(checked && markup`<div class="activity-feedback" role="status"><strong>${renderContent(scopeRight && functionsRight ? "使用范围与货币功能均正确" : "使用范围：" + moneyScopes[item.scope] + "；功能：" + item.functions.map((i) => moneyFunctions[i]).join("、"))}</strong><p>${renderContent(item.explanation)}</p></div>`)}<p class="activity-note">交易为教学设例。同一货币可以在一个环节计价、在另一个环节支付；本题按指定行为判断。</p>`;
});
const DigitalLiability = view(function DigitalLiability() {
  const [index, setIndex] = viewState(0);
  const [shared, setShared] = viewState(false);
  const item = digitalLiabilities[index];
  return markup`<p class="activity-premise">货币首先是一种权利关系。居民手中的纸币是中央银行负债，银行账户余额是商业银行负债；二者都以本国货币计价，却不是同一债务人的承诺。</p><div class="liability-choices" aria-label="货币负债类型">${renderContent(digitalLiabilities.map((option, i) => markup`<button aria-pressed=${ifDefined(index === i)} class=${ifDefined(index === i ? "selected" : "")} @click=${() => setIndex(i)}>${renderContent(option.title)}</button>`))}</div><div class="liability-diagram" aria-live="polite"><h4>货币负债层</h4><div class="liability-flow"><div><span>持有人</span><small>持有货币债权</small></div>${ArrowRight(
    {
      size: 20,
    },
  )}<div class="issuer-node"><span>${renderContent(item.issuer)}</span><small>承担货币负债</small></div></div><dl class="liability-facts"><div><dt>持有人权利</dt><dd>${renderContent(item.claim)}</dd></div><div><dt>信用基础</dt><dd>${renderContent(item.backing)}</dd></div><div><dt>流动性安排</dt><dd>${renderContent(item.liquidity)}</dd></div></dl><p>${renderContent(item.text)}</p><h4>支付轨道层</h4><fieldset class="activity-choice"><legend>保持上述债务人不变，切换账本安排</legend><div class="segmented"><button aria-pressed=${ifDefined(!shared)} class=${ifDefined(!shared ? "active" : "")} @click=${() => setShared(false)}>集中账本</button><button aria-pressed=${ifDefined(shared)} class=${ifDefined(shared ? "active" : "")} @click=${() => setShared(true)}>共享账本</button></div></fieldset><div class=${ifDefined("rail-diagram" + (shared ? " shared" : ""))}><span>付款人</span>${ArrowRight(
    {
      size: 16,
    },
  )}<div><strong>${renderContent(shared ? "共享账本与验证机制" : "集中记账系统")}</strong><small>${renderContent(shared ? "参与节点按既定规则验证与更新记录" : "运营机构核验指令与更新记录")}</small></div>${ArrowRight(
    {
      size: 16,
    },
  )}<span>收款人</span></div><p class="activity-note">${renderContent(shared && item.id === "bank" ? "这一组合对应代币化商业银行存款：账本形式改变，债务人仍是商业银行。" : shared ? "共享账本可以改变记录和转移方式。信用与赎回权仍须查看上面的负债关系。" : "集中记账不直接决定发行人，也不直接决定货币的计价单位。")}</p></div><p class="activity-note">技术安排用于对照两层关系，不指定真实平台。比特币持有人并不拥有对某个发行人的一比一兑付请求权。</p>`;
});
const startingConditions = {
  thirdParty: false,
  deepMarkets: false,
  liquidity: false,
  connected: true,
};
const conditionLabels = [
  [
    "thirdParty",
    "持续的第三方贸易使用",
    "另一种货币用于境外企业之间的计价，并有相应支付、兑换与套保服务。",
  ],
  [
    "deepMarkets",
    "较深的资产与融资市场",
    "境外余额可以继续用于投资，银行能够持续做市和融资。",
  ],
  ["liquidity", "压力时期的公共流动性", "危机时能取得相应币种的流动性支持。"],
  [
    "connected",
    "网络之间能够衔接",
    "兑换、抵押品和结算安排能够连接区域与全球市场。",
  ],
];
const FutureScenarios = view(function FutureScenarios() {
  const [conditions, setConditions] = viewState({
    ...startingConditions,
  });
  const scenario = monetaryScenario(conditions);
  const complete = completeRegionalCentre(conditions);
  return markup`<p class="activity-instruction">改变货币使用、资产市场和流动性条件，比较讲义中的三种情景。</p><div class="scenario-presets" aria-label="体系情景的条件组合"><button @click=${() =>
    setConditions({
      ...startingConditions,
    })}>美元主导</button><button @click=${() =>
    setConditions({
      thirdParty: true,
      deepMarkets: true,
      liquidity: true,
      connected: true,
    })}>区域中心</button><button @click=${() =>
    setConditions({
      thirdParty: true,
      deepMarkets: false,
      liquidity: false,
      connected: false,
    })}>分散网络</button></div><div class="scenario-conditions">${renderContent(
    conditionLabels.map(
      ([key, title, text]) =>
        markup`<label><input type="checkbox" .checked=${live(conditions[key])} @input=${(
          event,
        ) =>
          setConditions((previous) => ({
            ...previous,
            [key]: event.target.checked,
          }))}><span><strong>${renderContent(title)}</strong><small>${renderContent(text)}</small></span></label>`,
    ),
  )}</div><div class="scenario-result" role="status"><span>这些条件更接近</span><h4>${renderContent(scenario)} · ${renderContent(futureScenarios[scenario].title)}</h4><p>${renderContent(futureScenarios[scenario].text)}</p><div class="activity-feedback"><strong>${renderContent(scenario === "B" ? (complete ? "计价、融资、资产持有与流动性形成联系" : "第二中心首先体现为某项功能") : scenario === "C" ? "各网络之间的衔接较弱" : "其他货币尚未形成持续的第三方使用")}</strong><p>${renderContent(scenario === "B" ? (complete ? "较完整的区域中心需要这些条件同时支持。它仍可以与美元的全球优势并存。" : "第三方贸易使用可以支持计价中心；资产市场与危机流动性尚未齐备时，不能直接判断已形成完整的区域货币中心。") : scenario === "C" ? "需要分别核对每条网络的兑换、融资、抵押品与危机支持。局部市场较深，也不自动消除网络之间的障碍。" : conditions.connected ? "支付、技术或资产市场的改善，需要转化为境外主体持续的实际使用。" : "支付轨道分开可以先于货币使用变化。只有备用平台，不足以判断已形成多货币中心。")}</p></div></div><p class="activity-note">这是对讲义情景条件的归类，不设转换概率或预测年份。</p>`;
});
const ReadingActivity = view(function ReadingActivity({ kind }) {
  return markup`<section class="reading-activity" id=${ifDefined("activity-" + kind)} data-activity=${ifDefined(kind)} aria-labelledby=${ifDefined("activity-title-" + kind)}><header><h3 id=${ifDefined("activity-title-" + kind)}>${renderContent(activityTitles[kind])}</h3></header><div class="activity-body">${renderContent(kind === "history" ? History({}) : kind === "ledger-sort" ? LedgerSort({}) : kind === "policy-order" ? PolicyOrder({}) : kind === "repo-run" ? RepoRun({}) : kind === "safety-net" ? SafetyNet({}) : kind === "money-functions" ? MoneyFunctions({}) : kind === "digital-liability" ? DigitalLiability({}) : FutureScenarios({}))}</div></section>`;
});
export default ReadingActivity;
