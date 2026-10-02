import { useState } from 'react'
import { ArrowDown, ArrowRight, Check, ChevronRight, RotateCcw } from 'lucide-react'
import type { LessonId } from '../content'

const money = (n: number) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(n)
const value = (n: number) => n.toFixed(2)

function Slider({ label, amount, unit, min, max, step = 1, onChange }: { label: string; amount: number; unit?: string; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return <label className="range-field">
    <span className="range-heading"><span>{label}</span><strong>{step < 1 ? value(amount) : amount}<small>{unit}</small></strong></span>
    <input type="range" min={min} max={max} step={step} value={amount} onChange={e => onChange(Number(e.target.value))} />
    <span className="range-limits"><span>{min}</span><span>{max}</span></span>
  </label>
}

function Reset({ onClick }: { onClick: () => void }) {
  return <button className="text-button reset" onClick={onClick}><RotateCcw size={14} />恢复初始值</button>
}

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

function Exchange() {
  const [tab, setTab] = useState('hedge')
  const [spot, setSpot] = useState(6.5)
  const [forward, setForward] = useState(6.95)
  const [ratio, setRatio] = useState(100)
  const [priceCN, setPriceCN] = useState(140)
  const [priceUS, setPriceUS] = useState(20)
  const [cnyInterest, setCnyInterest] = useState(2)
  const [usdInterest, setUsdInterest] = useState(5)
  const cash = 100000 * (ratio / 100 * forward + (1 - ratio / 100) * spot)
  const cip = 7 * (1 + cnyInterest / 100 * 0.25) / (1 + usdInterest / 100 * 0.25)
  return <>
    <div className="experiment-heading"><h2>汇率与套期保值计算</h2><p>订单金额 10 万美元，三个月后收款。</p></div>
    <div className="segmented" aria-label="汇率实验">{[['hedge', '远期套期'], ['ppp', 'PPP'], ['cip', '远期定价']].map(([id, text]) => <button key={id} aria-pressed={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{text}</button>)}</div>
    {tab === 'hedge' ? <div className="experiment-content">
      <Slider label="收款日即期汇率" amount={spot} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setSpot} />
      <Slider label="约定的远期汇率" amount={forward} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setForward} />
      <Slider label="远期套期比例" amount={ratio} unit="%" min={0} max={100} step={25} onChange={setRatio} />
      <div className="cash-results" aria-live="polite">
        <div><span>不套期</span><strong><small>¥</small>{money(100000 * spot)}</strong></div>
        <div className="accent-result"><span>套期后的人民币收入</span><strong><small>¥</small>{money(cash)}</strong></div>
      </div>
      <p className="result-explanation">{ratio === 100 ? '全部套期时，改变到期即期汇率，人民币收入不再变化。' : ratio === 0 ? '未套期时，汇率每变动 0.10 元，人民币收入变化 1 万元。' : '只有未套期部分随到期即期汇率变化。'} 套期结果与不套期结果的差额取决于到期即期汇率。</p>
      <Reset onClick={() => { setSpot(6.5); setForward(6.95); setRatio(100) }} />
    </div> : tab === 'ppp' ? <div className="experiment-content">
      <p>假设两国消费篮子的商品、数量及权重相同。</p>
      <Slider label="中国一篮子商品价格" amount={priceCN} unit="人民币" min={100} max={200} onChange={setPriceCN} />
      <Slider label="美国一篮子商品价格" amount={priceUS} unit="美元" min={15} max={30} onChange={setPriceUS} />
      <div className="formula">E<sub>PPP</sub> = P / P*</div>
      <div className="single-result" aria-live="polite"><span>绝对购买力平价基准</span><strong>{value(priceCN / priceUS)}<small>CNY / USD</small></strong></div>
      <p className="result-explanation">计算值为该消费篮子的隐含 PPP 汇率。运输成本、税费、非贸易品及篮子差异均可能使市场汇率偏离。</p>
      <Reset onClick={() => { setPriceCN(140); setPriceUS(20) }} />
    </div> : <div className="experiment-content">
      <p>即期汇率设为 7.00，期限为三个月。比较同期限存款与远期锁定的终值。</p>
      <Slider label="人民币年化利率" amount={cnyInterest} unit="%" min={0} max={8} step={0.25} onChange={setCnyInterest} />
      <Slider label="美元年化利率" amount={usdInterest} unit="%" min={0} max={8} step={0.25} onChange={setUsdInterest} />
      <div className="formula small-formula">F = E × (1 + i<sub>CNY</sub>T) / (1 + i<sub>USD</sub>T)</div>
      <div className="single-result" aria-live="polite"><span>CIP 隐含的三个月远期</span><strong>{cip.toFixed(4)}<small>CNY / USD</small></strong></div>
      <p className="result-explanation">采用简单计息，T = 0.25。公式给出无套利条件下的远期价格，不是对到期即期汇率的预测。</p>
      <Reset onClick={() => { setCnyInterest(2); setUsdInterest(5) }} />
    </div>}
    <div className="experiment-foot">全部参数为教学假设。未计买卖价差、授信、手续费、违约和结算差异。</div>
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

function Policy() {
  const [regime, setRegime] = useState<'floating' | 'fixed'>('floating')
  const [policy, setPolicy] = useState<'money' | 'fiscal'>('money')
  const [restricted, setRestricted] = useState(false)
  const selected = transmissions[(regime + '-' + policy) as keyof typeof transmissions]
  return <>
    <div className="experiment-heading"><h2>汇率制度与政策传导</h2><p>比较两种制度下的货币扩张与财政扩张。</p></div>
    <fieldset className="choice-field"><legend>汇率制度</legend><div className="segmented">{[['floating', '浮动汇率'], ['fixed', '固定汇率']].map(([id, name]) => <button key={id} className={regime === id ? 'active' : ''} aria-pressed={regime === id} onClick={() => setRegime(id as typeof regime)}>{name}</button>)}</div></fieldset>
    <fieldset className="choice-field"><legend>扩张政策</legend><div className="segmented">{[['money', '增加货币供给'], ['fiscal', '增加政府购买']].map(([id, name]) => <button key={id} className={policy === id ? 'active' : ''} aria-pressed={policy === id} onClick={() => setPolicy(id as typeof policy)}>{name}</button>)}</div></fieldset>
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

function System() {
  const [currency, setCurrency] = useState<'usd' | 'cny'>('usd')
  const [layer, setLayer] = useState(0)
  return <>
    <div className="experiment-heading"><h2>跨境支付的四个环节</h2><p>选择合同币种和支付环节，查看对应安排。</p></div>
    <div className="segmented"><button className={currency === 'usd' ? 'active' : ''} aria-pressed={currency === 'usd'} onClick={() => setCurrency('usd')}>美元合同</button><button className={currency === 'cny' ? 'active' : ''} aria-pressed={currency === 'cny'} onClick={() => setCurrency('cny')}>人民币合同</button></div>
    <div className="payment-route">{paymentLayers.map((item, i) => <button key={item.title} className={i === layer ? 'selected' : ''} aria-pressed={i === layer} onClick={() => setLayer(i)}><span className="chain-number">{i + 1}</span><span>{item.title}</span><ChevronRight size={16} /></button>)}</div>
    <div className="payment-description" key={currency + layer} aria-live="polite"><h3>{paymentLayers[layer].title}</h3><p>{paymentLayers[layer][currency]}</p></div>
    <div className="custody-note"><span>资产控制</span><strong>托管</strong><p>托管机构记录和控制证券等金融资产，影响出售、质押、付息与划转。托管与上述支付环节并行。</p></div>
    <div className="experiment-foot">路径示意。实际安排取决于开户关系、代理行网络和支付系统规则。</div>
  </>
}

export default function Experiment({ lesson }: { lesson: LessonId }) {
  return <div className="experiment-panel">{lesson === 'accounts' ? <Accounts /> : lesson === 'exchange' ? <Exchange /> : lesson === 'policy' ? <Policy /> : lesson === 'crisis' ? <Crisis /> : <System />}</div>
}
