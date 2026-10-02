import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Search, X } from 'lucide-react'
import { lessons, lessonHref } from '../content'
import { theories, theoryById } from '../theory'
import { eraForYear, theoryEras, theoryHref, theoryKinds, theoryOrigin } from '../theory-navigation'
import type { TheoryEntry } from '../theory-types'
import { figureTitles, type FigureId } from '../figures-data'
import ReadingFigure from './ReadingFigure'
import MathExpression from './MathExpression'
import '../theory.css'

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}

function TheoryDirectory() {
  const [query, setQuery] = useState(() => { try { return sessionStorage.getItem('theory-search') || '' } catch { return '' } })
  const [kind, setKind] = useState(() => { try { return sessionStorage.getItem('theory-filter') || 'all' } catch { return 'all' } })
  useEffect(() => { try { sessionStorage.setItem('theory-search', query); sessionStorage.setItem('theory-filter', kind) } catch { /* Optional preferences. */ } }, [query, kind])
  const [active, setActive] = useState(theoryEras[0].id)
  const needle = query.trim().toLowerCase()
  const filtered = theories.filter(entry => (kind === 'all' || entry.kind === kind) && (!needle || [entry.title, entry.authors, entry.originalTitle, entry.question, entry.yearLabel, ...entry.terms].join(' ').toLowerCase().includes(needle)))
  const groups = theoryEras.map(era => ({ ...era, entries: filtered.filter(entry => eraForYear(entry.year).id === era.id) })).filter(era => era.entries.length)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
      if (visible.length) setActive(visible[0].target.id.replace('era-', ''))
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 })
    document.querySelectorAll('.theory-era').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [query, kind])
  return <main className="shell theory-directory page-enter" id="main-content" tabIndex={-1}>
    <header className="theory-directory-heading"><h1>理论深思</h1><p>原著、推导与争论</p></header>
    <div className="theory-directory-tools"><label className="course-search"><Search size={18} /><span className="sr-only">查找理论、作者或年代</span><input type="search" placeholder="查找理论、作者或年代" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="清除理论搜索" onClick={() => setQuery('')}><X size={15} /></button>}</label><label className="theory-kind-filter"><span className="sr-only">条目类别</span><select value={kind} onChange={event => setKind(event.target.value)}><option value="all">全部条目</option>{Object.entries(theoryKinds).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
    <div className="theory-directory-layout"><aside className="theory-era-nav"><nav aria-label="按年代浏览">{groups.map(era => <button key={era.id} aria-current={active === era.id ? 'true' : undefined} onClick={() => { setActive(era.id); jump('era-' + era.id) }}><span>{era.years}</span>{era.title}</button>)}</nav></aside>
      <div className="theory-chronology">{groups.map(era => <section className="theory-era" id={'era-' + era.id} key={era.id}><header><span>{era.years}</span><h2>{era.title}</h2></header><ol>{era.entries.map(entry => <li key={entry.id}><a href={theoryHref(entry.id)} className="theory-row"><time>{entry.yearLabel}</time><div><div className="theory-row-title"><h3>{entry.title}</h3><ArrowUpRight size={18} /></div><p className="theory-row-author">{entry.authors}<span>{theoryKinds[entry.kind]}</span></p><p className="theory-row-question">{entry.question}</p></div></a></li>)}</ol></section>)}
        {!groups.length && <div className="search-empty" role="status"><p>没有找到对应条目，可以换一个作者姓名或理论名称。</p><button className="text-button" onClick={() => { setQuery(''); setKind('all') }}>清除筛选</button></div>}
      </div>
    </div>
  </main>
}

function OriginalReading({ entry }: { entry: TheoryEntry }) {
  const [mode, setMode] = useState<'both' | 'original' | 'translation'>('both')
  const sources = entry.sources.filter(source => source.quote)
  if (!sources.length) return null
  return <section className="theory-original-reading" id="theory-original"><div className="theory-section-heading"><h2>原文选读</h2><div className="original-language" role="group" aria-label="原文显示方式">{([['both', '对照'], ['original', '原文'], ['translation', '译文']] as const).map(([value, label]) => <button aria-pressed={mode === value} key={value} onClick={() => setMode(value)}>{label}</button>)}</div></div>
    {sources.map(source => <div className="theory-excerpt" key={source.url}>
      {source.excerptLabel && <p className="theory-excerpt-label">{source.excerptLabel}</p>}
      {mode !== 'translation' && <blockquote><p lang={/[\u4e00-\u9fff]/.test(source.quote!) ? 'zh' : 'en'}>{source.quote}</p></blockquote>}
      {source.translation && mode !== 'original' && <p className="theory-translation"><span>{/[\u4e00-\u9fff]/.test(source.quote!) ? '白话释义' : '本站译文'}</span>{source.translation}</p>}
      {!source.translation && mode === 'translation' && <p className="theory-translation">{source.quote}</p>}
      <a className="theory-source-link" href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} /></a>
    </div>)}
  </section>
}

function TheoryArticle({ entry }: { entry: TheoryEntry }) {
  const index = theories.findIndex(item => item.id === entry.id)
  const related = entry.related.map(theoryById).filter((item): item is TheoryEntry => Boolean(item))
  const origin = theoryOrigin(entry.id)
  const courseLessons = entry.lessonIds.map(id => lessons.find(lesson => lesson.id === id)!).filter(Boolean)
  const figure = entry.figure && entry.figure in figureTitles ? entry.figure as FigureId : undefined
  return <main className="shell theory-reader page-enter" id="main-content" tabIndex={-1} data-theory={entry.id}>
    <aside className="theory-reading-nav"><a href="#theory" className="back-link"><ArrowLeft size={14} />年代目录</a><nav aria-label="本篇内容">{entry.sources.some(source => source.quote) && <button onClick={() => jump('theory-original')}>原文选读</button>}{entry.sections.map((section, n) => <button key={section.title} onClick={() => jump('theory-section-' + n)}>{section.title}</button>)}{Boolean(entry.formulas?.length) && <button onClick={() => jump('theory-derivation')}>公式与变量</button>}{figure && <button onClick={() => jump('theory-model')}>模型图表</button>}<button onClick={() => jump('theory-sources')}>原著与参考文献</button></nav>{origin && <a className="theory-return" href={origin}><ArrowLeft size={14} />回到刚才的正文</a>}</aside>
    <article className="theory-article"><header className="theory-article-heading"><div className="theory-bibliography-line"><time>{entry.yearLabel}</time><span>{theoryKinds[entry.kind]}</span></div><h1>{entry.title}</h1><p className="theory-authors">{entry.authors}</p><p className="theory-original-title">{entry.originalTitle}</p><p className="theory-question">{entry.question}</p></header>
      <OriginalReading entry={entry} />
      {entry.sections.map((section, n) => <section className="prose-section" id={'theory-section-' + n} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, i) => <p key={i} id={entry.id + '-p-' + n + '-' + i} data-reading-anchor>{paragraph}</p>)}</section>)}
      {entry.formulas && <section className="theory-derivation" id="theory-derivation"><h2>公式与变量</h2>{entry.formulas.map(formula => <div className="reading-formula" key={formula.expression}><MathExpression expression={formula.expression} /><p>{formula.explanation}</p></div>)}</section>}
      {figure && <section id="theory-model" className="theory-model"><ReadingFigure kind={figure} /><p className="theory-model-caption">图中的数值用于演示上述关系。模型条件与原始理论的区别见图下说明。</p></section>}
      <section className="theory-sources" id="theory-sources"><h2>原著与参考文献</h2><ol>{entry.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={15} /></a><p>{source.note}</p></li>)}</ol></section>
      <section className="theory-connections"><h2>接着读</h2><div className="theory-related">{related.map(item => <a href={theoryHref(item.id)} key={item.id}><span>{item.yearLabel}</span><strong>{item.title}</strong><ArrowRight size={15} /></a>)}</div><details className="theory-course-links" open><summary>课程中的相关章节<ChevronRight size={15} /></summary>{courseLessons.map(lesson => <a href={lessonHref(lesson.id) + '/' + (lesson.sections.find(section => entry.terms.some(term => (section.title + section.paragraphs.join('') + (section.subsections || []).map(sub => sub.title + sub.paragraphs.join('')).join('')).includes(term)))?.id || lesson.sections[0].id)} key={lesson.id}>{lesson.title}<ArrowUpRight size={14} /></a>)}</details></section>
      <nav className="lesson-pagination" aria-label="按年代继续阅读">{index > 0 ? <a href={theoryHref(theories[index - 1].id)}><ArrowLeft size={15} /><span><small>{theories[index - 1].yearLabel}</small>{theories[index - 1].title}</span></a> : <a href="#theory">返回年代目录</a>}{index < theories.length - 1 && <a href={theoryHref(theories[index + 1].id)}><span><small>{theories[index + 1].yearLabel}</small>{theories[index + 1].title}</span><ArrowRight size={15} /></a>}</nav>
    </article>
  </main>
}

export default function TheoryLibrary({ id }: { id?: string }) {
  const entry = theoryById(id)
  if (id && !entry) return <main className="shell theory-reader" id="main-content" tabIndex={-1}><h1>没有找到这篇文章</h1><a className="back-link" href="#theory">返回理论深思目录<ArrowRight size={16} /></a></main>
  return entry ? <TheoryArticle entry={entry} key={entry.id} /> : <TheoryDirectory />
}
