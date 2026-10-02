import { useState } from 'react'
import { ArrowDown, ArrowRight, Check, ChevronRight } from 'lucide-react'
import type { ExperimentId, LessonId } from '../content'
import { money, Slider, Reset, Tabs } from './ExperimentUI'
import { Arbitrage, Prices, Parity, Overshoot, Debt, Funding, Hedge, Stablecoin, Sharing, Trilemma, Iip } from './AdvancedExperiments'

function Accounts() {
  const [stage, setStage] = useState(0)
  const titles = ['交付货物', '收到美元', '境内结汇']
  return <>
    <div className="experiment-heading"><h2>国际收支分录</h2><p>选择交易时点，查看对应分录。</p></div>
    <div className="step-controls" aria-label="订单时点">{titles.map((title, i) => <button key={title} className={stage === i ? 'active' : ''} aria-pressed={stage === i} onClick={() => setStage(i)}><span>{i + 1}</span>{title}</button>)}</div>
    <div className="transaction-route" key={stage}>
      <div><span>{stage === 1 ? '美国客户' : '中国出口企业'}</span><small>{stage === 0 ? '交付货物' : stage === 1 ? '支付货款' : '卖出美元资产'}</small></div>
      <ArrowRight size={24} />
      <div><span>{stage === 2 ? '境内商业银行' : stage === 0 ? '美国客户' : '中国出口企业'}</span><small>{stage === 0 ? '形成付款义务' : stage === 1 ? '持有境外存款' : '接收美元资产'}</small></div>
    </div>
    <div className="ledger" aria-live="polite">
      <div className="ledger-title"><span>{stage === 2 ? '居民之间的资产转让' : '本时点的国际收支记录'}</span><small>万美元</small></div>
      {stage === 0 ? <>
        <div className="ledger-entry"><span>经常账户<small>货物出口</small></span><strong>+10</strong></div>
        <div className="ledger-entry"><span>金融账户<small>贸易信贷资产净获得</small></span><strong>+10</strong></div>
      </> : stage === 1 ? <>
        <div className="ledger-entry"><span>金融账户<small>贸易信贷资产净获得</small></span><strong>−10</strong></div>
        <div className="ledger-entry"><span>金融账户<small>境外存款资产净获得</small></span><strong>+10</strong></div>
      </> : <div className="ledger-entry"><span>标准国际收支<small>双方都是中国居民</small></span><strong>不新增</strong></div>}
    </div>
    <p className="result-explanation" aria-live="polite">{stage === 0 ? '交货时经济所有权转移。货物出口和贸易信贷资产增加同时入账，金额均为 10 万美元。' : stage === 1 ? '收款时，贸易信贷资产减少 10 万美元，境外存款增加 10 万美元。金融账户净额为零。' : '企业将美元资产转让给境内银行，交易双方均为居民，不新增标准国际收支交易。'}</p>
    <div className="experiment-foot">沿用讲义 BPM6 符号：金融账户以净贷出为正。忽略费用、估值变化及其他交易。</div>
  </>
}

const transmissions = {
  'floating-money': {
    steps: ['央行增加货币供给', '短期利率下降', '资本配置转向外币资产', '本币贬值，净出口增加'],
    result: '在模型条件下，货币扩张降低利率，增加投资；本币贬值增加净出口，总需求上升。',
    triangle: ['资本自由流动', '货币政策自主'], constraint: '汇率稳定受到约束'
  },
  'fixed-money': {
    steps: ['央行增加货币供给', '利率下降引起贬值压力', '央行售汇、收回本币', '初始货币扩张被抵消'],
    result: '央行干预抵消货币扩张，本国利率回到世界利率。',
    triangle: ['汇率稳定', '资本自由流动'], constraint: '货币政策自主受到约束'
  },
  'floating-fiscal': {
    steps: ['政府增加购买', '需求与利率上升压力', '资本流入，本币升值', '净出口下降，削弱财政扩张'],
    result: '本币升值引起净出口下降，抵消部分财政扩张。资本完全流动是完全挤出的极限条件。',
    triangle: ['资本自由流动', '货币政策自主'], constraint: '汇率稳定受到约束'
  },
  'fixed-fiscal': {
    steps: ['政府增加购买', '利率上升引起升值压力', '央行购汇、投放本币', '货币供给配合需求扩张'],
    result: '央行购汇阻止本币升值，货币供给增加，产出上升。',
    triangle: ['汇率稳定', '资本自由流动'], constraint: '货币政策自主受到约束'
  }
}

function PolicyDiagram({ regime, policy }: { regime: 'floating' | 'fixed'; policy: 'money' | 'fiscal' }) {
  const temporary = regime === 'fixed' && policy === 'money'
  const isIntercept = temporary ? 9 : policy === 'fiscal' ? (regime === 'fixed' ? 11 : 10.4) : 10
  const lmIntercept = temporary ? -1.5 : policy === 'money' ? -1.5 : regime === 'fixed' ? -1 : 0
  const finalY = temporary ? 6 : (isIntercept - lmIntercept) / 1.5
  const finalI = temporary ? 3 : finalY * 0.5 + lmIntercept
  const px = (y: number) => 36 + y / 12 * 276
  const py = (i: number) => 183 - i / 9 * 153
  const curve = (intercept: number, slope: number) => [slope > 0 ? Math.max(2, -intercept / slope) : 2, slope < 0 ? Math.min(10, -intercept / slope) : 10].map(y => px(y) + ',' + py(intercept + slope * y)).join(' ')
  return <figure className="model-chart policy-chart"><figcaption>IS–LM 调整示意</figcaption><svg viewBox="0 0 340 223" role="img" aria-label={temporary ? '货币扩张暂时推动 LM 右移，维持固定汇率的干预使 LM 回到原位。' : '新均衡的产出上升；' + (finalI > 3 ? '利率上升。' : finalI < 3 ? '利率下降。' : '利率不变。')}>
    <title>IS–LM 调整示意</title><line x1="36" y1="183" x2="321" y2="183" className="plot-axis"/><line x1="36" y1="183" x2="36" y2="22" className="plot-axis"/><text x="24" y="19">i</text><text x="322" y="201">Y</text>
    <polyline points={curve(9,-1)} className="policy-original"/><polyline points={curve(0,0.5)} className="policy-original"/><text x={px(9)} y={py(0)+18}>IS₀</text><text x={px(10)} y={py(5)-10}>LM₀</text>
    <polyline points={curve(isIntercept,-1)} className={temporary ? 'policy-original' : 'plot-line'}/><polyline points={curve(lmIntercept,0.5)} className={temporary ? 'plot-reference' : 'plot-line'}/>
    <circle cx={px(6)} cy={py(3)} r="3" className="policy-initial-point"/><text x={px(6)-17} y={py(3)-10}>E₀</text><circle cx={px(finalY)} cy={py(finalI)} r="4" className="plot-point"/><text x={px(finalY)+8} y={py(finalI)+17}>{temporary ? 'E₁ = E₀' : 'E₁'}</text>
    <text x="40" y="219">{temporary ? '虚线：暂时的货币扩张' : '灰线：初始状态；绿色：调整后的曲线'}</text>
  </svg><p className="plot-key">曲线用于表示方向，斜率与位移不代表实际估计。</p></figure>
}

function Policy() {
  const [regime, setRegime] = useState<'floating' | 'fixed'>('floating')
  const [policy, setPolicy] = useState<'money' | 'fiscal'>('money')
  const [restricted, setRestricted] = useState(false)
  const selected = transmissions[(regime + '-' + policy) as keyof typeof transmissions]
  return <>
    <div className="experiment-heading"><h2>汇率制度与政策传导</h2><p>比较两种制度下的货币扩张与财政扩张。</p></div>
    <fieldset className="choice-field"><legend>汇率制度</legend><div className="segmented">{[['floating', '浮动汇率'], ['fixed', '固定汇率']].map(([id, name]) => <button key={id} className={regime === id ? 'active' : ''} aria-pressed={regime === id} onClick={() => setRegime(id as typeof regime)}>{name}</button>)}</div></fieldset>
    <fieldset className="choice-field"><legend>扩张政策</legend><div className="segmented">{[['money', '增加货币供给'], ['fiscal', '增加政府购买']].map(([id, name]) => <button key={id} className={policy === id ? 'active' : ''} aria-pressed={policy === id} onClick={() => setPolicy(id as typeof policy)}>{name}</button>)}</div></fieldset>
    <PolicyDiagram regime={regime} policy={policy} />
    <ol className="transmission" key={regime + policy} aria-live="polite">{selected.steps.map((step, i) => <li key={step}><span className="chain-number">{i + 1}</span><span>{step}</span>{i < 3 && <ArrowDown size={13} className="chain-arrow" />}</li>)}</ol>
    <p className="result-explanation">{selected.result}</p>
    <details className="triangle-detail"><summary>三元悖论<ChevronRight size={15} /></summary><div className="triangle-summary">{selected.triangle.map(item => <span key={item}><Check size={14} />{item}</span>)}<strong>{selected.constraint}</strong></div><label className="check-field"><input type="checkbox" checked={restricted} onChange={e => setRestricted(e.target.checked)} />考虑资本流动管理</label><p>{restricted ? '资本流动管理限制跨境资产转换，国内外利差可能持续。上述完全流动条件下的传导不再直接适用。' : '以上传导假设资本自由流动、资产可替代且风险溢价给定。'}</p></details>
    <div className="experiment-foot">模型条件：小型开放经济、短期价格给定，风险与预期不变。</div>
  </>
}

function Crisis() {
  const [rate, setRate] = useState(7)
  const [assetCurrency, setAssetCurrency] = useState<'cny' | 'usd'>('cny')
  const [renewal, setRenewal] = useState(false)
  const debt = 100000 * rate
  const asset = assetCurrency === 'cny' ? 800000 : (800000 / 7) * rate
  const equity = asset - debt
  return <>
    <div className="experiment-heading"><h2>货币错配与净资产</h2><p>借入 10 万美元，初始汇率 7.00，加上 10 万元自有资金，购入价值 80 万元的长期资产。本例单独计算，不计入前述出口应收款。</p></div>
    <fieldset className="choice-field"><legend>资产与收入的计价货币</legend><div className="segmented"><button aria-pressed={assetCurrency === 'cny'} className={assetCurrency === 'cny' ? 'active' : ''} onClick={() => setAssetCurrency('cny')}>人民币</button><button aria-pressed={assetCurrency === 'usd'} className={assetCurrency === 'usd' ? 'active' : ''} onClick={() => setAssetCurrency('usd')}>美元</button></div></fieldset>
    <Slider label="人民币／美元汇率" amount={rate} unit="CNY / USD" min={6} max={9} step={0.1} onChange={setRate} />
    <dl className="balance-sheet" aria-live="polite"><div><dt>资产的人民币价值</dt><dd>¥ {money(asset)}</dd></div><div><dt>美元债务折合人民币</dt><dd>¥ {money(debt)}</dd></div><div className={equity < 0 ? 'negative-result' : 'accent-result'}><dt>简化净资产</dt><dd>¥ {money(equity)}</dd></div></dl>
    <p className="result-explanation">{assetCurrency === 'cny' ? '人民币资产价值不变。人民币贬值提高美元负债的人民币价值，净资产减少。' : '资产与负债均以美元计价，人民币价值随汇率同比例变化。币种匹配不消除资产的经营风险或信用风险。'}</p>
    <label className="check-field risk-toggle"><input type="checkbox" checked={renewal} onChange={e => setRenewal(e.target.checked)} />短期债到期，贷款人不再续借</label>
    {renewal && <div className="risk-feedback" role="status">到期须筹集 10 万美元偿债。净资产为正不保证能够及时变现；长期资产与短期负债仍有期限错配。</div>}
    <Reset onClick={() => { setRate(7); setAssetCurrency('cny'); setRenewal(false) }} />
    <div className="experiment-foot">仅展示汇率换算与到期压力。忽略利息、资产价格变化、现金储备与其他债务。</div>
  </>
}

const paymentLayers = [
  { title: '交易义务', usd: '合同约定付款人、收款人、金额 10 万美元及付款期限。', cny: '双方重新约定人民币金额和期限。客户需要安排人民币资金或换汇。' },
  { title: '支付报文', usd: '银行发送并认证付款指令。SWIFT 属于报文网络，不承担资金结算。', cny: '银行可使用相应的报文通道。使用人民币，不意味着所有指令必须走同一个通信网络。' },
  { title: '清算', usd: '银行或清算机构核对付款，计算应收应付；轧差可减少银行间所需划转的结算资产。', cny: '人民币代理行或相关清算安排处理银行间头寸。路径取决于参与资格和开户关系。' },
  { title: '结算', usd: '相应美元账户完成划转，收款银行贷记客户账户。实际路径可能涉及代理行或银行内部账簿。', cny: '相应人民币结算资产完成划转。相关银行可通过 CIPS 或其他适用安排完成跨境支付。' }
]

function System({ initialCurrency = 'usd' }: { initialCurrency?: 'usd' | 'cny' }) {
  const [currency, setCurrency] = useState<'usd' | 'cny'>(initialCurrency)
  const [restriction, setRestriction] = useState<'none' | 'message' | 'clearing' | 'settlement' | 'custody'>('none')
  const [layer, setLayer] = useState(0)
  return <>
    <div className="experiment-heading"><h2>跨境支付的四个环节</h2><p>选择合同币种和支付环节，查看对应安排。</p></div>
    <div className="segmented"><button className={currency === 'usd' ? 'active' : ''} aria-pressed={currency === 'usd'} onClick={() => setCurrency('usd')}>美元合同</button><button className={currency === 'cny' ? 'active' : ''} aria-pressed={currency === 'cny'} onClick={() => setCurrency('cny')}>人民币合同</button></div>
    <div className="payment-route">{paymentLayers.map((item, i) => <button key={item.title} className={i === layer ? 'selected' : ''} aria-pressed={i === layer} onClick={() => setLayer(i)}><span className="chain-number">{i + 1}</span><span>{item.title}</span><ChevronRight size={16} /></button>)}</div>
    <div className="payment-description" key={currency + layer} aria-live="polite"><h3>{paymentLayers[layer].title}</h3><p>{paymentLayers[layer][currency]}</p></div>
    <div className="custody-note"><span>资产控制</span><strong>托管</strong><p>托管机构记录和控制证券等金融资产，影响出售、质押、付息与划转。托管与上述支付环节并行。</p></div>
    <label className="select-field"><span>限制发生在哪里</span><select value={restriction} onChange={event => setRestriction(event.target.value as typeof restriction)}><option value="none">没有额外限制</option><option value="message">报文网络接入</option><option value="clearing">清算参与资格</option><option value="settlement">结算账户或代理行</option><option value="custody">托管资产冻结</option></select></label>
    {restriction !== 'none' && <div className="risk-feedback" role="status">{restriction === 'message' ? '失去报文网络接入会妨碍指令传递，但不等于账户资金自动被冻结。替代报文也需要银行接受和认证。' : restriction === 'clearing' ? '无法参与原清算安排时，需要寻找合法可行的参与机构或替代路径；这并不保证结算账户可以使用。' : restriction === 'settlement' ? '结算账户或代理行关系受限，会妨碍资金最终划转。报文送达也不能保证收款。' : '托管资产冻结会限制相关证券或储备资产的转让、出售及使用。它与支付报文是否送达是不同问题。'} 更换合同币种并不自动改变机构受到的限制；仍须核对参与银行、资产和适用规则。</div>}
    <Reset onClick={() => { setCurrency(initialCurrency); setLayer(0); setRestriction('none') }} />
    <div className="experiment-foot">路径示意。实际安排取决于开户关系、代理行网络和支付系统规则。</div>
  </>
}

function AccountsWithValuation() {
  const [tab, setTab] = useState<'ledger' | 'valuation'>('ledger')
  return <><Tabs value={tab} onChange={setTab} label="国际账户计算" items={[["ledger", "复式记账"], ["valuation", "估值与净头寸"]]} /><div className="calculator-body">{tab === 'ledger' ? <Accounts /> : <Iip />}</div></>
}

const experimentNames: Record<ExperimentId, string> = { accounts: '国际账户', arbitrage: '三角套利', prices: '价格与汇率', parity: '利率平价', overshoot: '汇率超调', policy: '政策传导', sharing: '风险分担', trilemma: '三元悖论', crisis: '资产负债表', debt: '债务计算', funding: '融资成本', hedge: '套期保值', payment: '跨境支付', stablecoin: '储备与赎回' }

export default function Experiment({ kinds, topicId }: { kinds: ExperimentId[]; topicId: LessonId }) {
  const [kind, setKind] = useState<ExperimentId>(kinds[0])
  const content = kind === 'accounts' ? <AccountsWithValuation /> : kind === 'arbitrage' ? <Arbitrage /> : kind === 'prices' ? <Prices /> : kind === 'parity' ? <Parity /> : kind === 'overshoot' ? <Overshoot /> : kind === 'policy' ? <Policy /> : kind === 'sharing' ? <Sharing /> : kind === 'trilemma' ? <Trilemma /> : kind === 'crisis' ? <Crisis /> : kind === 'debt' ? <Debt /> : kind === 'funding' ? <Funding /> : kind === 'hedge' ? <Hedge /> : kind === 'stablecoin' ? <Stablecoin /> : <System initialCurrency={topicId === 'renminbi' ? 'cny' : 'usd'} />
  return <div className="experiment-panel" data-experiment={kind}>{kinds.length > 1 && <Tabs value={kind} onChange={setKind} label="本篇交互" items={kinds.map(id => [id, experimentNames[id]])} />}<div className={kinds.length > 1 ? 'calculator-body' : ''} key={kind}>{content}</div></div>
}
