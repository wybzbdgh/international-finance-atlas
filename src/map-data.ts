import type { LessonId } from './content'
import { currencyLabels } from './currency-names.ts'

export type Country = { id: number; iso: string; name: string; nameEn: string; currency: string | null; continent: string; labelX: number; labelY: number }
export type CountryFeature = { type: 'Feature'; id: number; properties: Omit<Country, 'id'>; geometry: GeoJSON.Geometry }
export type CountryData = { type: 'FeatureCollection'; features: CountryFeature[] }
export type MapMode = 'rates' | 'regions' | 'regimes'
export const commonNames: Record<string, string> = { CHN: '中国', USA: '美国', GBR: '英国', DEU: '德国', RUS: '俄罗斯', KOR: '韩国', PRK: '朝鲜', VNM: '越南', IRN: '伊朗', LAO: '老挝' }
export const countryName = (country: Country) => commonNames[country.iso] || country.name
export const quoteCurrencies = [
  { code: 'CNY', name: '人民币' }, { code: 'USD', name: '美元' }, { code: 'JPY', name: '日元' },
  { code: 'EUR', name: '欧元' }, { code: 'GBP', name: '英镑' }, { code: 'CHF', name: '瑞士法郎' },
]
const localCurrencyNames: Record<string, string> = { XCG: '加勒比盾', ZWG: '津巴布韦金', SLE: '塞拉利昂利昂', XOF: '西非法郎', XAF: '中非法郎', XCD: '东加勒比元' }
export const currencyName = (code: string) => quoteCurrencies.find(item => item.code === code)?.name || localCurrencyNames[code] || currencyLabels[code] || code
export const fmtRate = (n: number) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: n < .01 ? 8 : n < 1 ? 6 : 4, minimumFractionDigits: n < 10 ? 2 : 0 }).format(n)
export const fmtAmount = (n: number) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: n > 0 && n < .01 ? 6 : 2 }).format(n)

// Current-country boundaries are used throughout. Dated replacements prevent a
// historical observation from being labeled with a successor currency.
const replacements: Record<string, { date: string; before: string; after: string }> = {
  BGR: { date: '2026-01-01', before: 'BGN', after: 'EUR' },
  HRV: { date: '2023-01-01', before: 'HRK', after: 'EUR' },
  LTU: { date: '2015-01-01', before: 'LTL', after: 'EUR' },
  LVA: { date: '2014-01-01', before: 'LVL', after: 'EUR' },
  EST: { date: '2011-01-01', before: 'EEK', after: 'EUR' },
  SVK: { date: '2009-01-01', before: 'SKK', after: 'EUR' },
  CUW: { date: '2025-03-31', before: 'ANG', after: 'XCG' },
  SXM: { date: '2025-03-31', before: 'ANG', after: 'XCG' },
  SLE: { date: '2022-07-01', before: 'SLL', after: 'SLE' },
  ZMB: { date: '2013-01-01', before: 'ZMK', after: 'ZMW' },
  BLR: { date: '2016-07-01', before: 'BYR', after: 'BYN' },
  MRT: { date: '2018-01-01', before: 'MRO', after: 'MRU' },
  STP: { date: '2018-01-01', before: 'STD', after: 'STN' },
  TKM: { date: '2009-01-01', before: 'TMM', after: 'TMT' },
  VEN: { date: '2018-08-20', before: 'VEF', after: 'VES' },
}
export function currencyAt(country: Pick<Country, 'iso' | 'currency'>, date: string): string | null {
  const replacement = replacements[country.iso]
  // Zimbabwe has several legal currencies. Show its domestic currency, not the
  // alphabetically first foreign currency in the upstream countries catalogue.
  if (country.iso === 'ZWE') {
    if (date >= '2024-04-05') return 'ZWG'
    if (date >= '2019-06-24') return 'ZWL'
    // Earlier periods included several foreign monies and domestic currency
    // changes. Do not assign the whole multi-currency period a single unit.
    return null
  }
  if (country.iso === 'SSD' && date < '2011-07-18') return null
  return replacement ? (date >= replacement.date ? replacement.after : replacement.before) : country.currency
}

export function currencyEpochStart(country: Pick<Country, 'iso' | 'currency'>, date: string): string {
  if (country.iso === 'ZWE') return date >= '2024-04-05' ? '2024-04-05' : '2019-06-24'
  if (country.iso === 'SSD') return '2011-07-18'
  // Venezuela changed the scale again without retiring the VES ISO code.
  if (country.iso === 'VEN' && date >= '2021-10-01') return '2021-10-01'
  const replacement = replacements[country.iso]
  return replacement && date >= replacement.date ? replacement.date : '2008-01-01'
}

export const regimeSource = { date: '2025-04-30', title: 'IMF Annual Report 2025 · Appendix II.9', url: 'https://www.imf.org/external/pubs/ft/ar/2025/pdfs/imf-annual-report-2025-appendices.pdf' }
export const regimeGroups = {
  hard: { label: '硬盯住', dark: '#b8c4cc', light: '#7e929f', description: '使用外币，或以货币局维持兑换承诺。' },
  soft: { label: '软盯住', dark: '#7eaf9e', light: '#558d7d', description: '包括传统盯住、稳定安排、爬行安排和区间盯住。' },
  managed: { label: '其他管理安排', dark: '#baaa8c', light: '#9f8965', description: '不属于上述盯住或浮动类别的管理安排。' },
  floating: { label: '浮动', dark: '#86a8bb', light: '#658b9e', description: '包括浮动与自由浮动；具体分类见国家说明。' },
}
export type RegimeGroup = keyof typeof regimeGroups
export const regimeClasses = {
  'no-separate': { label: '无单独法定货币', group: 'hard', isos: 'ECU SLV MHL FSM PLW PAN TLS AND XKX SMR MNE KIR LIE NRU TUV' },
  board: { label: '货币局', group: 'hard', isos: 'DJI HKG ATG DMA GRD KNA LCA VCT BIH BGR BRN MAC' },
  peg: { label: '传统盯住', group: 'soft', isos: 'ABW BHS BHR BRB BLZ CUW SXM ERI IRQ JOR OMN QAT SAU TKM ARE CPV COM DNK STP BEN BFA CIV GNB MLI NER SEN TGO CMR CAF TCD COG GNQ GAB FJI LBY BTN SWZ LSO NAM NPL WSM SLB' },
  stabilized: { label: '稳定安排', group: 'soft', isos: 'GUY LBN MDV NIC TTO MKD DZA AGO BOL GIN MMR SLE TJK ARM IND KEN ROU SRB AZE HTI MWI MRT MOZ PAK SDN' },
  crawling: { label: '爬行盯住', group: 'soft', isos: 'HND BWA ARG' },
  'crawl-like': { label: '类似爬行安排', group: 'soft', isos: 'KHM UKR SGP VNM AFG BGD BDI CHN COD PNG TZA GMB RWA ALB CRI DOM GTM JAM MNG PRY TUR UZB EGY LAO TUN' },
  band: { label: '水平区间盯住', group: 'soft', isos: 'MAR' },
  managed: { label: '其他管理安排', group: 'managed', isos: 'IRN KWT SYR ETH ZWE GHA LKA KGZ SSD TON VUT VEN' },
  floating: { label: '浮动', group: 'floating', isos: 'BLR LBR MDG NGA SYC SUR YEM BRA COL CZE GEO HUN ISL IDN ISR KAZ KOR MUS MDA NZL PER PHL ZAF THA UGA URY MYS CHE ZMB' },
  free: { label: '自由浮动', group: 'floating', isos: 'AUS CAN CHL JPN MEX NOR POL RUS SWE GBR SOM USA AUT BEL HRV CYP EST FIN FRA DEU GRC IRL ITA LVA LTU LUX MLT NLD PRT SVK SVN ESP' },
} satisfies Record<string, { label: string; group: RegimeGroup; isos: string }>
export const regimeByIso = Object.fromEntries(Object.entries(regimeClasses).flatMap(([key, item]) => item.isos.split(' ').map(iso => [iso, { key, label: item.label, group: item.group as RegimeGroup, date: ['AFG', 'VEN'].includes(iso) ? '2021-04-30' : iso === 'SYR' ? '2017-04-30' : regimeSource.date }])))

export const relatedReadings: Record<string, { id: LessonId; title: string; section?: 'cases' }[]> = {
  CHN: [{ id: 'regimes', title: '人民币汇率改革与在岸、离岸市场' }, { id: 'renminbi', title: '人民币的境外使用与国际化' }],
  USA: [{ id: 'dollar', title: '美元体系与全球金融周期' }, { id: 'crisis', title: '2008 年全球金融危机' }],
  JPN: [{ id: 'long-run', title: '广场协议、日元升值与资产泡沫', section: 'cases' }, { id: 'policy', title: '汇率与宏观政策的传导' }],
  THA: [{ id: 'currency-crises', title: '1997 年亚洲金融危机', section: 'cases' }, { id: 'crisis', title: '外币债务与货币错配' }],
  DEU: [{ id: 'sovereign-debt', title: '欧债危机与主权银行反馈', section: 'cases' }, { id: 'regimes', title: '货币联盟与最优货币区' }],
  GBR: [{ id: 'foundations', title: '英镑与伦敦国际金融网络' }, { id: 'fx-market', title: '全球外汇市场的组织结构' }],
  RUS: [{ id: 'sanctions', title: '金融制裁与资产冻结', section: 'cases' }, { id: 'dollar', title: '美元网络与国际金融权力' }],
  ARG: [{ id: 'governance', title: '阿根廷 2018 年 IMF 贷款', section: 'cases' }, { id: 'currency-crises', title: '货币局与汇率危机' }],
  BRA: [{ id: 'sovereign-debt', title: '新兴市场的外债与再融资风险' }, { id: 'globalization', title: '资本流动结构与金融开放' }],
}
export const defaultReadings: { id: LessonId; title: string; section?: 'cases' }[] = [{ id: 'fx-market', title: '汇率报价与外汇市场' }, { id: 'long-run', title: '购买力平价与实际汇率' }]
