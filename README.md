# 汇流 · 国际金融互动图谱

一个面向《国际金融》课程的小组网站：用可点击的世界地图查看每日参考汇率与历史走势，再通过课程专题、政策实验、案例和经典阅读把数据与理论连起来。

## 网站包含什么

- **世界地图**：242 个国家及地区边界；地球 / 平面视图、搜索和快捷切换。每个地区都可点击；有 Frankfurter 报价时显示美元兑当地货币、当地货币兑人民币和过去 90 天走势。缺少报价时明确说明。
- **30 日变化图层**：统一比较“每 1 美元可兑换多少当地货币”的百分比变化。红色代表本币相对美元贬值，绿色代表升值。原始汇率水平不作为跨国颜色比较依据。
- **六个课程专题**：国际收支、汇率定价、开放经济政策、危机、企业外汇风险、国际货币体系。
- **两个交互实验**：不可能三角的政策目标选择，以及出口订单的远期锁汇试算。
- **阅读与案例**：蒙代尔、Dornbusch、Krugman 的经典论文入口；1997、2008、2015 年案例入口。

## 数据与教学边界

- 汇率来自 [Frankfurter](https://frankfurter.dev/)，属于**每日参考价**，不是盘中实时价，也不是银行可成交报价。非交易日可能显示最近一个数据日。网页会展示实际数据日期。
- 国家边界来自 [Natural Earth 1:50m](https://www.naturalearthdata.com/)，为公有领域数据；地图仅用于教学展示，不表达政治立场。极小地区在地图上可使用搜索框定位。
- 国家与币种的对应以 [world-countries](https://www.npmjs.com/package/world-countries) 数据包为基础。多币种地区仅选一个主要币种用于演示，无法精确代表当地所有支付场景。
- `public/data/countries.json` 中的币种映射派生自 world-countries，其数据库条款见 [`public/data/ODbL-LICENSE.txt`](public/data/ODbL-LICENSE.txt)；派生数据库按 ODbL 1.0 共享。
- 锁汇实验中的远期汇率是用户设定的教学假设；未计交易成本、信用风险、结算时点和会计处理。

## 在 Mac 上运行

需要 Node.js 24 和 pnpm 11。

```bash
git clone https://github.com/你的用户名/international-finance-atlas.git
cd international-finance-atlas
pnpm install
pnpm dev
```

打开终端显示的本地地址。提交前运行：

```bash
pnpm build
```

## 发布到 GitHub Pages

仓库中的 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 会在 `main` 分支更新后自动构建并发布。GitHub 仓库的 **Settings → Pages → Build and deployment** 需要设置为 **GitHub Actions**。Vite 会依据 `GITHUB_REPOSITORY` 自动设置子路径，所以网址格式为 `https://用户名.github.io/international-finance-atlas/`。

## 内容维护

专题、案例、阅读入口位于 `src/App.tsx` 顶部的数据数组；样式位于 `src/styles.css`。汇率由浏览器直接向 Frankfurter 请求，无需 API 密钥或后端。
