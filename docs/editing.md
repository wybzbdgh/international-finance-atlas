# 怎么修改网站

网站使用 HTML、CSS 和 JavaScript。没有 TypeScript、TSX、JSX 或 React。文章已经分别存为 HTML；改文字时可以直接找到对应的标题和段落。

## 改文字

课程文章在 `public/pages/course/`，理论文章在 `public/pages/theory/`。两个目录中的 `index.html` 是各自的目录页。最外层的 `index.html` 是全站页眉、导航、页脚和入口。

例如，要改“国际收支与对外资产负债表”，打开 `public/pages/course/accounts.html`，搜索要修改的句子，修改 `<p>……</p>` 中的文字即可。段落上的 `id`、`data-reading-anchor` 和链接应保留，用于搜索定位和恢复阅读位置。

```html
<section class="prose-section" id="accounts-s1">
  <h2>国际收支核算</h2>
  <p id="accounts-s1-p-0" data-reading-anchor>在这里填写正文。</p>
</section>
```

新增段落可以复制一段 `<p>`，再给它一个不重复的 `id`。增加同级小节时，沿用 `.prose-subsection`、`<h3>` 和 `<p>`。如果修改了文章标题，也请修改目录页及相关链接中的标题。

| 课程文章 | 文件 |
| --- | --- |
| 国际金融与大国兴衰 | `foundations.html` |
| 国际账户 | `accounts.html` |
| 外汇市场 | `fx-market.html` |
| 长期汇率 | `long-run.html` |
| 短期汇率 | `short-run.html` |
| 开放经济政策 | `policy.html` |
| 金融全球化 | `globalization.html` |
| 汇率制度 | `regimes.html` |
| 货币危机 | `currency-crises.html` |
| 全球金融危机 | `crisis.html` |
| 主权债务 | `sovereign-debt.html` |
| 国际金融组织 | `governance.html` |
| 中国对外发展金融 | `development-finance.html` |
| 全球金融市场 | `capital-markets.html` |
| 企业融资与汇率风险 | `enterprise.html` |
| 美元体系 | `dollar.html` |
| 金融制裁 | `sanctions.html` |
| 人民币国际化 | `renminbi.html` |
| 数字货币 | `digital-money.html` |
| 未来货币体系 | `future.html` |

理论文章的文件名与网址最后一段对应，例如 `#theory/overshooting` 对应 `public/pages/theory/overshooting.html`。

每篇末尾的 `<script type="application/json" data-page-meta>` 保存分类、排序和关联条目，不是需要运行的代码。普通文字修改无需动它。`src/course-data.json`、`src/theory-data.json` 和 `src/theory-index.json` 是自动生成的搜索数据；不要在这些文件里改正文。

## 改排版、颜色和字体

CSS 都在 `src/`：

- `styles.css`：全站配色、字体、页眉、按钮和基础阅读布局。
- `reading-updates.css`：课程正文、目录和随文交互。
- `figure-updates.css`：图表及图表控件。
- `theory.css`：理论目录和理论文章。
- `atlas-updates.css`：汇率地图、报价、时间回放和货币比较。

中文字体文件在 `src/assets/fonts/`。思源宋体负责阅读文字，思源黑体与 Inter 负责界面、数字。新增文字较多时，按该目录的 README 更新字体子集。

## 改图表和互动

正文通过一个 HTML 挂载点指定交互，例如：

```html
<div data-view="ReadingFigure" data-props='{"kind":"relative-ppp"}' style="display:contents"></div>
```

这个例子会在段落之间放入相对购买力平价图。保留 `kind` 可继续使用现有交互；移动这一整段 HTML 就能移动图表位置。

- `src/components/ReadingFigure.js`、`ExtendedFigures.js`：随文图表。
- `src/components/ReadingActivity.js`：拖动分类、排序、比较等活动。
- `src/components/Experiments.js`、`AdvancedExperiments.js`：计算工具。
- `src/components/WorldAtlas.js`：地图的国家、币种、日期、金额和图层切换。
- `src/components/AtlasMap.js`、`AtlasCharts.js`：地图绘制和汇率曲线。
- `src/lib/`：汇率请求和金融模型的计算。
- `src/main.js`：页面跳转、主题切换和交互挂载。

这些文件都是普通 JavaScript。交互界面用 `lit-html` 这个小型模板库更新 DOM，模板中的标签依然是 HTML；`${...}` 插入数值，`@click`、`@input` 绑定操作。`src/ui/view.js` 集中处理状态和清理工作。地图使用 MapLibre，公式使用 KaTeX。

练习的题干、选项、答案和解析在文章的 `data-view="Quiz"` 挂载点中。`answer` 从 0 起计数，0 表示第一个选项。请同时核对选项和解析。

## 在 Mac 上预览

安装 Node.js 24 和 pnpm 11 后，在项目目录打开终端：

```sh
pnpm install
pnpm dev
```

打开终端给出的 `http://127.0.0.1:...` 地址。修改 HTML 后，本地预览和搜索索引会自动更新。不要双击源文件作为本地预览；地图和文章加载需要 HTTP 服务。

发布前运行：

```sh
pnpm test:models
pnpm build
pnpm preview
```

## 小组协作与发布

每位组员从 `main` 建自己的分支，在分支里修改文件，提交 Pull Request，再合并到 `main`。可以直接在 GitHub 网页上编辑这些 HTML 文件，也可以在 Mac 本地编辑后推送。

`main` 更新后，GitHub Actions 自动检查、构建并发布。线上网址保持为：

[https://wybzbdgh.github.io/international-finance-atlas/](https://wybzbdgh.github.io/international-finance-atlas/)
