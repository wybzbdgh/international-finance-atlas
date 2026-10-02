import { useState, type ReactNode } from 'react'
import { FigureData, FigurePlot } from './FigureCharts'
import { Reset, Slider, Tabs } from './ExperimentUI'
import { sample } from '../lib/figure-models'
import { balassaSamuelson, capitalMobility, coveredCashflow, currencyMismatch, iipValuation, intertemporalChoice, jCurve, moneyAdjustment, repoLiquidity, specieFlow } from '../lib/extended-figure-models'

const n = (value: number, digits = 2) => value.toFixed(digits)
const signed = (value: number) => (value > 0 ? '+' : '') + n(value, 1)
const whole = (value: number) => n(value, 0)
function Method({ children }: { children: ReactNode }) { return <details className="figure-method"><summary>数据与口径</summary><div>{children}</div></details> }
function Outcome({ children }: { children: ReactNode }) { return <p className="figure-outcome" aria-live="polite">{children}</p> }
function Waterfall({ items, label }: { items: { name: string; value: number; total?: boolean }[]; label: string }) {
  let running = 0
  const bars = items.map(item => { const start = item.total ? 0 : running; const end = item.total ? item.value : running + item.value; running = end; return { ...item, start, end } })
  const min = Math.min(0, ...bars.map(b => Math.min(b.start, b.end))), max = Math.max(1, ...bars.map(b => Math.max(b.start, b.end)))
  const range = max - min
  return <div className="figure-waterfall" role="img" aria-label={label + '：' + items.map(item => `${item.name} ${n(item.value, 1)}`).join('；')}>{bars.map((bar, i) => <div key={bar.name}><strong>{bar.total ? n(bar.value, 1) : signed(bar.value)}</strong><span className="figure-waterfall-space"><i className="figure-waterfall-zero" style={{ bottom: -min / range * 100 + '%' }} /><i className={'figure-waterfall-bar' + (!bar.total && bar.value < 0 ? ' loss' : '') + (bar.total ? ' total' : '')} style={{ bottom: (Math.min(bar.start, bar.end) - min) / range * 100 + '%', height: Math.max(.6, Math.abs(bar.end - bar.start) / range * 100) + '%', opacity: i === 0 ? .5 : 1 }} /></span><small>{bar.name}</small></div>)}</div>
}

export function IipValuation() {
  const [flow, setFlow] = useState(5), [fx, setFx] = useState(10), [asset, setAsset] = useState(5), [liability, setLiability] = useState(0)
  const q = iipValuation(flow, fx, asset, liability)
  return <><div className="figure-period">本币金额指数 · 期初对外资产 150、负债 120</div>
    <Waterfall label="净对外资产的存量流量核对" items={[{ name: '期初净头寸', value: q.initial, total: true }, { name: '价格重估', value: q.price }, { name: '汇率重估', value: q.fx }, { name: '净金融交易', value: q.flow }, { name: '期末净头寸', value: q.final, total: true }]} />
    <div className="figure-controls"><Slider label="净金融交易" amount={flow} min={-20} max={20} onChange={setFlow} /><Slider label="本币贬值幅度" amount={fx} min={-20} max={30} unit="%" onChange={setFx} /><Slider label="资产价格变化" amount={asset} min={-25} max={25} unit="%" onChange={setAsset} /><Slider label="负债价格变化" amount={liability} min={-25} max={25} unit="%" onChange={setLiability} /></div>
    <Outcome>期末净头寸 <strong>{n(q.final, 1)}</strong> = 期初 {q.initial} + 净交易 {signed(flow)} + 价格重估 {signed(q.price)} + 汇率重估 {signed(q.fx)}。</Outcome>
    <Reset onClick={() => { setFlow(5); setFx(10); setAsset(5); setLiability(0) }} />
    <Method><p>依据讲义国际投资头寸核对恒等式。外币计价资产占 80%，外币计价负债占 30%。期初存量先按原计价币种重估价格，再折算汇率；价格与汇率的交叉项计入汇率重估。净交易假定在期末发生，全部体现为对外资产变化。其他数量变化为零。</p><p>净金融交易正值表示净贷出。资本账户和净误差遗漏为零时，它等于经常账户余额。对外负债价格下降会提高净头寸，不能据此直接判断国内福利改善。</p></Method>
  </>
}

export function BalassaSamuelson() {
  const [tradable, setTradable] = useState(1.5), [service, setService] = useState(1), [weight, setWeight] = useState(50)
  const q = balassaSamuelson(tradable, service, weight / 100)
  return <><FigurePlot title="部门生产率与非贸易品价格" series={[{ name: '非贸易品价格', points: sample(.5, 2.5, x => balassaSamuelson(x, service, weight / 100).servicePrice * 100) }, { name: '综合物价', points: sample(.5, 2.5, x => balassaSamuelson(x, service, weight / 100).price * 100), color: 1 }, { name: '可贸易品价格', points: sample(.5, 2.5, () => 100), color: 4, dashed: true }]} xLabel="可贸易部门生产率（基期 = 1）" yLabel="价格指数（基期 = 100）" marks={[{ x: tradable, y: q.price * 100, label: '当前物价' }]} />
    <div className="figure-controls"><Slider label="可贸易部门生产率" amount={tradable} min={.5} max={2.5} step={.05} onChange={setTradable} /><Slider label="非贸易部门生产率" amount={service} min={.5} max={2.5} step={.05} onChange={setService} /><Slider label="非贸易品支出权重" amount={weight} min={10} max={80} step={5} unit="%" onChange={setWeight} /></div>
    <div className="figure-equation-chain"><span>工资 <b>{n(q.wage * 100, 1)}</b></span><i aria-hidden="true">→</i><span>非贸易品价格 <b>{n(q.servicePrice * 100, 1)}</b></span><i aria-hidden="true">→</i><span>综合物价 <b>{n(q.price * 100, 1)}</b></span></div>
    <Outcome>实际汇率 q = EP* / P = <strong>{n(q.realExchangeRate, 3)}</strong>，基期为 1；q 下降表示本币实际升值。</Outcome>
    <Reset onClick={() => { setTradable(1.5); setService(1); setWeight(50) }} />
    <Method><p>依据讲义两部门模型。可贸易品遵守一价定律；名义汇率、外国物价和世界可贸易品价格固定为 1。劳动可在国内两部门流动，竞争定价使 w = Aₜ，Pₙ = Aₜ / Aₙ。综合物价采用几何权重 P = Pₜ^(1−α)Pₙ^α。资本、工资摩擦、贸易成本未纳入；图示是机制推导，不是对跨国收入差距的估计。</p></Method>
  </>
}

export function CipCashflow() {
  const [home, setHome] = useState(2), [foreign, setForeign] = useState(5), [forward, setForward] = useState(6.8), [future, setFuture] = useState(7.2), [cost, setCost] = useState(10)
  const q = coveredCashflow(home, foreign, forward, future, cost)
  return <><div className="figure-cashflow" aria-label="一年期存款的三条现金流路径"><div><span>现在</span><strong>100 元</strong></div><i aria-hidden="true">→</i><div><span>本币存款</span><strong>{n(q.domestic)} 元</strong></div><div><span>即期换汇后</span><strong>{n(q.foreignPrincipal)} 美元</strong></div><i aria-hidden="true">→</i><div><span>外币存款到期</span><strong>{n(q.foreignDeposit)} 美元</strong></div></div>
    <FigurePlot title="远期汇率与到期本币收入" series={[{ name: '套保后的外币存款', points: sample(6.2, 7.8, x => coveredCashflow(home, foreign, x, future, cost).covered) }, { name: '本币存款', points: sample(6.2, 7.8, () => q.domestic), color: 1, dashed: true }, { name: '未套保的外币存款', points: sample(6.2, 7.8, () => q.uncovered), color: 2, dashed: true }]} xLabel="远期汇率 F（元 / 美元）" yLabel="一年后收入（元）" marks={[{ x: forward, y: q.covered, label: '当前远期报价' }]} />
    <div className="figure-controls"><Slider label="人民币年利率" amount={home} min={0} max={8} step={.25} unit="%" onChange={setHome} /><Slider label="美元年利率" amount={foreign} min={0} max={8} step={.25} unit="%" onChange={setForeign} /><Slider label="一年期远期汇率" amount={forward} min={6.2} max={7.8} step={.01} onChange={setForward} /><Slider label="到期即期汇率" amount={future} min={6.2} max={7.8} step={.01} onChange={setFuture} /><Slider label="每次换汇费用" amount={cost} min={0} max={100} step={5} unit="基点" onChange={setCost} /></div>
    <Outcome>套保收入 <strong>{n(q.covered)} 元</strong>；未套保收入 <strong>{n(q.uncovered)} 元</strong>。无费用平价远期为 {n(q.parity, 4)}；加入双向换汇费用后，无套利区间为 {n(q.lower, 4)}—{n(q.upper, 4)}。</Outcome>
    <Reset onClick={() => { setHome(2); setForeign(5); setForward(6.8); setFuture(7.2); setCost(10) }} />
    <Method><p>依据讲义抛补利率平价。初始即期汇率固定为 7，期限一年，借贷利率相同，忽略信用风险、保证金和资本约束。每次换汇扣除比例费用 c，100 基点 = 1%。无费用 F₀ = E(1+i)/(1+i*)；两种方向均无套利的区间是 [F₀(1−c)², F₀/(1−c)²]。</p><p>“到期即期汇率”为情景假设，并非预测。改变它只影响未套保结果。图中套利区间以能够按同一利率融资及按报价交易为条件。</p></Method>
  </>
}

export function JCurve() {
  const [depreciation, setDepreciation] = useState(15), [exports, setExports] = useState(.8), [imports, setImports] = useState(.7), [lag, setLag] = useState(6)
  const q = jCurve(depreciation, exports, imports, lag, 36)
  const path = [{ x: -3, y: 0 }, { x: 0, y: 0 }, ...sample(0, 36, x => jCurve(depreciation, exports, imports, lag, x).balance, 73)]
  return <><FigurePlot title="贬值后贸易收支的调整" series={[{ name: '贸易余额', points: path }, { name: '长期余额', points: sample(-3, 36, () => q.longRun), color: 1, dashed: true }, { name: '初始平衡', points: sample(-3, 36, () => 0), color: 4, dashed: true }]} xDomain={[-3, 36]} xLabel="贬值后的月数（0 为冲击时点）" yLabel="本币贸易余额（初始出口 = 100）" xFormat={whole} />
    <div className="figure-controls"><Slider label="本币贬值幅度" amount={depreciation} min={0} max={30} unit="%" onChange={setDepreciation} /><Slider label="出口需求弹性" amount={exports} min={0} max={2} step={.1} onChange={setExports} /><Slider label="进口需求弹性" amount={imports} min={0} max={2} step={.1} onChange={setImports} /><Slider label="数量调整时滞" amount={lag} min={1} max={12} unit="个月" onChange={setLag} /></div>
    <Outcome>弹性之和为 <strong>{n(exports + imports, 1)}</strong>。在本图条件下，{exports + imports > 1 ? '贬值最终改善贸易余额' : exports + imports < 1 ? '贬值不能改善长期贸易余额' : '贬值不改变长期贸易余额'}；长期余额为 <strong>{signed(q.longRun)}</strong>。</Outcome>
    <Reset onClick={() => { setDepreciation(15); setExports(.8); setImports(.7); setLag(6) }} />
    <Method><p>依据讲义马歇尔—勒纳条件和 J 曲线。初始进出口均为 100，贸易平衡；出口以本币定价，进口以外币定价，完全汇率传递，供给有弹性。贬值后进口单价立即上涨，数量以 1−exp(−t/τ) 逐步调整。</p><p>令汇率倍数为 s，则最终出口数量为 s^εₓ，进口数量为 s^(−εₘ)，本币贸易余额为 100[s^εₓ−s^(1−εₘ)]。图中的时滞为教学参数，不能作为某次贬值的时间预测。</p></Method>
  </>
}

export function CurrencyMismatch() {
  const [depreciation, setDepreciation] = useState(20), [share, setShare] = useState(80), [hedge, setHedge] = useState(0)
  const q = currencyMismatch(depreciation, share, hedge)
  return <><FigurePlot title="本币贬值与企业净资产" series={[{ name: '当前套保比例', points: sample(-20, 60, x => currencyMismatch(x, share, hedge).equity) }, { name: '未套保', points: sample(-20, 60, x => currencyMismatch(x, share, 0).equity), color: 2, dashed: true }, { name: '期初净资产', points: sample(-20, 60, () => 20), color: 4, dashed: true }]} xLabel="本币贬值幅度（%，负值为升值）" yLabel="净资产（本币金额指数）" xFormat={whole} marks={[{ x: depreciation, y: q.equity, label: '当前情景' }]} />
    <div className="figure-controls"><Slider label="本币贬值幅度" amount={depreciation} min={-20} max={60} unit="%" onChange={setDepreciation} /><Slider label="外币债务占总债务" amount={share} min={0} max={100} step={5} unit="%" onChange={setShare} /><Slider label="净外币敞口套保比例" amount={hedge} min={0} max={100} step={10} unit="%" onChange={setHedge} /></div>
    <Waterfall label="净资产变化的分解" items={[{ name: '期初净资产', value: 20, total: true }, { name: '外币资产重估', value: q.assetGain }, { name: '外币负债重估', value: -q.liabilityLoss }, { name: '套保损益', value: q.hedgeGain }, { name: '期末净资产', value: q.equity, total: true }]} />
    <Outcome>净外币负债 <strong>{n(q.netExposure, 1)}</strong>；当前净资产 <strong>{n(q.equity, 1)}</strong>{q.equity < 0 ? '，已出现资不抵债。' : '。'}</Outcome>
    <Reset onClick={() => { setDepreciation(20); setShare(80); setHedge(0) }} />
    <Method><p>依据讲义货币错配与资产负债表效应。期初总资产 100、债务 80，外币资产 20。国内资产本币价值固定，外币资产与债务只发生汇率重估；未计营业利润、利息和信用变化。</p><p>套保针对净外币敞口，假设本外币利率相同、远期汇率等于初始即期汇率，合约无费用且能履约。负的净外币负债表示净外币资产；此时本币贬值产生汇兑收益。</p></Method>
  </>
}

export function RepoLiquidity() {
  const [fall, setFall] = useState(10), [haircut, setHaircut] = useState(25), [cash, setCash] = useState(5)
  const q = repoLiquidity(fall, haircut, cash)
  return <><FigurePlot title="抵押品折扣与补充现金要求" series={[{ name: '融资缺口', points: sample(5, 60, x => repoLiquidity(fall, x, cash).marginCall) }, { name: '动用现金后的缺口', points: sample(5, 60, x => Math.max(0, repoLiquidity(fall, x, cash).marginCall - cash)), color: 1 }, { name: '无价格下跌、未动用现金', points: sample(5, 60, x => repoLiquidity(0, x, 0).marginCall), color: 4, dashed: true }]} xLabel="新的抵押品折扣（%）" yLabel="资金缺口（金额指数）" xFormat={whole} marks={[{ x: haircut, y: q.marginCall, label: '当前追缴' }]} />
    <div className="figure-controls"><Slider label="证券价格下跌" amount={fall} min={0} max={35} unit="%" onChange={setFall} /><Slider label="新的抵押品折扣" amount={haircut} min={5} max={60} unit="%" onChange={setHaircut} /><Slider label="可动用现金" amount={cash} min={0} max={20} onChange={setCash} /></div>
    <div className="figure-equation-chain"><span>到期融资 <b>90</b></span><i aria-hidden="true">−</i><span>可续借金额 <b>{n(q.capacity, 1)}</b></span><i aria-hidden="true">→</i><span>补充现金 <b>{n(q.marginCall, 1)}</b></span></div>
    <Outcome>先动用现金 {n(q.cashUsed, 1)}，还需出售市值 <strong>{n(q.sale, 1)}</strong> 的证券{q.unresolved > .00001 ? `；全部售出后仍有 ${n(q.unresolved, 1)} 的融资缺口` : ''}。净资产为 {n(q.equity, 1)}。</Outcome>
    <Reset onClick={() => { setFall(10); setHaircut(25); setCash(5) }} />
    <Method><p>依据讲义回购融资与抵押品折扣机制。初始证券市值 100，以 10% 折扣借入 90；现金另计。新的融资上限为 (1−h)V。先用现金偿还缺口，再出售原抵押证券并以所得偿还债务。</p><p>卖出 1 元证券同时使抵押融资上限减少 1−h 元，因此融资缺口只减少 h 元；所需出售额为剩余缺口 / h。售出上限为全部证券。假定价格在出售过程中不继续下降、无费用；真实的抛售价格反馈会增加压力。负净资产表示偿付能力问题。</p></Method>
  </>
}

export function PolicyCapitalMobility() {
  const [regime, setRegime] = useState<'float' | 'fixed'>('float'), [instrument, setInstrument] = useState<'money' | 'fiscal'>('fiscal'), [strength, setStrength] = useState(10), [mobility, setMobility] = useState(3), [mode, setMode] = useState('limited')
  const q = capitalMobility(regime, instrument, strength, mobility, mode === 'perfect')
  const limit = capitalMobility(regime, instrument, strength, mobility, true)
  return <><Tabs value={regime} onChange={setRegime} items={[['float', '浮动汇率'], ['fixed', '固定汇率']]} label="汇率制度" /><Tabs value={instrument} onChange={setInstrument} items={[['fiscal', '财政扩张'], ['money', '货币扩张']]} label="政策工具" />
    <FigurePlot title="资本流动条件与政策效果" series={[{ name: '有限资本流动', points: sample(0, 30, x => capitalMobility(regime, instrument, strength, x).output) }, { name: '完全资本流动的极限', points: sample(0, 30, () => limit.output), color: 1, dashed: true }, { name: '初始产出', points: sample(0, 30, () => 100), color: 4, dashed: true }]} xLabel="资本流动对利差的反应系数 κ" yLabel="产出（初始 = 100）" xFormat={whole} marks={mode === 'limited' ? [{ x: mobility, y: q.output, label: '当前条件' }] : []} />
    <Tabs value={mode} onChange={setMode} items={[['limited', '有限流动'], ['perfect', '完全流动极限']]} label="查看均衡条件" />
    <div className="figure-controls">{mode === 'limited' && <Slider label="资本流动反应系数 κ" amount={mobility} min={0} max={30} step={.5} onChange={setMobility} />}<Slider label="扩张力度" amount={strength} min={0} max={20} onChange={setStrength} /></div>
    <Outcome>产出 <strong>{n(q.output, 2)}</strong> · 利率 <strong>{n(q.rate, 2)}%</strong> · 汇率 <strong>{n(q.exchange, 3)}</strong>{regime === 'fixed' ? '。这是央行完成维持汇率的干预后的均衡。' : '。汇率上升表示本币贬值。'}</Outcome>
    <Reset onClick={() => { setRegime('float'); setInstrument('fiscal'); setStrength(10); setMobility(3); setMode('limited') }} />
    <Method><p>这是 IS–LM–BP 的局部线性教学模型，比较资本流动条件，不能把其结论直接套到所有经济体。以初始均衡 Y=100、i=4%、E=7 为基准，令 y、r、e 分别为偏离量：IS 为 y=F−3r+8e；LM 为 r=0.12y−M；外部平衡为 −0.1y+2e+κr=0。</p><p>外部平衡式将经常账户与资本流入相加；κ 是资本流入对利差的反应系数。浮动汇率时联立三式；固定汇率时 e=0，货币供给 M 随干预调整。κ 趋于无穷时利率回到世界利率，得到经典蒙代尔—弗莱明极限。财政力度对应 F，货币力度的十分之一对应 M；价格、世界利率及预期固定。</p></Method>
  </>
}

export function MoneyAdjustment() {
  const [shock, setShock] = useState(10), [speed, setSpeed] = useState(.6), [elasticity, setElasticity] = useState(2), [time, setTime] = useState(0), [mode, setMode] = useState('sticky')
  const flexible = mode === 'flexible'
  const times = sample(0, 12, x => x, 49).map(p => p.x)
  const path = times.map(t => ({ t, ...moneyAdjustment(shock, speed, elasticity, t, flexible) }))
  const q = moneyAdjustment(shock, speed, elasticity, time, flexible)
  const plotTime = (x: number) => n(x, x % 1 ? 2 : 0)
  return <><Tabs value={mode} onChange={setMode} items={[['sticky', '价格逐步调整'], ['flexible', '价格立即调整']]} label="价格调整方式" />
    <div className="figure-controls"><Slider label="永久货币扩张" amount={shock} min={0} max={20} unit="%" onChange={setShock} />{!flexible && <Slider label="价格调整速度 θ" amount={speed} min={.2} max={1.2} step={.1} onChange={setSpeed} />}<Slider label="货币需求利率半弹性 λ" amount={elasticity} min={1} max={5} step={.5} onChange={setElasticity} /></div>
    <div className="figure-linked-time"><Slider label="联动观察时点" amount={time} min={0} max={12} step={.25} unit="年" onChange={setTime} /></div>
    <FigurePlot title="货币与物价的调整" series={[{ name: '物价', points: path.map(p => ({ x: p.t, y: p.price })) }, { name: '货币供给', points: path.map(p => ({ x: p.t, y: p.money })), color: 1, dashed: true }]} xLabel="冲击后的年数" yLabel="指数（冲击前 = 100）" xFormat={plotTime} cursorX={time} onCursorChange={setTime} />
    <FigurePlot title="同一时点的汇率与长期水平" series={[{ name: '即期汇率', points: path.map(p => ({ x: p.t, y: p.exchange })) }, { name: '长期汇率', points: path.map(p => ({ x: p.t, y: 7 * (1 + shock / 100) })), color: 1, dashed: true }, { name: '冲击前汇率', points: path.map(p => ({ x: p.t, y: 7 })), color: 4, dashed: true }]} xLabel="冲击后的年数" yLabel="汇率（本币 / 外币）" xFormat={plotTime} cursorX={time} onCursorChange={setTime} />
    <FigurePlot title="同一时点的本国利率" series={[{ name: '本国利率', points: path.map(p => ({ x: p.t, y: p.rate })) }, { name: '外国利率', points: path.map(p => ({ x: p.t, y: 4 })), color: 4, dashed: true }]} xLabel="冲击后的年数" yLabel="年利率（%）" xFormat={plotTime} cursorX={time} onCursorChange={setTime} />
    <Outcome>第 {plotTime(time)} 年：物价 <strong>{n(q.price, 2)}</strong>，汇率 <strong>{n(q.exchange, 3)}</strong>，本国利率 <strong>{n(q.rate, 2)}%</strong>。</Outcome>
    <Reset onClick={() => { setShock(10); setSpeed(.6); setElasticity(2); setTime(0); setMode('sticky') }} />
    <Method><p>依据讲义货币市场、利率平价及汇率超调的关系构造简化联动模型。假定产出与外国利率不变、风险中性、资本自由流动，冲击为未预料到的永久货币水平上升。m、p、e 是相对于冲击前的货币、物价、汇率对数变化。</p><p>货币市场 m−p=−λ(i−i*)；物价按 dp/dt=θ(m−p) 调整；UIP 要求 de/dt=i−i*；长期购买力平价给出 e∞=p∞=m。稳定路径为 p=m[1−exp(−θt)]，e=m+[m/(λθ)]exp(−θt)。图中的利率将小数转换为百分点。</p><p>价格调整方程是教学用的约化设定，未包含完整的商品市场或估计现实参数。价格立即调整时，物价与汇率直接达到长期水平，利率保持不变。</p></Method>
  </>
}

export function SpecieFlow() {
  const [initial, setInitial] = useState(140), [response, setResponse] = useState(10), [time, setTime] = useState(0)
  const q = specieFlow(initial, response, time)
  const path = sample(0, 20, x => x, 81).map(({ x }) => ({ time: x, ...specieFlow(initial, response, x) }))
  return <><div className="figure-period">两国金属货币总量固定为 200 · 两国产出各为 100</div>
    <div className="figure-controls"><Slider label="初始本国货币量" amount={initial} min={40} max={160} step={5} onChange={setInitial} /><Slider label="贸易对相对价格的反应 κ" amount={response} min={0} max={30} step={1} onChange={setResponse} /></div>
    <div className="figure-linked-time"><Slider label="观察时点" amount={time} min={0} max={20} step={.25} unit="年" onChange={setTime} /></div>
    <FigurePlot title="金属货币在两国之间流动" series={[{ name: '本国货币量', points: path.map(p => ({ x: p.time, y: p.homeMoney })) }, { name: '外国货币量', points: path.map(p => ({ x: p.time, y: p.foreignMoney })), color: 1 }, { name: '无贸易调整时的本国货币量', points: path.map(p => ({ x: p.time, y: initial })), color: 4, dashed: true }]} xLabel="调整年数" yLabel="金属货币量" xFormat={value => n(value, value % 1 ? 2 : 0)} cursorX={time} onCursorChange={setTime} />
    <FigurePlot title="贸易差额与金属流入" series={[{ name: '本国贸易顺差 / 金属净流入', points: path.map(p => ({ x: p.time, y: p.tradeBalance })) }, { name: '贸易平衡', points: path.map(p => ({ x: p.time, y: 0 })), color: 4, dashed: true }]} xLabel="调整年数" yLabel="每年净流入（货币单位）" xFormat={value => n(value, value % 1 ? 2 : 0)} cursorX={time} onCursorChange={setTime} />
    <div className="figure-equation-chain"><span>本国物价 <b>{n(q.homePrice, 3)}</b></span><i aria-hidden="true">/</i><span>外国物价 <b>{n(q.foreignPrice, 3)}</b></span><i aria-hidden="true">=</i><span>相对价格 <b>{n(q.relativePrice, 3)}</b></span></div>
    <Outcome>第 {n(time, time % 1 ? 2 : 0)} 年，本国{q.tradeBalance < -.00001 ? '贸易逆差，金属货币流出' : q.tradeBalance > .00001 ? '贸易顺差，金属货币流入' : '贸易平衡'}；两国货币总量仍为 <strong>{n(q.homeMoney + q.foreignMoney, 0)}</strong>。</Outcome>
    <Reset onClick={() => { setInitial(140); setResponse(10); setTime(0) }} />
    <Method><p>按休谟价格—铸币流动机制构造的两国简化模型。没有采金、资本流动、冲销或信用货币；金属以固定平价自由流动。两国产出均固定为 100，货币流通速度为 1，故 P=M/100、P*=(200−M)/100。</p><p>假定本国贸易差额及金属净流入为 κ(P*−P)，因此 dM/dt=κ(2−M/50)，稳定解 M(t)=100+[M(0)−100]exp(−κt/50)。κ&gt;0 时两国价格逐渐接近；κ=0 时没有贸易调整。年份和反应系数为教学设定，未对历史金本位制度估计。</p></Method>
  </>
}

export function IntertemporalChoice() {
  const [rate, setRate] = useState(5), [limit, setLimit] = useState(30), [mode, setMode] = useState('optimal'), [chosen, setChosen] = useState(70)
  const q = intertemporalChoice(rate, limit, mode === 'choice' ? chosen : undefined)
  const optimum = intertemporalChoice(rate, limit)
  const product = q.consumption1 * q.consumption2
  return <><div className="figure-period">两期收入分别为 60、100 · 初始对外净资产为 0</div>
    <Tabs value={mode} onChange={setMode} items={[['optimal', '效用最大化'], ['choice', '自行选择消费']]} label="消费选择方式" />
    <FigurePlot title="两期预算约束与消费选择" series={[{ name: '可行预算线', points: sample(0, q.maxConsumption, x => (q.wealth - x) * (1 + q.rate)) }, { name: '无借款上限的预算线', points: sample(0, q.wealth, x => (q.wealth - x) * (1 + q.rate)), color: 4, dashed: true }, { name: '当前无差异曲线', points: sample(10, q.wealth, x => product / x), color: 1 }]} xDomain={[0, 170]} yDomain={[0, 200]} xLabel="第一期消费 C₁" yLabel="第二期消费 C₂" xFormat={whole} yFormat={whole} inspect={false} marks={[{ x: 60, y: 100, label: '不借贷' }, { x: q.consumption1, y: q.consumption2, label: '当前消费' }]} />
    <div className="figure-controls"><Slider label="国际实际利率" amount={rate} min={0} max={15} step={.5} unit="%" onChange={setRate} /><Slider label="第一期借款上限" amount={limit} min={0} max={40} step={1} onChange={value => { setLimit(value); setChosen(Math.min(chosen, 60 + value)) }} />{mode === 'choice' && <Slider label="第一期消费" amount={chosen} min={20} max={q.maxConsumption} step={1} onChange={setChosen} />}</div>
    <div className="figure-equation-chain"><span>第一期消费 <b>{n(q.consumption1, 2)}</b></span><i aria-hidden="true">→</i><span>第二期消费 <b>{n(q.consumption2, 2)}</b></span></div>
    <Outcome>第一期经常账户 <strong>{signed(q.currentAccount1)}</strong>，第二期经常账户 <strong>{signed(q.currentAccount2)}</strong>。{mode === 'optimal' ? q.binding ? '借款上限约束了消费选择。' : '无借款约束时，最优消费满足 C₂ = (1+r)C₁。' : `同样条件下，效用最大化的第一期消费为 ${n(optimum.consumption1, 2)}。`}</Outcome>
    <FigureData headers={['项目', '第一期', '第二期']} rows={[['收入', 60, 100], ['净利息收入', '0.00', n(q.interest2)], ['消费', n(q.consumption1), n(q.consumption2)], ['经常账户', n(q.currentAccount1), n(q.currentAccount2)], ['期末对外净资产', n(q.assets1), n(q.assets2)]]} />
    <Reset onClick={() => { setRate(5); setLimit(30); setMode('optimal'); setChosen(70) }} />
    <Method><p>两期小型开放经济，只有一种商品，收入确定，无投资和政府支出，借贷利率相同，无违约或估值变化。效用为 log C₁ + log C₂（β=1），终期对外净资产为零。预算约束 C₁+C₂/(1+r)=60+100/(1+r)；第一期借款不能超过设定上限。</p><p>第一期 CA₁=60−C₁。第二期初次收入含利息 r·CA₁，所以 CA₂=100+r·CA₁−C₂，CA₁+CA₂=0。第二期贸易余额则为100−C₂；它与经常账户的差是净利息收入。最优消费在借款约束未生效时满足 C₂=(1+r)C₁。</p></Method>
  </>
}
