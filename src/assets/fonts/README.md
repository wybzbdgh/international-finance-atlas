# 网站字体

正文与标题使用 Adobe 思源宋体（Source Han Serif）的简体中文区域版，Regular（400）和 SemiBold（600）。本站从官方 2.003 版 OTF 提取实际使用的字符，转换为 WOFF2，并以 `font-display: swap` 自托管。

- [官方项目](https://github.com/adobe-fonts/source-han-serif)
- [Regular 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/SubsetOTF/CN/SourceHanSerifCN-Regular.otf)
- [SemiBold 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/SubsetOTF/CN/SourceHanSerifCN-SemiBold.otf)
- [SIL Open Font License 1.1](./OFL-SourceHanSerif.txt)

界面的中文文字使用思源黑体 Regular、Medium，自 Adobe 官方 2.005 版简体中文区域 OTF 生成子集；西文与数据数字使用 Inter Variable。价格、日期、图表和表格统一使用 Inter 的普通零字形与等宽数字特性。页面不再加载 Geist Mono 或 SF Mono。

- [思源黑体官方项目](https://github.com/adobe-fonts/source-han-sans)
- [Regular 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/SubsetOTF/CN/SourceHanSansCN-Regular.otf)
- [Medium 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/SubsetOTF/CN/SourceHanSansCN-Medium.otf)
- [思源黑体许可证](./OFL-SourceHanSans.txt)

网页子集的内部名称为 Huiliu Serif SC、Huiliu Sans SC，以遵守原字体的保留名称条款。字形未修改轮廓。Inter 由 Fontsource 包随站点打包。数学公式由 KaTeX 排版，其字体与网站一同自托管。

修改正文后若新增汉字，应重新生成字体子集。先将上述两份官方字体下载到仓库以外的临时目录，然后运行：

```sh
python -m pip install 'fonttools[woff]'
python scripts/subset-fonts.py /path/to/SourceHanSerifCN-Regular.otf /path/to/SourceHanSerifCN-SemiBold.otf /path/to/SourceHanSansCN-Regular.otf /path/to/SourceHanSansCN-Medium.otf
```

脚本会收集 `public/pages/` 中的课程与理论文章、入口 `index.html`、`src/` 中的界面文字和国家数据，并检查中文字形覆盖。每次增加正文，应重新生成四份子集。发布前通过浏览器 CSS.getPlatformFontsForNode 检查实际字形来源，不能仅根据 CSS font-family 声明判断字体已生效。
