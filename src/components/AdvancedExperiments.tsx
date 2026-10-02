import { useState } from 'react'
import { Check } from 'lucide-react'
import { bondPresentValue, debtPath, depositReturns, effectiveExchangeRates, exportHedge, firstYearFinancingNeed, hedgedLoanCost, iipReconciliation, overshootingPath, parityForward, realExchangeRate, stablecoinRedemption, triangularArbitrage } from '../lib/models'
import { decimal, LinePlot, money, Reset, Result, Slider, Tabs } from './ExperimentUI'

export function Arbitrage() {
  const [eurUsd, setEurUsd] = useState(1.1), [usdCny, setUsdCny] = useState(7), [eurCny, setEurCny] = useState(7.85), [spread, setSpread] = useState(0.2)
  const r = triangularArbitrage(eurUsd, usdCny, eurCny, spread)
  return <><div className="experiment-heading"><h2>三角套利与买卖价差</h2><p>从 10,000 美元出发，沿两个方向分别兑换一圈。</p></div><div className="experiment-content">
    <Slider label="欧元的美元中间价" amount={eurUsd} unit="USD / EUR" min={0.9} max={1.3} step={0.01} onChange={setEurUsd} />
    <Slider label="美元的人民币中间价" amount={usdCny} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setUsdCny} />
    <Slider label="欧元的人民币中间价" amount={eurCny} unit="CNY / EUR" min={6.5} max={10} step={0.01} onChange={setEurCny} />
    <Slider label="各货币对的买卖价差" amount={spread} unit="%" min={0} max={1} step={0.05} onChange={setSpread} />
    <div className="formula">套算中间价：{decimal(r.cross, 4)} CNY / EUR</div>
    <dl className="calculation-list" aria-live="polite"><div><dt>USD → EUR → CNY → USD</dt><dd>{money(r.forward, 2)} USD</dd></div><div><dt>该方向的损益</dt><dd className={r.forwardProfit < 0 ? 'negative-result' : 'accent-result'}>{money(r.forwardProfit, 2)} USD</dd></div><div><dt>USD → CNY → EUR → USD</dt><dd>{money(r.reverse, 2)} USD</dd></div></dl>
    <p className="result-explanation">第一条路径买入欧元用卖价，卖出欧元用买价，再买入美元用卖价。价差可能吸收表面上的套利收益。</p><Reset onClick={() => { setEurUsd(1.1); setUsdCny(7); setEurCny(7.85); setSpread(0.2) }} />
    <div className="experiment-foot">假设同时成交、足额交易且无其他费用。价差为中间价的百分比，买价与卖价分别向两侧移动一半。</div>
  </div></>
}

export function Prices() {
  const [tab, setTab] = useState<'basket' | 'effective'>('basket')
  const [spot, setSpot] = useState(7), [cn, setCn] = useState(700), [us, setUs] = useState(100)
  const [eur, setEur] = useState(7.7), [weight, setWeight] = useState(60), [cnIndex, setCnIndex] = useState(100), [usIndex, setUsIndex] = useState(100), [euIndex, setEuIndex] = useState(100)
  const q = realExchangeRate(spot, cn, us), eff = effectiveExchangeRates(spot, eur, weight / 100, cnIndex, usIndex, euIndex)
  return <><div className="experiment-heading"><h2>商品价格与汇率</h2><p>比较消费篮子，也可以计算两个贸易伙伴组成的有效汇率。</p></div><Tabs value={tab} onChange={setTab} label="价格与汇率计算" items={[["basket","PPP 与实际汇率"],["effective","有效汇率"]]} /><div className="experiment-content">
    <Slider label="人民币／美元汇率" amount={spot} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setSpot} />
    {tab === 'basket' ? <><Slider label="中国同一篮子的价格" amount={cn} unit="元" min={500} max={900} onChange={setCn} /><Slider label="美国同一篮子的价格" amount={us} unit="美元" min={70} max={130} onChange={setUs} /><Result label="绝对购买力平价基准" result={decimal(cn / us, 4)} unit="CNY / USD" /><Result label="实际汇率 q = E × P* / P" result={decimal(q, 4)} /><p className="result-explanation">{q > 1.00001 ? '外国篮子按汇率折算后更贵。' : q < 0.99999 ? '本国篮子按汇率折算后更贵。' : '两国篮子折算后同价。'} q 上升表示本币实际贬值；这只篮子的平价不直接等于均衡汇率。</p></> : <><Slider label="人民币／欧元汇率" amount={eur} unit="CNY / EUR" min={6.5} max={9} step={0.01} onChange={setEur} /><Slider label="美国贸易权重" amount={weight} unit="%" min={0} max={100} step={10} onChange={setWeight} /><Slider label="中国价格指数" amount={cnIndex} min={90} max={120} onChange={setCnIndex} /><Slider label="美国价格指数" amount={usIndex} min={90} max={120} onChange={setUsIndex} /><Slider label="欧元区价格指数" amount={euIndex} min={90} max={120} onChange={setEuIndex} /><div className="cash-results"><div><span>名义有效汇率</span><strong>{decimal(eff.nominal)}</strong></div><div><span>实际有效汇率</span><strong>{decimal(eff.real)}</strong></div></div><p className="result-explanation">基期为 100，美元与欧元的基期报价分别为 7.00、7.70。欧元区权重为 {100 - weight}%。采用几何加权，指数上升表示本币升值；实际指数同时调整相对物价。</p></>}
    <Reset onClick={() => { setSpot(7); setCn(700); setUs(100); setEur(7.7); setWeight(60); setCnIndex(100); setUsIndex(100); setEuIndex(100) }} /><div className="experiment-foot">篮子可比性、贸易权重及基期均为教学设定。</div>
  </div></>
}

export function Parity() {
  const [domestic, setDomestic] = useState(2), [foreign, setForeign] = useState(5), [future, setFuture] = useState(6.8), [deviation, setDeviation] = useState(0)
  const forward = parityForward(7, domestic / 100, foreign / 100, 1), quote = forward + deviation / 10000
  const r = depositReturns(10000, 7, domestic / 100, foreign / 100, 1, quote, future)
  return <><div className="experiment-heading"><h2>抛补与无抛补投资</h2><p>本金 1 万元，即期汇率 7.00，投资期限一年。</p></div><div className="experiment-content"><Slider label="人民币存款利率" amount={domestic} unit="%" min={0} max={8} step={0.1} onChange={setDomestic} /><Slider label="美元存款利率" amount={foreign} unit="%" min={0} max={8} step={0.1} onChange={setForeign} /><Slider label="到期实际即期汇率" amount={future} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setFuture} /><Slider label="远期报价偏离平价的点数" amount={deviation} unit="点" min={-300} max={300} step={10} onChange={setDeviation} /><div className="formula">CIP 基准 F = {decimal(forward,4)}<br />使用的远期报价 = {decimal(quote,4)}</div><dl className="calculation-list" aria-live="polite"><div><dt>人民币存款终值</dt><dd>¥ {money(r.domestic,2)}</dd></div><div><dt>美元投资并卖出远期</dt><dd>¥ {money(r.covered,2)}</dd></div><div><dt>美元投资，不抛补</dt><dd>¥ {money(r.uncovered,2)}</dd></div></dl><p className="result-explanation">抛补终值由今天的远期价格确定；未抛补终值随到期汇率变化。UIP 讨论预期收益，本例的到期即期汇率是实现值。报价偏离 CIP 时，应进一步检查融资、信用和交易约束。</p><Reset onClick={() => { setDomestic(2); setForeign(5); setFuture(6.8); setDeviation(0) }} /><div className="experiment-foot">简单计息。1 点 = 0.0001 元/美元；暂不计费用和融资价差。</div></div></>
}

export function Overshoot() {
  const [shock,setShock] = useState(5), [speed,setSpeed] = useState(0.3)
  const r = overshootingPath(7,shock/100,speed)
  return <><div className="experiment-heading"><h2>汇率超调路径</h2><p>价格调整较慢，汇率先跳跃，再逐步接近长期水平。</p></div><div className="experiment-content"><Slider label="永久货币扩张幅度" amount={shock} unit="%" min={0} max={15} onChange={setShock} /><Slider label="价格调整速度" amount={speed} min={0.1} max={0.8} step={0.1} onChange={setSpeed} /><LinePlot points={r.points} reference={r.longRun} title="政策冲击后的汇率调整" xLabel="调整期" yLabel="CNY / USD" digits={2} /><dl className="calculation-list"><div><dt>冲击前汇率</dt><dd>7.00</dd></div><div><dt>即时跳跃后的汇率</dt><dd>{decimal(r.impact,4)}</dd></div><div><dt>长期汇率</dt><dd>{decimal(r.longRun,4)}</dd></div></dl><Reset onClick={() => { setShock(5); setSpeed(0.3) }} /><div className="experiment-foot">示意路径把即时变化设为长期变化的两倍，并按指数速度收敛。用于解释超调，未估计完整结构模型。</div></div></>
}

export function Debt() {
  const [tab,setTab] = useState<'path'|'restructure'>('path')
  const [initial,setInitial] = useState(60), [rate,setRate] = useState(5), [growth,setGrowth] = useState(3), [surplus,setSurplus] = useState(1), [maturity,setMaturity] = useState(20)
  const [cut,setCut] = useState(20), [coupon,setCoupon] = useState(3), [extension,setExtension] = useState(3), [discount,setDiscount] = useState(8)
  const path = debtPath(initial,rate/100,growth/100,surplus), need = firstYearFinancingNeed(initial,rate/100,growth/100,surplus,maturity/100)
  const before = bondPresentValue(100,0.06,5,discount/100), after = bondPresentValue(100*(1-cut/100),coupon/100,5+extension,discount/100)
  return <><div className="experiment-heading"><h2>债务动态与债务重组</h2><p>分别考察债务率、到期融资需求和现金流现值。</p></div><Tabs value={tab} onChange={setTab} label="债务计算" items={[["path","债务路径"],["restructure","重组比较"]]} /><div className="experiment-content">{tab==='path'?<><Slider label="初始债务／GDP" amount={initial} unit="%" min={20} max={140} step={5} onChange={setInitial}/><Slider label="有效名义利率" amount={rate} unit="%" min={0} max={12} step={0.5} onChange={setRate}/><Slider label="名义 GDP 增长率" amount={growth} unit="%" min={-4} max={10} step={0.5} onChange={setGrowth}/><Slider label="初级财政盈余／GDP" amount={surplus} unit="%" min={-5} max={5} step={0.5} onChange={setSurplus}/><Slider label="一年内到期的本金比例" amount={maturity} unit="%" min={5} max={60} step={5} onChange={setMaturity}/><LinePlot points={path} reference={initial} title="未来十年的债务率" xLabel="年" yLabel="债务 / GDP (%)"/><Result label="第一年的总融资需求／GDP" result={decimal(need)} unit="%"/><p className="result-explanation">初级盈余为正、赤字为负。到期本金比例改变融资需求，单独改变它不改变债务率路径。低债务率也可能伴随集中到期压力。融资需求为负，表示初级盈余覆盖利息与到期本金后仍有结余。</p></>:<><p>原债券面值 100，票息 6%，剩余期限 5 年，按年付息、到期还本。</p><Slider label="本金减让" amount={cut} unit="%" min={0} max={50} step={5} onChange={setCut}/><Slider label="重组后票息" amount={coupon} unit="%" min={0} max={8} step={0.5} onChange={setCoupon}/><Slider label="延长到期时间" amount={extension} unit="年" min={0} max={5} onChange={setExtension}/><Slider label="共同折现率" amount={discount} unit="%" min={2} max={15} step={0.5} onChange={setDiscount}/><dl className="calculation-list"><div><dt>原现金流现值</dt><dd>{decimal(before)}</dd></div><div><dt>重组后现金流现值</dt><dd>{decimal(after)}</dd></div><div><dt>净现值减让</dt><dd>{decimal((1-after/before)*100)}%</dd></div></dl><p className="result-explanation">即使本金减让为零，展期或降低票息也可能减少现值。两组现金流使用同一折现率，原债券票息保持 6%。</p></>}<Reset onClick={()=>{setInitial(60);setRate(5);setGrowth(3);setSurplus(1);setMaturity(20);setCut(20);setCoupon(3);setExtension(3);setDiscount(8)}}/><div className="experiment-foot">债务路径不计估值和其他存量调整。偿清债务后，新增财政盈余形成的资产未在图中显示。</div></div></>
}

export function Funding() {
  const [domestic,setDomestic]=useState(2),[foreign,setForeign]=useState(5),[forward,setForward]=useState(6.8),[fee,setFee]=useState(0)
  const r=hedgedLoanCost(1000000,7,foreign/100,forward,1,fee), domesticRepayment=1000000*(1+domestic/100)
  return <><div className="experiment-heading"><h2>套期后的融资成本</h2><p>企业需要 100 万元，期限一年。外币借款按即期 7.00 换成人民币，到期购汇偿还。</p></div><div className="experiment-content"><Slider label="人民币贷款利率" amount={domestic} unit="%" min={0} max={10} step={0.1} onChange={setDomestic}/><Slider label="美元贷款利率" amount={foreign} unit="%" min={0} max={10} step={0.1} onChange={setForeign}/><Slider label="购汇偿债的远期报价" amount={forward} unit="CNY / USD" min={6} max={8} step={0.0001} onChange={setForward}/><Slider label="贷款与套期费用／本金" amount={fee} unit="%" min={0} max={2} step={0.1} onChange={setFee}/><dl className="calculation-list"><div><dt>本币贷款偿付额</dt><dd>¥ {money(domesticRepayment)}</dd></div><div><dt>外币贷款套期后偿付额</dt><dd>¥ {money(r.repayment)}</dd></div><div><dt>外币贷款的本币有效成本</dt><dd>{decimal(r.annualRate*100)}%</dd></div></dl><p className="result-explanation">美元利率、购汇远期价格和费用共同决定本币成本。按 CIP 基准定价且不计费用时，两条可比融资路径成本相等。</p><button className="text-button" onClick={()=>setForward(parityForward(7,domestic/100,foreign/100,1))}>采用利率平价基准报价</button><Reset onClick={()=>{setDomestic(2);setForeign(5);setForward(6.8);setFee(0)}}/><div className="experiment-foot">一次性到期还本付息，费用按本金计算并于到期支付，参数为教学报价。实际比较还须统一信用风险、期限、担保和交割条件。</div></div></>
}

export function Hedge() {
  const [method,setMethod]=useState<'forward'|'option'|'natural'>('forward'),[spot,setSpot]=useState(6.5),[forward,setForward]=useState(6.95),[ratio,setRatio]=useState(100),[premium,setPremium]=useState(0.08),[debt,setDebt]=useState(50)
  const cash=exportHedge(100000,spot,forward,ratio/100,method==='option'?'option':'forward',premium)
  return <><div className="experiment-heading"><h2>出口收入与套期保值</h2><p>确定三个月后收取 10 万美元，比较远期、期权和自然对冲。</p></div><Tabs value={method} onChange={setMethod} label="套期工具" items={[["forward","远期"],["option","期权"],["natural","自然对冲"]]}/><div className="experiment-content"><Slider label="收款日即期汇率" amount={spot} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setSpot}/>{method==='natural'?<><Slider label="同日应偿还的美元本金／收入" amount={debt} unit="%" min={0} max={100} step={10} onChange={setDebt}/><Result label="美元收款扣除美元偿债后的净额" result={money(100000*(1-debt/100))} unit="USD"/><Result label="净额折合人民币" result={money(100000*(1-debt/100)*spot)} unit="元"/><p className="result-explanation">美元收入与同日美元债务相抵，剩余金额保留汇率敞口。这里比较的是偿债后的净现金流，未计借款取得时的资金用途和利息。</p></>:<><Slider label={method==='option'?'美元看跌期权行权价':'约定的远期汇率'} amount={forward} unit="CNY / USD" min={6} max={8} step={0.01} onChange={setForward}/><Slider label="套期比例" amount={ratio} unit="%" min={0} max={100} step={25} onChange={setRatio}/>{method==='option'&&<Slider label="期权费／美元" amount={premium} unit="元" min={0} max={0.3} step={0.01} onChange={setPremium}/>}<div className="cash-results"><div><span>不套期收入</span><strong>¥ {money(100000*spot)}</strong></div><div><span>套期后净收入</span><strong>¥ {money(cash)}</strong></div></div><LinePlot points={Array.from({length:21},(_,i)=>({x:6+i*0.1,y:exportHedge(100000,6+i*0.1,forward,ratio/100,method==='option'?'option':'forward',premium)/10000}))} title="到期汇率与人民币收入" xLabel="CNY / USD" yLabel="万元"/><p className="result-explanation">{method==='forward'?'远期锁定套期部分的换汇价格；未套期部分仍随汇率变化。':'美元看跌期权在美元走弱时按行权价出售美元，美元走强时可以按即期价出售。期权费按套期美元金额计，暂不计其资金时间价值。'}</p></>}<Reset onClick={()=>{setSpot(6.5);setForward(6.95);setRatio(100);setPremium(0.08);setDebt(50)}}/><div className="experiment-foot">忽略违约、交易费用与提前终止成本。自然对冲还须匹配金额、期限及现金流确定性。</div></div></>
}

export function Stablecoin() {
  const [cash,setCash]=useState(20),[loss,setLoss]=useState(0),[redemption,setRedemption]=useState(30),[discount,setDiscount]=useState(2)
  const r=stablecoinRedemption(cash,loss,redemption,discount)
  return <><div className="experiment-heading"><h2>稳定币储备与赎回</h2><p>流通代币面值合计 100 百万美元，储备为现金和证券。</p></div><div className="experiment-content"><Slider label="现金占储备比例" amount={cash} unit="%" min={0} max={100} step={5} onChange={setCash}/><Slider label="证券市值损失" amount={loss} unit="%" min={0} max={20} onChange={setLoss}/><Slider label="本次赎回的代币比例" amount={redemption} unit="%" min={0} max={100} step={5} onChange={setRedemption}/><Slider label="紧急出售的额外折价" amount={discount} unit="%" min={0} max={10} onChange={setDiscount}/><dl className="calculation-list" aria-live="polite"><div><dt>赎回前储备市值</dt><dd>{decimal(r.assetsBefore)}</dd></div><div><dt>即时现金缺口</dt><dd>{decimal(r.cashGap)}</dd></div><div><dt>实际按面值支付</dt><dd>{decimal(r.paid)}</dd></div><div><dt>未满足的赎回金额</dt><dd className={r.unfilled>0?'negative-result':''}>{decimal(r.unfilled)}</dd></div><div><dt>赎回后资产／剩余代币负债</dt><dd>{r.coverageAfter===null?'负债已清偿':decimal(r.coverageAfter*100)+'%'}</dd></div></dl><p className="result-explanation">先用现金，再出售证券。提前赎回者按面值收款，折价出售的损失可能更多留给剩余持有人。市值充足与即时现金充足需要分别判断。</p><Reset onClick={()=>{setCash(20);setLoss(0);setRedemption(30);setDiscount(2)}}/><div className="experiment-foot">金额单位为百万美元。按顺序足额兑付至可变现储备耗尽，未计破产分配、托管冻结和价格反馈。</div></div></>
}

export function Sharing() {
  const [home,setHome]=useState(-20),[foreign,setForeign]=useState(10),[share,setShare]=useState(40)
  const domestic=100+home, international=(1-share/100)*domestic+share/100*(100+foreign)
  return <><div className="experiment-heading"><h2>跨境资产与风险分担</h2><p>初始资产收入指数为 100。比较全部持有本国资产与部分持有外国股权。</p></div><div className="experiment-content"><Slider label="本国资产收入冲击" amount={home} unit="%" min={-40} max={40} step={5} onChange={setHome}/><Slider label="外国资产收入冲击" amount={foreign} unit="%" min={-40} max={40} step={5} onChange={setForeign}/><Slider label="外国资产占组合比例" amount={share} unit="%" min={0} max={100} step={10} onChange={setShare}/><div className="cash-results"><div><span>全部本国资产</span><strong>{decimal(domestic)}</strong></div><div><span>跨境资产组合</span><strong>{decimal(international)}</strong></div></div><p className="result-explanation">不同经济体冲击不同，外国资产收入可以弥补本国收入损失；两地同时下降时，分散持有不能消除共同冲击。</p><Reset onClick={()=>{setHome(-20);setForeign(10);setShare(40)}}/><div className="experiment-foot">固定资产权重、相同初始收入率，不计汇率和交易成本。展示一种实现状态，不是最优投资组合。</div></div></>
}

export function Trilemma() {
  const [chosen,setChosen]=useState([false,true,true])
  const labels=['固定汇率','资本自由流动','独立利率政策'], count=chosen.filter(Boolean).length
  const explanation=count===3?'三项目标同时完整实现时，预期收益差会引起资产转换，固定平价与独立利率发生冲突。':chosen[0]&&chosen[1]?'可信固定汇率与自由资本流动使本国利率趋向锚国利率。':chosen[0]&&chosen[2]?'维持固定平价又保留独立利率，需要限制或管理资本流动。':chosen[1]&&chosen[2]?'汇率变动及其预期为国内外利率差提供调整空间。':'选择两项目标，比较相应的政策约束。'
  return <><div className="experiment-heading"><h2>三元悖论与政策配置</h2><p>选择希望完整实现的目标。</p></div><div className="trilemma-options">{labels.map((label,i)=><button aria-pressed={chosen[i]} className={chosen[i]?'selected':''} key={label} onClick={()=>setChosen(items=>items.map((value,j)=>i===j?!value:value))}><span className="answer-circle">{chosen[i]&&<Check size={12}/>}</span>{label}</button>)}</div><div className={'trilemma-result'+(count===3?' conflict':'')} role="status"><strong>{count===3?'存在制度冲突':count===2?'一种角点配置':'选择政策目标'}</strong><p>{explanation}</p></div><p className="result-explanation">现实中的管理浮动、部分资本开放与中间配置，还涉及储备、风险溢价、制度可信度和政策力度。</p><Reset onClick={()=>setChosen([false,true,true])}/></>
}

export function Iip() {
  const [spot,setSpot]=useState(7),[price,setPrice]=useState(0),[flow,setFlow]=useState(0)
  const r=iipReconciliation(spot,price/100,flow)
  return <><div className="experiment-heading"><h2>流量、存量与估值</h2><p>期初对外资产 100 百万美元，对外负债为 500 百万元人民币；初始汇率 7.00。</p></div><div className="experiment-content"><Slider label="期末人民币／美元汇率" amount={spot} unit="CNY / USD" min={6} max={9} step={0.1} onChange={setSpot}/><Slider label="原有美元资产的价格变动" amount={price} unit="%" min={-20} max={20} step={5} onChange={setPrice}/><Slider label="当期对外净贷出形成的美元资产" amount={flow} unit="百万美元" min={0} max={20} step={5} onChange={setFlow}/><dl className="calculation-list" aria-live="polite"><div><dt>期初对外净资产</dt><dd>{decimal(r.initialNet)}</dd></div><div><dt>金融账户净贷出</dt><dd>+{decimal(r.transaction)}</dd></div><div><dt>价格与汇率估值变化</dt><dd>{decimal(r.valuation)}</dd></div><div><dt>期末对外净资产</dt><dd>{decimal(r.finalNet)}</dd></div></dl><p className="result-explanation">期末净资产 = 期初净资产 + 交易 + 估值变化。即使净贷出为零，汇率或证券价格变化也会改变净头寸。</p><Reset onClick={()=>{setSpot(7);setPrice(0);setFlow(0)}}/><div className="experiment-foot">结果单位为百万元人民币。新交易按期末汇率成交，不计其后价格变动；人民币负债保持不变。</div></div></>
}
