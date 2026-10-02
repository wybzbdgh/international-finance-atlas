"""Make the website's Source Han Serif SC subsets from Adobe's official OTFs.

Requires: fonttools[woff]. Pass the Regular and SemiBold CN-region OTF files.
The original binaries are not committed; sources and license are in fonts/README.md.
"""
from pathlib import Path
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
font_paths = [Path(arg) for arg in sys.argv[1:]]
if len(font_paths) != 2:
    raise SystemExit('Usage: subset-fonts.py SourceHanSerifCN-Regular.otf SourceHanSerifCN-SemiBold.otf')
destination = ROOT / 'src/assets/fonts'
destination.mkdir(parents=True, exist_ok=True)

text = ''.join(p.read_text() for p in (ROOT / 'src').rglob('*') if p.suffix in {'.ts', '.tsx', '.css'})
text += (ROOT / 'public/data/countries.json').read_text()
text += ''.join(chr(i) for i in range(32, 127))
text += '−–—×÷≈≠≤≥∗πρ∆¥￥€£→←↑↓＋％［］（）【】《》“”‘’：；！？、。·'

for font_path, style in zip(font_paths, ['Regular', 'Semibold']):
    instance = TTFont(font_path)
    options = subset.Options()
    options.layout_features = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(instance)
    covered = set(instance.getBestCmap())
    missing_cjk = {c for c in text if '\u4e00' <= c <= '\u9fff' and ord(c) not in covered}
    if missing_cjk:
        raise SystemExit('Missing CJK glyphs: ' + ''.join(sorted(missing_cjk)))
    # The subset is a derivative; use a new internal family name.
    names = {
        1: 'Huiliu Serif SC', 2: style,
        3: f'Huiliu Serif SC 2.003 {style}',
        4: f'Huiliu Serif SC {style}',
        6: f'HuiliuSerifSC-{style}',
        16: 'Huiliu Serif SC', 17: style,
    }
    for record in instance['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding(), errors='replace')
    if 'CFF ' in instance:
        cff = instance['CFF '].cff
        cff.fontNames = [names[6]]
        top = cff.topDictIndex[0]
        top.FamilyName = names[1]
        top.FullName = names[4]
        if hasattr(top, 'FontName'):
            top.FontName = names[6]
    instance.flavor = 'woff2'
    target = destination / f'huiliu-serif-sc-{style.lower()}.woff2'
    instance.save(target)
    print(f'{target.name}: {target.stat().st_size:,} bytes; {len(covered)} glyphs')
