export type FigureId = 'currency-weight' | 'account-bridge' | 'fx-turnover' | 'big-mac' | 'relative-ppp' | 'uip' | 'overshooting' | 'policy-markets' | 'risk-sharing' | 'securitization' | 'debt-dynamics' | 'equity-markets' | 'hedge-payoff' | 'dollar-network' | 'payment-route' | 'cips-growth' | 'reserve-gold' | 'iip-valuation' | 'balassa-samuelson' | 'cip-cashflow' | 'j-curve' | 'currency-mismatch' | 'repo-liquidity' | 'policy-capital-mobility' | 'money-adjustment' | 'specie-flow' | 'intertemporal-choice'
export const figureTitles: Record<FigureId, string> = {
  'currency-weight': '经济权重与货币使用', 'account-bridge': '从国内支出到国民可支配总收入',
  'fx-turnover': '主要货币的外汇成交份额', 'big-mac': '巨无霸的跨国价格差',
  'relative-ppp': '通胀差与汇率的长期变化', uip: '外汇市场的均衡',
  overshooting: '货币扩张与汇率超调', 'policy-markets': 'IS-LM 与外汇市场的联动',
  'risk-sharing': '跨国持有资产与风险分担', securitization: '证券化链条与损失分层',
  'debt-dynamics': '利率、增长与债务率', 'equity-markets': '全球股票市场的市值结构',
  'hedge-payoff': '远期与期权的套期保值', 'dollar-network': '全球美元网络的反馈',
  'payment-route': '一笔跨境美元支付的路径', 'cips-growth': 'CIPS 业务活动的扩张',
  'reserve-gold': '外汇储备与央行购金',
  'iip-valuation': '净对外资产：交易与重估',
  'balassa-samuelson': '部门生产率与实际汇率',
  'cip-cashflow': '存款、换汇与远期套保',
  'j-curve': '贬值后的贸易收支：J 曲线',
  'currency-mismatch': '外币债务与净资产',
  'repo-liquidity': '抵押品折扣与融资缺口',
  'policy-capital-mobility': '资本流动条件与政策效果',
  'money-adjustment': '货币、物价、利率与汇率的调整',
  'specie-flow': '价格与铸币流动',
  'intertemporal-choice': '两期消费与经常账户',
}

// Values transcribed from the supplied lecture's labeled figures and tables.
// Source locations and precision are documented in docs/interactive-figures.md.
export const weightMetrics = [
  { label: '经济规模', year: '2025 年', values: [16.5, 26, 15.2], unit: '占世界 GDP 的比重', note: '按现价美元计算。经济规模与货币的国际使用分别衡量不同对象。' },
  { label: '货物贸易', year: '2025 年', values: [12, 10.7, 23.4], unit: '占世界货物贸易的比重', note: '欧元区口径包含区内贸易，与单一经济体的统计边界不同。' },
  { label: '官方储备', year: '2026 年第一季度', values: [2, 57.1, 20], unit: '占全球官方外汇储备的比重', note: 'COFER 统计外汇储备的币种构成，不包含黄金。' },
  { label: '国际支付', year: '2026 年 7 月', values: [3.1, 51, 21.8], unit: '占 Swift 网络支付金额的比重', note: 'Swift 统计其网络内的支付金额，并不覆盖全部支付渠道。' },
]
export const fxYears = [2013, 2016, 2019, 2022, 2025]
export const fxShares = [
  { name: '美元', values: [87, 87.6, 88.3, 88.4, 89.1] },
  { name: '欧元', values: [33.4, 31.4, 32.3, 30.6, 28.5] },
  { name: '日元', values: [23, 21.6, 16.8, 16.7, 16.9] },
  { name: '英镑', values: [11.8, 12.8, 12.8, 12.9, 10.2] },
  { name: '人民币', values: [2.2, 4, 4.3, 7, 8.6] },
  { name: '瑞士法郎', values: [5.2, 4.8, 4.9, 5.2, 6.3] },
]
export const bigMac = [
  { name: '瑞士', value: 48 }, { name: '挪威', value: 23 }, { name: '英国', value: 16 },
  { name: '欧元区', value: 15 }, { name: '墨西哥', value: 1 }, { name: '土耳其', value: -4 },
  { name: '加拿大', value: -9 }, { name: '巴西', value: -27 }, { name: '韩国', value: -39 },
  { name: '中国', value: -40 }, { name: '南非', value: -45 }, { name: '日本', value: -51 },
  { name: '越南', value: -53 }, { name: '印度尼西亚', value: -59 }, { name: '印度', value: -59 },
]
export const equityShares = [
  { name: '美国', value: 49.1 }, { name: '中国内地', value: 9.3 }, { name: '欧盟', value: 8.7 },
  { name: '日本', value: 5 }, { name: '印度', value: 4.1 }, { name: '中国香港', value: 3.6 },
  { name: '英国', value: 3.5 }, { name: '加拿大', value: 2.7 }, { name: '澳大利亚', value: 1.4 },
  { name: '新加坡', value: .5 }, { name: '其他', value: 12.3 },
]

// CIPS official "Services in Historical Years", observed annual totals.
// Source URL and partial first-year caveat are documented with the chart.
export const cipsHistory = [
  { year: 2015, transactions: 86703, amountBillion: 480.9 },
  { year: 2016, transactions: 636146, amountBillion: 4361.8 },
  { year: 2017, transactions: 1259063, amountBillion: 14554.0 },
  { year: 2018, transactions: 1442382, amountBillion: 26446.3 },
  { year: 2019, transactions: 1884288, amountBillion: 33925.5 },
  { year: 2020, transactions: 2204912, amountBillion: 45271.9 },
  { year: 2021, transactions: 3341641, amountBillion: 79599.9 },
  { year: 2022, transactions: 4400375, amountBillion: 96696.2 },
  { year: 2023, transactions: 6613290, amountBillion: 123063.6 },
  { year: 2024, transactions: 8216891, amountBillion: 175492.8 },
  { year: 2025, transactions: 8441897, amountBillion: 180152.7 },
]
