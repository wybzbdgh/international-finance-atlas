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
  return <button className="text-button reset" onClick={onClick}><RotateCcw size={14} />恢复初始情景</button>
}

function Accounts() {
  const [stage, setStage] = useState(0)
  const titles = ['交付货物', '收到美元', '境内结汇']
  return <>
    <div className="experiment-heading"><h2>这笔订单怎样记账</h2><p>依次选择三个时点，查看资产怎样变化。</p></div>
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
    <p className="result-explanation" aria-live="polite">{stage === 0 ? '假设经济所有权在此时转移。出口已经发生，应收款的形成是对应的金融记录，不能等到收款后才记账。' : stage === 1 ? '货物出口不重复记账。对客户的债权减少，境外存款增加；两项资产变动的净额为零。' : '外部资产在居民部门之间换手。银行是否继续卖给央行，是另一个安排；出口不会自动等额增加储备。'}</p>
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
    <div className="experiment-heading"><h2>先试算，再读理论</h2><p>订单金额 10 万美元，三个月后收款。</p></div>
    <div className="segmented" aria-label="汇率实验">{[['hedge', '订单锁汇'], ['ppp', '购买力'], ['cip', '远期定价']].map(([id, text]) => <button key={id} aria-pressed={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{text}</button>)}</div>
    {tab === 'hedge' ? <div className="experiment-content">
      <Slider label="收款日即期汇率" amount={spot} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setSpot} />
      <Slider label="约定的远期汇率" amount={forward} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setForward} />
      <Slider label="远期套期比例" amount={ratio} unit="%" min={0} max={100} step={25} onChange={setRatio} />
      <div className="cash-results" aria-live="polite">
        <div><span>不套期</span><strong><small>¥</small>{money(100000 * spot)}</strong></div>
        <div className="accent-result"><span>套期后的人民币收入</span><strong><small>¥</small>{money(cash)}</strong></div>
      </div>
      <p className="result-explanation">{ratio === 100 ? '全部套期时，改变到期即期汇率，人民币收入不再变化。' : ratio === 0 ? '未套期时，汇率每变动 0.10 元，人民币收入变化 1 万元。' : '只有未套期部分随到期即期汇率变化。'} 收入增加或减少都是相对比较；锁汇并不保证收入总是更高。</p>
      <Reset onClick={() => { setSpot(6.5); setForward(6.95); setRatio(100) }} />
    </div> : tab === 'ppp' ? <div className="experiment-content">
      <p>假设两地的一篮子商品完全相同，先比较价格。</p>
      <Slider label="中国一篮子商品价格" amount={priceCN} unit="人民币" min={100} max={200} onChange={setPriceCN} />
      <Slider label="美国一篮子商品价格" amount={priceUS} unit="美元" min={15} max={30} onChange={setPriceUS} />
      <div className="formula">E<sub>PPP</sub> = P / P*</div>
      <div className="single-result" aria-live="polite"><span>绝对购买力平价基准</span><strong>{value(priceCN / priceUS)}<small>CNY / USD</small></strong></div>
      <p className="result-explanation">这是商品价格对应的理论基准。现实中运输成本、税费、非贸易品和篮子差异会造成偏离，不能据此断言市场汇率会立即回到这个数字。</p>
      <Reset onClick={() => { setPriceCN(140); setPriceUS(20) }} />
    </div> : <div className="experiment-content">
      <p>即期汇率设为 7.00，期限为三个月。比较同期限存款与远期锁定的终值。</p>
      <Slider label="人民币年化利率" amount={cnyInterest} unit="%" min={0} max={8} step={0.25} onChange={setCnyInterest} />
      <Slider label="美元年化利率" amount={usdInterest} unit="%" min={0} max={8} step={0.25} onChange={setUsdInterest} />
      <div className="formula small-formula">F = E × (1 + i<sub>CNY</sub>T) / (1 + i<sub>USD</sub>T)</div>
      <div className="single-result" aria-live="polite"><span>CIP 隐含的三个月远期</span><strong>{cip.toFixed(4)}<small>CNY / USD</small></strong></div>
      <p className="result-explanation">这里采用简单计息，T = 0.25。在这个无摩擦基准下，美元利率较高，对人民币远期贴水。这个价格由利差约束，不能直接当作未来即期汇率的预报。</p>
      <Reset onClick={() => { setCnyInterest(2); setUsdInterest(5) }} />
    </div>}
    <div className="experiment-foot">全部参数为教学假设。未计买卖价差、授信、手续费、违约和结算差异。</div>
  </>
}

const transmissions = {
  'floating-money': {
    steps: ['央行增加货币供给', '短期利率承压下降', '资本配置转向外币资产', '本币贬值，净出口获得支持'],
    result: '汇率可以调整。在其他条件不变时，货币扩张通过投资与净出口支持需求。',
    triangle: ['资本自由流动', '货币政策自主'], constraint: '汇率稳定受到约束'
  },
  'fixed-money': {
    steps: ['央行增加货币供给', '利率下降引起贬值压力', '守汇率：售出外汇、收回本币', '初始货币扩张被抵消'],
    result: '在可信固定汇率与资本完全流动的极限基准下，央行难以独立维持较低利率。',
    triangle: ['汇率稳定', '资本自由流动'], constraint: '货币政策自主受到约束'
  },
  'floating-fiscal': {
    steps: ['政府增加购买', '需求与利率上升压力', '资本流入，本币升值', '净出口下降，削弱财政扩张'],
    result: '汇率升值会挤出部分净出口。挤出有多强，取决于资本流动和贸易对价格的反应。',
    triangle: ['资本自由流动', '货币政策自主'], constraint: '汇率稳定受到约束'
  },
  'fixed-fiscal': {
    steps: ['政府增加购买', '利率上升引起升值压力', '守汇率：购入外汇、投放本币', '货币供给配合需求扩张'],
    result: '央行干预阻止升值，本币投放支持需求扩张。这仍是其他条件给定的短期基准。',
    triangle: ['汇率稳定', '资本自由流动'], constraint: '货币政策自主受到约束'
  }
}

function Policy() {
  const [regime, setRegime] = useState<'floating' | 'fixed'>('floating')
  const [policy, setPolicy] = useState<'money' | 'fiscal'>('money')
  const [restricted, setRestricted] = useState(false)
  const selected = transmissions[(regime + '-' + policy) as keyof typeof transmissions]
  return <>
    <div className="experiment-heading"><h2>把政策传导走一遍</h2><p>选择汇率制度，再选择一种扩张政策。</p></div>
    <fieldset className="choice-field"><legend>汇率制度</legend><div className="segmented">{[['floating', '浮动汇率'], ['fixed', '固定汇率']].map(([id, name]) => <button key={id} className={regime === id ? 'active' : ''} aria-pressed={regime === id} onClick={() => setRegime(id as typeof regime)}>{name}</button>)}</div></fieldset>
    <fieldset className="choice-field"><legend>扩张政策</legend><div className="segmented">{[['money', '增加货币供给'], ['fiscal', '增加政府购买']].map(([id, name]) => <button key={id} className={policy === id ? 'active' : ''} aria-pressed={policy === id} onClick={() => setPolicy(id as typeof policy)}>{name}</button>)}</div></fieldset>
    <ol className="transmission" key={regime + policy} aria-live="polite">{selected.steps.map((step, i) => <li key={step}><span className="chain-number">{i + 1}</span><span>{step}</span>{i < 3 && <ArrowDown size={13} className="chain-arrow" />}</li>)}</ol>
    <p className="result-explanation">{selected.result}</p>
    <details className="triangle-detail"><summary>对应的不可能三角<ChevronRight size={15} /></summary><div className="triangle-summary">{selected.triangle.map(item => <span key={item}><Check size={14} />{item}</span>)}<strong>{selected.constraint}</strong></div><label className="check-field"><input type="checkbox" checked={restricted} onChange={e => setRestricted(e.target.checked)} />考虑资本流动管理</label><p>{restricted ? '资本流动受管理时，国内外资产收益不再被立即拉平，独立利率政策的空间可能增大；代价是限制自由转换与资金配置。原先的完全流动传导不再适用。' : '以上推演假设资本高度自由流动。现实存在中间制度和风险溢价，约束强度因条件而异。'}</p></details>
    <div className="experiment-foot">小型开放经济、短期价格黏性；风险与预期给定。方向示意，不是政策效果的数量预测。</div>
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
    <div className="experiment-heading"><h2>同一笔美元债，两种资产</h2><p>借入 10 万美元，初始汇率 7.00，加上 10 万元自有资金，购入价值 80 万元的长期资产。这个压力情景与出口应收款分开计算。</p></div>
    <fieldset className="choice-field"><legend>资产与收入的计价货币</legend><div className="segmented"><button aria-pressed={assetCurrency === 'cny'} className={assetCurrency === 'cny' ? 'active' : ''} onClick={() => setAssetCurrency('cny')}>人民币</button><button aria-pressed={assetCurrency === 'usd'} className={assetCurrency === 'usd' ? 'active' : ''} onClick={() => setAssetCurrency('usd')}>美元</button></div></fieldset>
    <Slider label="压力下的汇率" amount={rate} unit="CNY / USD" min={6} max={9} step={0.1} onChange={setRate} />
    <dl className="balance-sheet" aria-live="polite"><div><dt>资产的人民币价值</dt><dd>¥ {money(asset)}</dd></div><div><dt>美元债务折合人民币</dt><dd>¥ {money(debt)}</dd></div><div className={equity < 0 ? 'negative-result' : 'accent-result'}><dt>简化净资产</dt><dd>¥ {money(equity)}</dd></div></dl>
    <p className="result-explanation">{assetCurrency === 'cny' ? '人民币资产的价值设为不变。人民币贬值时，美元债务变贵，净资产被压缩。' : '美元资产和债务随汇率同方向换算，初始币种匹配减少了净资产的汇率风险；仍不等于没有经营和信用风险。'}</p>
    <label className="check-field risk-toggle"><input type="checkbox" checked={renewal} onChange={e => setRenewal(e.target.checked)} />短期债到期，贷款人不再续借</label>
    {renewal && <div className="risk-feedback" role="status">即使净资产为正，也要立即筹集 10 万美元偿债。长期资产不一定能按账面价值及时卖出。币种匹配并没有消除期限错配。</div>}
    <Reset onClick={() => { setRate(7); setAssetCurrency('cny'); setRenewal(false) }} />
    <div className="experiment-foot">仅展示汇率换算与到期压力。忽略利息、资产价格变化、现金储备与其他债务。</div>
  </>
}

const paymentLayers = [
  { title: '交易义务', usd: '合同约定支付 10 万美元。先明确付款人、收款人、金额和期限。', cny: '双方重新约定人民币金额和期限。客户需要安排人民币资金或换汇。' },
  { title: '支付报文', usd: '付款银行发送和认证指令。SWIFT 可以承担这个环节，报文不是资金。', cny: '银行可使用相应的报文通道。使用人民币，不意味着所有指令必须走同一个通信网络。' },
  { title: '清算', usd: '银行或清算机构核对付款，计算应收应付；某些安排可以节约结算流动性。', cny: '人民币代理行或相关清算安排处理银行间头寸。路径取决于参与资格和开户关系。' },
  { title: '结算', usd: '相应美元账户完成划转，收款银行贷记客户账户。实际路径可能涉及代理行或银行内部账簿。', cny: '相应人民币结算资产完成划转。相关银行可通过 CIPS 或其他适用安排完成跨境支付。' }
]

function System() {
  const [currency, setCurrency] = useState<'usd' | 'cny'>('usd')
  const [layer, setLayer] = useState(0)
  return <>
    <div className="experiment-heading"><h2>一笔付款，四个环节</h2><p>比较美元与人民币付款。选择环节，查看它解决的问题。</p></div>
    <div className="segmented"><button className={currency === 'usd' ? 'active' : ''} aria-pressed={currency === 'usd'} onClick={() => setCurrency('usd')}>美元合同</button><button className={currency === 'cny' ? 'active' : ''} aria-pressed={currency === 'cny'} onClick={() => setCurrency('cny')}>人民币合同</button></div>
    <div className="payment-route">{paymentLayers.map((item, i) => <button key={item.title} className={i === layer ? 'selected' : ''} aria-pressed={i === layer} onClick={() => setLayer(i)}><span className="chain-number">{i + 1}</span><span>{item.title}</span><ChevronRight size={16} /></button>)}</div>
    <div className="payment-description" key={currency + layer} aria-live="polite"><h3>{paymentLayers[layer].title}</h3><p>{paymentLayers[layer][currency]}</p></div>
    <div className="custody-note"><span>平行的资产控制关系</span><strong>托管</strong><p>货款流程之外，证券等资产的记录和处分可能依赖托管机构。资产的币种与所在法域是两个问题。</p></div>
    <div className="experiment-foot">典型路径的概念比较。没有展示实时资金流，也不代表每笔付款的实际银行路线。</div>
  </>
}

export default function Experiment({ lesson }: { lesson: LessonId }) {
  return <div className="experiment-panel">{lesson === 'accounts' ? <Accounts /> : lesson === 'exchange' ? <Exchange /> : lesson === 'policy' ? <Policy /> : lesson === 'crisis' ? <Crisis /> : <System />}</div>
}
