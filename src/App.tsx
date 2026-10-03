import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { courseModules, lessons, lessonById, lessonHref, type ComparisonTable, type Lesson, type Quiz, type Section } from './content'
import Experiment from './components/Experiments'
import ReadingActivity from './components/ReadingActivity'
import { activityTitles } from './activities-data'
import ReadingFigure from './components/ReadingFigure'
import MathExpression from './components/MathExpression'
import { LinkedParagraphs, LessonTheoryReading, theoryLinksForLesson } from './components/TheoryLinks'
import { theoryIndex } from './theory-navigation'
import { restoreReadingPosition, saveReadingPosition } from './lib/reading-position'

const TheoryLibrary = lazy(() => import('./components/TheoryLibrary'))
const WorldAtlas = lazy(() => import('./components/WorldAtlas'))
type Route = { page: 'map' | 'learn' | 'theory'; lesson?: Lesson; section?: string; theoryId?: string }
function readRoute(): Route {
  const hash = window.location.hash.slice(1)
  if (hash === 'theory' || hash.startsWith('theory/')) return { page: 'theory', theoryId: hash.split('/')[1] || undefined }
  if (hash === 'lab') return { page: 'learn', lesson: lessonById('enterprise') }
  if (hash === 'cases') return { page: 'learn', lesson: lessonById('currency-crises') }
  if (['index', 'reading', 'chapters'].includes(hash)) return { page: 'learn' }
  if (hash === 'learn' || hash.startsWith('learn/')) {
    const [, id, section] = hash.split('/')
    return { page: 'learn', lesson: lessonById(id || ''), section: section || undefined }
  }
  return { page: 'map' }
}

function Paragraphs({ texts }: { texts: string[] }) {
  return <>{texts.map((text, i) => <p key={i}>{text}</p>)}</>
}

function ContentTable({ table }: { table: ComparisonTable }) {
  return <><div className="content-table-wrap" tabIndex={0} role="region" aria-label={table.caption}>
    <table className="content-table"><caption>{table.caption}</caption><thead><tr>{table.headers.map(text => <th scope="col" key={text}>{text}</th>)}</tr></thead><tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((text, j) => j === 0 ? <th scope="row" key={j}>{text}</th> : <td key={j}>{text}</td>)}</tr>)}</tbody></table>
  </div><p className="table-scroll-note">表格可左右滑动。</p></>
}

// Search helpers --------------------------------------------------------------

type ParagraphSource = { text: string; id: string; subsection?: NonNullable<Section['subsections']>[number] }
type ParagraphMatch = { text: string; id: string; section: Section; subsection?: NonNullable<Section['subsections']>[number] }
type LessonMatch = { lesson: Lesson; matches: ParagraphMatch[] }

function paragraphSources(section: Section): ParagraphSource[] {
  const sources: ParagraphSource[] = []
  section.paragraphs.forEach((text, i) => sources.push({ text, id: `${section.id}-p-${i}` }))
  section.subsections?.forEach((sub, subIndex) => {
    sub.paragraphs.forEach((text, i) => sources.push({ text, id: `${section.id}-sub-${subIndex}-p-${i}`, subsection: sub }))
  })
  return sources
}

function orderedMatchPositions(text: string, query: string): number[] | null {
  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  const chars = [...normalizedQuery]
  const positions: number[] = []
  let index = 0
  for (const char of chars) {
    const next = normalizedText.indexOf(char, index)
    if (next === -1) return null
    positions.push(next)
    index = next + 1
  }
  return positions
}

function matchesQuery(text: string, query: string): boolean {
  return orderedMatchPositions(text, query) !== null
}

function Highlight({ text, query }: { text: string; query: string }) {
  const positions = orderedMatchPositions(text, query)
  if (!positions) return <>{text}</>
  const posSet = new Set(positions)
  const parts: ReactNode[] = []
  let last = 0
  for (let i = 0; i < text.length; i++) {
    if (posSet.has(i)) {
      if (i > last) parts.push(<span key={`t${last}`}>{text.slice(last, i)}</span>)
      parts.push(<mark key={`m${i}`}>{text[i]}</mark>)
      last = i + 1
    }
  }
  if (last < text.length) parts.push(<span key={`t${last}`}>{text.slice(last)}</span>)
  return <>{parts}</>
}

function searchBodyText(query: string): LessonMatch[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  const result: LessonMatch[] = []
  for (const lesson of lessons) {
    const matches: ParagraphMatch[] = []
    for (const section of lesson.sections) {
      for (const source of paragraphSources(section)) {
        if (matchesQuery(source.text, needle)) {
          matches.push({ text: source.text, id: source.id, section, subsection: source.subsection })
        }
      }
    }
    if (matches.length) result.push({ lesson, matches })
  }
  return result
}

function groupMatchesBySection(matches: ParagraphMatch[]) {
  const groups = new Map<string, { section: Section; subsection?: NonNullable<Section['subsections']>[number]; items: ParagraphMatch[] }>()
  for (const match of matches) {
    const key = match.section.id + '::' + (match.subsection?.title || '')
    if (!groups.has(key)) groups.set(key, { section: match.section, subsection: match.subsection, items: [] })
    groups.get(key)!.items.push(match)
  }
  return [...groups.values()]
}

function ModuleList({ modules, lessons: lessonList }: { modules: typeof courseModules; lessons: typeof lessons }) {
  return <div className="course-module-list">{modules.map(module => {
    const items = lessonList.filter(lesson => lesson.moduleId === module.id)
    if (!items.length) return null
    return <section className="module-section" id={`module-${module.id}`} key={module.id}><div className="module-heading"><h3>{module.title}</h3><p>{module.description}</p></div><div className="module-lessons">{items.map(lesson => <a className="topic-link" href={lessonHref(lesson.id)} key={lesson.id}><div><h4>{lesson.title}</h4><p>{lesson.subtitle}</p></div><ArrowUpRight size={19} /></a>)}</div></section>
  })}</div>
}

function CourseSidebar() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  return <aside className="course-nav" aria-label="课程模块">
    <a className="back-link" href="#map"><ArrowLeft size={14} />返回地图</a>
    <div className="desktop-topic-nav">
      <div className="nav-module-title">课程模块</div>
      <nav>{courseModules.map(module => <a key={module.id} href={`#module-${module.id}`} onClick={event => { event.preventDefault(); scrollTo(`module-${module.id}`) }}>{module.title}<ChevronRight size={13} /></a>)}</nav>
    </div>
  </aside>
}

function SearchResults({ query, results, onClear }: { query: string; results: LessonMatch[]; onClear: () => void }) {
  const total = results.reduce((n, item) => n + item.matches.length, 0)
  return <div className="course-search-results" role="region" aria-label="正文搜索结果">
    <div className="course-search-results-toolbar">
      <p className="search-count" role="status">找到 {total} 处匹配</p>
      <button className="text-button back-to-directory" onClick={onClear}><ArrowLeft size={14} />返回课程目录</button>
    </div>
    {results.map(({ lesson, matches }) => (
      <section className="search-result-lesson" key={lesson.id}>
        <div className="search-result-lesson-heading">
          <h3>{lesson.title}</h3>
          <p>{lesson.subtitle}</p>
          <a className="text-button" href={lessonHref(lesson.id)}>查看专题<ArrowUpRight size={14} /></a>
        </div>
        <div className="search-result-sections">
          {groupMatchesBySection(matches).map(({ section, subsection, items }) => (
            <div className="search-result-section" key={section.id + '::' + (subsection?.title || '')}>
              <h4>{section.title}{subsection ? ` · ${subsection.title}` : ''}</h4>
              <div className="search-result-snippets">
                {items.map(match => (
                  <a key={match.id} href={lessonHref(lesson.id, match.id)} className="search-result-snippet">
                    <p><Highlight text={match.text} query={query} /></p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
}

const titleParts: Partial<Record<Lesson['id'], string[]>> = {
  accounts: ['国际收支与', '对外资产负债表'],
  'long-run': ['长期汇率：', '购买力平价与', '货币分析法'],
  'short-run': ['短期汇率：', '利率平价与', '资产定价'],
  regimes: ['汇率制度选择与', '人民币汇率改革'],
  governance: ['国际金融组织与', '全球金融治理'],
  'capital-markets': ['全球金融市场：', '股票、债券与', '衍生品'],
  enterprise: ['中国企业出海：', '融资与', '汇率风险管理'],
  dollar: ['美元体系：', '特权、责任与', '全球金融周期'],
  'digital-money': ['数字货币与', '国际货币体系变革'],
}

function CourseOverview() {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const bodyResults = useMemo(() => needle ? searchBodyText(needle) : [], [needle])
  const directoryMatches = useMemo(() => {
    if (!needle) return lessons
    return lessons.filter(lesson => {
      const text = [
        lesson.title, lesson.subtitle,
        ...lesson.sections.map(section => section.title),
        ...lesson.sections.flatMap(section => section.subsections?.map(sub => sub.title) || []),
        ...(lesson.cases?.map(item => item.title) || []),
        ...(lesson.readings?.map(item => item.title + ' ' + item.question) || []),
        ...lesson.sections.map(section => section.activity ? activityTitles[section.activity] : '').filter(Boolean),
      ].join(' ')
      return matchesQuery(text, needle)
    })
  }, [needle])

  return <main className="shell course-overview page-enter" id="main-content" tabIndex={-1}>
    <section className="order-intro">
      <div className="order-copy"><span className="context-label">国际金融课程</span><h1>国际金融学<br />课程读本</h1><a href={lessonHref('foundations')} className="primary-button">开始阅读<ArrowRight size={18} /></a></div>
      <figure className="order-image"><img src={import.meta.env.BASE_URL + 'assets/export-port.webp'} width="1440" height="810" alt="货轮停靠集装箱码头的教学情境示意图" /><figcaption>教学情境配图 · AI 生成</figcaption></figure>
    </section>
    <CourseSidebar />
    <section className="course-directory" aria-labelledby="course-directory-title">
      <div className="directory-heading"><h2 id="course-directory-title">课程内容</h2><label className="course-search"><Search size={17} /><span className="sr-only">查找专题</span><input type="search" placeholder="查找专题、理论、段落或关键词" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="清除专题搜索" onClick={() => setQuery('')}><X size={15} /></button>}</label></div>
      {needle ? (
        bodyResults.length ? <SearchResults query={query} results={bodyResults} onClear={() => setQuery('')} /> :
        directoryMatches.length ? <>
          <p className="search-count" role="status">找到 {directoryMatches.length} 个专题</p>
          <ModuleList modules={courseModules} lessons={directoryMatches} />
        </> :
        <div className="search-empty" role="status"><p>没有找到相关专题或段落，请换一个课程术语。</p><button className="text-button" onClick={() => setQuery('')}>清除搜索</button></div>
      ) : (
        <ModuleList modules={courseModules} lessons={lessons} />
      )}
    </section>
  </main>
}

function QuizItem({ quiz, number }: { quiz: Quiz; number: number }) {
  const [choice, setChoice] = useState<number | null>(null)
  return <section className="prediction" data-quiz={quiz.id}><h3>练习 {number}</h3><p>{quiz.question}</p><div className="prediction-options">{quiz.choices.map((text, i) => <button key={text} className={choice === i ? 'chosen' : ''} aria-pressed={choice === i} onClick={() => setChoice(i)}><span className="answer-circle">{choice === i && <Check size={12} />}</span>{text}</button>)}</div>{choice !== null && <div className="prediction-feedback" role="status"><strong>{choice === quiz.answer ? '回答正确' : '正确答案：' + quiz.choices[quiz.answer]}</strong><p>{quiz.explanation}</p></div>}</section>
}

function TopicNavigation({ lesson }: { lesson: Lesson }) {
  const module = courseModules.find(item => item.id === lesson.moduleId)!
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  return <aside className="lesson-nav">
    <a className="back-link" href="#learn"><ArrowLeft size={14} />课程目录</a>
    <label className="mobile-topic-select"><span>选择专题</span><select value={lesson.id} onChange={e => { window.location.hash = lessonHref(e.target.value as Lesson['id']) }}>{courseModules.map(group => <optgroup label={group.title} key={group.id}>{lessons.filter(item => item.moduleId === group.id).map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</optgroup>)}</select></label>
    <div className="desktop-topic-nav"><div className="nav-module-title">{module.title}</div><nav aria-label="当前模块">{lessons.filter(item => item.moduleId === module.id).map(item => <a key={item.id} href={lessonHref(item.id)} aria-current={item.id === lesson.id ? 'page' : undefined}>{item.short}<ChevronRight size={13} /></a>)}</nav>
      <div className="article-contents"><span>本篇内容</span>{lesson.sections.map(section => <button key={section.id} onClick={() => scrollTo(section.id)}>{section.title}</button>)}{lesson.sections.some(section => section.figure || section.subsections?.some(sub => sub.figure)) && <button className="activity-jump" onClick={() => { const section = lesson.sections.find(s => s.figure || s.subsections?.some(sub => sub.figure)); const figure = section?.subsections?.find(sub => sub.figure)?.figure || section?.figure; if (figure) scrollTo('figure-' + figure) }}>正文图表<ArrowRight size={12} /></button>}{lesson.sections.some(section => section.activity) && <button className="activity-jump" onClick={() => { const activity = lesson.sections.find(section => section.activity)?.activity; if (activity) scrollTo('activity-' + activity) }}>随文交互<ArrowRight size={12} /></button>}{lesson.cases && <button onClick={() => scrollTo('topic-cases')}>历史案例</button>}{lesson.readings && <button onClick={() => scrollTo('topic-readings')}>经典文献</button>}{theoryIndex.some(entry => entry.lessonIds.includes(lesson.id)) && <button onClick={() => scrollTo('topic-theories')}>理论深思<ArrowUpRight size={12} /></button>}<button onClick={() => scrollTo('topic-quizzes')}>练习与解析</button></div>
      <details className="module-switcher"><summary>其他模块<ChevronRight size={14} /></summary>{courseModules.filter(item => item.id !== module.id).map(item => <a key={item.id} href={lessonHref(lessons.find(topic => topic.moduleId === item.id)!.id)}>{item.title}<ArrowUpRight size={12} /></a>)}</details>
    </div>
  </aside>
}

function LessonReader({ lesson }: { lesson: Lesson }) {
  const index = lessons.findIndex(item => item.id === lesson.id)
  const module = courseModules.find(item => item.id === lesson.moduleId)!
  const links = useMemo(() => theoryLinksForLesson(lesson), [lesson])
  return <main className="shell reader-page page-enter without-experiment" data-chapter={lesson.id} id="main-content" tabIndex={-1}>
    <TopicNavigation lesson={lesson} />
    <section className="lesson-intro"><div className="lesson-position">{module.title}</div><h1>{(titleParts[lesson.id] || [lesson.title]).map(part => <span className="title-phrase" key={part}>{part}</span>)}</h1><p className="lesson-subtitle">{lesson.subtitle}</p><div className="learning-objectives"><h2>学习要求</h2><ul>{lesson.objectives.map(text => <li key={text}>{text}</li>)}</ul></div></section>
    <article className="lesson-body">
      {lesson.sections.map(section => <section className="prose-section" id={section.id} key={section.id}><h2>{section.title}</h2><LinkedParagraphs texts={section.paragraphs} links={links} anchorPrefix={section.id} />{section.subsections?.map((sub, subIndex) => <div className="prose-subsection" key={sub.title}><h3>{sub.title}</h3><LinkedParagraphs texts={sub.paragraphs} links={links} anchorPrefix={section.id + '-sub-' + subIndex} />{sub.figure && <ReadingFigure kind={sub.figure} />}</div>)}{section.formulas && <div className="formula-group">{section.formulas.map(item => <div className="reading-formula" key={item.expression}><MathExpression expression={item.expression} /><p>{item.explanation}</p></div>)}</div>}{section.table && <ContentTable table={section.table} />}{section.figure && <ReadingFigure kind={section.figure} />}{section.activity && <ReadingActivity kind={section.activity} />}{section.experiment && <div className="inline-experiment"><Experiment kinds={[section.experiment]} topicId={lesson.id} /></div>}</section>)}
      {lesson.cases && <section className="case-collection" id="topic-cases"><h2>历史案例</h2>{lesson.cases.map(item => <section className="case-study" key={item.title}><h3>{item.title}</h3><Paragraphs texts={item.paragraphs} /></section>)}</section>}
      {lesson.readings && <section className="reading-collection" id="topic-readings"><h2>经典文献</h2>{lesson.readings.map(item => <section className="classic-reading" key={item.title}><div className="reading-author">{item.author} · {item.year}</div><h3>{item.question}</h3><p>{item.finding}</p><p className="reading-limit">{item.limit}</p><a href={item.href} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={17} /></a></section>)}</section>}
      <LessonTheoryReading lesson={lesson} />
      <section className="quiz-collection" id="topic-quizzes"><h2>练习与解析</h2>{lesson.quizzes.map((quiz, i) => <QuizItem quiz={quiz} number={i + 1} key={quiz.id} />)}</section>
      <nav className="lesson-pagination" aria-label="上一篇和下一篇">{index > 0 ? <a href={lessonHref(lessons[index - 1].id)}><ArrowLeft size={16} /><span><small>上一篇</small>{lessons[index - 1].short}</span></a> : <a href="#learn"><ArrowLeft size={16} /><span>课程目录</span></a>}{index < lessons.length - 1 ? <a href={lessonHref(lessons[index + 1].id)}><span><small>下一篇</small>{lessons[index + 1].short}</span><ArrowRight size={16} /></a> : <a href="#learn"><span>课程目录</span><ArrowRight size={16} /></a>}</nav>
    </article>
  </main>
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [menuOpen, setMenuOpen] = useState(false)
  const previousHash = useRef(window.location.hash)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('finance-atlas-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
  })
  const [mapVisited, setMapVisited] = useState(route.page === 'map')
  useEffect(() => {
    const update = () => { saveReadingPosition(previousHash.current); previousHash.current = window.location.hash; const next = readRoute(); setRoute(next); setMenuOpen(false); if (next.page === 'map') setMapVisited(true) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#11161d' : '#f1f4f6')
    try { localStorage.setItem('finance-atlas-theme', theme) } catch { /* Theme also works without storage. */ }
  }, [theme])
  useEffect(() => { document.title = (route.lesson?.short || (route.page === 'theory' ? theoryIndex.find(entry => entry.id === route.theoryId)?.title || '理论深思' : route.page === 'learn' ? '课程读本' : '全球汇率')) + ' · 国际金融' }, [route])
  useEffect(() => {
    const selector = route.page === 'map' ? 'main#atlas:not([hidden])' : route.page === 'theory' ? (route.theoryId ? '.theory-reader' : '.theory-directory') : route.lesson ? '.reader-page' : '.course-overview'
    const section = route.section ? (['cases', 'readings', 'theories'].includes(route.section) ? 'topic-' + route.section : route.section) : undefined
    return restoreReadingPosition(window.location.hash, selector, section)
  }, [route])
  useEffect(() => {
    const previous = history.scrollRestoration; history.scrollRestoration = 'manual'
    return () => { history.scrollRestoration = previous }
  }, [])
  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); const main = document.querySelector('main:not([hidden])') as HTMLElement | null; main?.focus(); main?.scrollIntoView() }}>跳到主要内容</a>
    <header className="site-header"><div className="header-inner shell">
      <a className="brand" href="#map" aria-label="光华管理学院，回到全球汇率"><svg className="brand-filter" aria-hidden="true" width="0" height="0"><defs><filter id="guanghua-white" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 -1 0 0 1" /><feComposite in2="SourceAlpha" operator="in" /></filter></defs></svg><img className="guanghua-logo" src={import.meta.env.BASE_URL + 'assets/guanghua-original.png'} alt="北京大学光华管理学院" width="442" height="96" /></a>
      <nav className={'main-nav' + (menuOpen ? ' open' : '')} aria-label="主导航"><a href="#map" aria-current={route.page === 'map' ? 'page' : undefined}>全球汇率</a><a href="#learn" aria-current={route.page === 'learn' ? 'page' : undefined}>课程读本</a><a href="#theory" aria-current={route.page === 'theory' ? 'page' : undefined}>理论深思</a></nav>
      <div className="header-actions"><button className="icon-button theme-toggle" aria-label={theme === 'dark' ? '切换为日间阅读' : '切换为夜间阅读'} title={theme === 'dark' ? '日间阅读' : '夜间阅读'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><button className="icon-button mobile-menu" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div></header>
    {mapVisited && <Suspense fallback={<main hidden={route.page !== 'map'} className="shell atlas-fallback"><h1>全球汇率</h1><div className="skeleton map-skeleton" role="status" aria-label="正在加载世界地图" /></main>}><WorldAtlas visible={route.page === 'map'} theme={theme} /></Suspense>}
    {route.page === 'learn' && (route.lesson ? <LessonReader lesson={route.lesson} key={route.lesson.id} /> : <CourseOverview />)}
    {route.page === 'theory' && <Suspense fallback={<main className="shell theory-loading" id="main-content" aria-busy="true"><h1>理论深思</h1><p role="status">正在打开文章…</p></main>}><TheoryLibrary id={route.theoryId} /></Suspense>}
    <footer className="site-footer"><div className="shell"><div className="footer-sources"><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">world-countries · ODbL</a><a href="https://maplibre.org/" target="_blank" rel="noreferrer">MapLibre</a></div></div></footer>
  </>
}

export default App
