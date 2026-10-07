# 汇率地图：数据与交互口径

## 汇率与历史比较

数据来自 [Frankfurter 官方 API](https://frankfurter.dev/)。报价为每日参考价。USD 为共同套算基准，目标货币的 USD 报价除以本币的 USD 报价，得到每单位本币能兑换的目标货币数量。两个报价腿分别保留自己的参考日期；当天没有发布数据时，日期查询可能返回最近的参考价。

历史曲线查询日频记录，不以月度聚合值代替指定日的汇率。货币对只在同一天两个报价腿都有效时计算；缺数据不补零、不向前填充。多币种比较取各序列日期的交集，并在同一共同日期设为 100。移到曲线或使用方向键，可读取同一天的指数、涨跌幅和原始货币对报价。

时间回放分为近一年（每月一步）、近五年（每季度一步）和 2008 年起（每年一步）。日期输入框也可指定任意日期。播放逐步读取参考价，取得本期和对比日数据后再前进；暂停后读取截至所选日期的历史曲线。API 请求有超时、失败重试、共享缓存和返回结果的查询标识，避免连续切换时将旧查询显示为新日期。

金额换算使用同一货币对参考价，不含点差、手续费或实际成交条件。单位、反向报价和目标币种始终显示。无报价、空金额和无效金额显示空结果。

## 货币区域与币制更替

世界边界延续原有 [Natural Earth](https://www.naturalearthdata.com/) 数据；基础币种匹配来自 [world-countries](https://github.com/mledoze/countries)，派生地理数据库遵循现有 ODbL 条款。历史也按现行国界展示，不能据此判断历史领土。

主要流通货币的替换日期在 `src/map-data.js` 中单独维护。更替前使用前身代码，更替后使用后继代码。选定国家的走势不早于其采用当前单位的日期；不同单位不拼接，也不计算跨越更替日的 30 日涨跌。委内瑞拉 2021 年币值重定后仍沿用 VES，另外设置单位起点。津巴布韦显示本国货币；2019 年 6 月以前的复杂多币制时期保留未匹配状态。图层不穷尽所有法定货币、辅币或境外结算货币。

| 日期 / 变化 | 核查来源 |
| --- | --- |
| 保加利亚，2026-01-01，BGN → EUR | [欧洲央行加入欧元区公告](https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260101~c830245e42.en.html) |
| 克罗地亚，2023-01-01，HRK → EUR | [欧洲央行采用欧元公告](https://www.ecb.europa.eu/press/pr/date/2022/html/ecb.pr220712~b97dd38de3.en.html) |
| 立陶宛、拉脱维亚、爱沙尼亚、斯洛伐克采用欧元 | [欧洲央行欧元转换资料](https://www.ecb.europa.eu/euro/changeover/html/index.en.html)、[各国加入日期](https://www.ecb.europa.eu/euro/intro/html/index.nb.html) |
| 库拉索、荷属圣马丁，2025-03-31，ANG → XCG | [当地中央银行公告](https://www.centralbank.cw/index.php/publications/press-releases/2024/pb-2024-001-caribbean-guilder-to-be-introduced-in-2025)、[发行前公告](https://cdn.centralbank.cw/media/press_releases_2025/20250325_pb2025_006_pre_introduction_xcg_en.pdf) |
| 塞拉利昂，2022-07-01，SLL → SLE | [塞拉利昂银行金融包容通讯](https://bsl.gov.sl/BSL%20FI%20Newsletter%20Issue%201_Final.pdf) |
| 赞比亚，2013-01-01，ZMK → ZMW | [赞比亚银行公告](https://www.boz.zm/17-2012.pdf)、[货币历史](https://www.boz.zm/currency/currency-history) |
| 白俄罗斯，2016-07-01，BYR → BYN | [白俄罗斯国家银行 2016 统计年鉴](https://www.nb-rb.by/engl/publications/bulletinyearbook/stat_bulletin_yearbook%202016_en.pdf) |
| 毛里塔尼亚，2018-01-01，MRO → MRU | [ISO 4217 修订 165](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/amendments/dl_currency_iso_amendment_165.pdf) |
| 圣多美和普林西比，2018-01-01，STD → STN | [当地中央银行货币改革说明](https://www.bcstp.st/Reforma_Monetaria) |
| 土库曼斯坦，2009-01-01，TMM → TMT | [ISO 4217 修订 142](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/amendments/dl_currency_iso_amendment_142.pdf) |
| 委内瑞拉，2018-08-20，VEF → VES | [ISO 4217 修订 168](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/amendments/dl_currency_iso_amendment_168.pdf) |
| 委内瑞拉，2021-10-01，VES 币值重定，代码沿用 | [ISO 4217 修订 170](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/amendments/dl_currency_iso_amendment_170.pdf) |
| 津巴布韦，2019-06-24，显示 ZWL；2024-04-05，显示 ZWG | [津巴布韦储备银行 2019 年报](https://www.rbz.co.zw/documents/ar/RBZ-ANNUAL-REPORT-2019.pdf)、[2024 货币政策摘要](https://rbz.co.zw/documents/mps/2024/2024_Monetary_Policy_Statement_at_a_Glance.pdf) |
| 南苏丹，2011-07-18，SSP | [南苏丹银行纸币说明](https://boss.gov.ss/bank-notes/) |

这些日期表示货币单位的更替，不等于每家汇率数据提供机构的覆盖起点。旧、新钞并行的过渡期也不能视为两套独立市场收益率。

## 汇率制度

采用 [IMF Annual Report 2025 Appendices](https://www.imf.org/external/pubs/ft/ar/2025/pdfs/imf-annual-report-2025-appendices.pdf) 中 Appendix II.9，*De Facto Classification of Exchange Rate Arrangements and Monetary Policy Frameworks, April 30, 2025*。已逐项核对原表。10 类具体安排保留在国家面板中；地图将其合并为四组，以便辨认颜色。

| 图例 | 原表具体类别 |
| --- | --- |
| 硬盯住 | 无单独法定货币；货币局 |
| 软盯住 | 传统盯住；稳定安排；爬行盯住；类似爬行安排；水平区间盯住 |
| 其他管理安排 | 其他管理安排 |
| 浮动 | 浮动；自由浮动 |

原表列出 195 个分类单位；库拉索与荷属圣马丁合列，地图按两个 ISO 地区处理，共 196 个唯一代码。分类无法匹配的地理实体保持中性颜色，不推断其制度。

资料主要截至 2025-04-30。原表脚注明确：阿富汗和委内瑞拉截至 2021-04-30，叙利亚截至 2017-04-30。页面显示所选国家自己的资料日期。制度图层固定于这份资料，隐藏历史播放控件；例如保加利亚在本表仍为货币局，不能当作 2026 年的制度。

四组配色使用银灰、薄荷、浅棕和蓝灰。所选国家用边界标记，筛选后降低其他组的透明度；不让单一高亮填色覆盖原有制度颜色。颜色之外也提供文字图例与具体分类。
