# 思源宋体网页子集

正文与标题使用 Adobe 思源宋体（Source Han Serif）的简体中文区域版，Regular（400）和 SemiBold（600）。本站从官方 2.003 版 OTF 提取实际使用的字符，转换为 WOFF2，并以 `font-display: swap` 自托管。

- [官方项目](https://github.com/adobe-fonts/source-han-serif)
- [Regular 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/SubsetOTF/CN/SourceHanSerifCN-Regular.otf)
- [SemiBold 原始字体](https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/SubsetOTF/CN/SourceHanSerifCN-SemiBold.otf)
- [SIL Open Font License 1.1](./OFL-SourceHanSerif.txt)

网页子集的内部名称为 Huiliu Serif SC，以遵守原字体的保留名称条款。字形来自思源宋体，未修改轮廓。Inter 和 Geist Mono 由各自的 Fontsource 包随站点打包。

修改正文后若新增汉字，应重新生成字体子集。先将上述两份官方字体下载到仓库以外的临时目录，然后运行：

```sh
python -m pip install 'fonttools[woff]'
python scripts/subset-fonts.py /path/to/SourceHanSerifCN-Regular.otf /path/to/SourceHanSerifCN-SemiBold.otf
```

脚本会收集 `src/` 与国家数据中的字符，并检查简体中文字形覆盖。
