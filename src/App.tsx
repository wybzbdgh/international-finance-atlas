import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { courseModules, courseStats, lessons, lessonById, lessonHref, type ComparisonTable, type Lesson, type Quiz } from './content'
import Experiment from './components/Experiments'

const WorldAtlas = lazy(() => import('./components/WorldAtlas'))
type Route = { page: 'map' | 'learn'; lesson?: Lesson; section?: 'cases' | 'readings' }
function readRoute(): Route {
  const hash = window.location.hash.slice(1)
  if (hash === 'lab') return { page: 'learn', lesson: lessonById('enterprise') }
  if (hash === 'cases') return { page: 'learn', lesson: lessonById('currency-crises') }
  if (['index', 'reading', 'chapters'].includes(hash)) return { page: 'learn' }
  if (hash === 'learn' || hash.startsWith('learn/')) {
    const [, id, section] = hash.split('/')
    return { page: 'learn', lesson: lessonById(id || ''), section: section === 'cases' || section === 'readings' ? section : undefined }
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
  const matches = lessons.filter(lesson => !needle || (lesson.title + ' ' + lesson.subtitle + ' ' + lesson.sections.map(section => section.title + ' ' + (section.subsections?.map(sub => sub.title).join(' ') || '')).join(' ') + ' ' + (lesson.cases?.map(item => item.title).join(' ') || '')).toLowerCase().includes(needle))
  return <main className="shell order-page course-overview page-enter" id="main-content" tabIndex={-1}>
    <section className="order-intro">
      <div className="order-copy"><span className="context-label">国际金融课程</span><h1>国际金融学<br />课程读本</h1><p>国际账户、外汇市场、开放经济政策与国际货币体系。按课程的六个模块阅读，结合模型、案例和计算。</p><a href={lessonHref('foundations')} className="primary-button">开始阅读<ArrowRight size={18} /></a></div>
      <figure className="order-image"><img src={import.meta.env.BASE_URL + 'assets/export-port.webp'} width="1440" height="810" alt="货轮停靠集装箱码头的教学情境示意图" /><figcaption>教学情境配图 · AI 生成</figcaption></figure>
    </section>
    <dl className="course-facts"><div><dt>课程结构</dt><dd>{courseModules.length}<span>个模块</span></dd></div><div><dt>专题阅读</dt><dd>{courseStats.topics}<span>篇</span></dd></div><div><dt>历史案例</dt><dd>{courseStats.cases}<span>个</span></dd></div><div><dt>交互与练习</dt><dd>{courseStats.experiments}<span>项交互 · {courseStats.quizzes} 道题</span></dd></div></dl>
    <section className="course-directory" aria-labelledby="course-directory-title">
      <div className="directory-heading"><h2 id="course-directory-title">课程内容</h2><label className="course-search"><Search size={17} /><span className="sr-only">查找专题</span><input type="search" placeholder="查找专题、理论或案例" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="清除专题搜索" onClick={() => setQuery('')}><X size={15} /></button>}</label></div>
      <div className="course-module-list">{courseModules.map(module => {
        const items = matches.filter(lesson => lesson.moduleId === module.id)
        if (!items.length) return null
        return <section className="module-section" key={module.id}><div className="module-heading"><h3>{module.title}</h3><p>{module.description}</p></div><div className="module-lessons">{items.map(lesson => <a className="topic-link" href={lessonHref(lesson.id)} key={lesson.id}><div><h4>{lesson.title}</h4><p>{lesson.subtitle}</p></div><ArrowUpRight size={19} /></a>)}</div></section>
      })}</div>
      {matches.length === 0 && <div className="search-empty" role="status"><p>没有找到相关专题，请换一个课程术语。</p><button className="text-button" onClick={() => setQuery('')}>清除搜索</button></div>}
      {needle && <p className="search-count" role="status">找到 {matches.length} 个专题</p>}
    </section>
    <div className="overview-note"><BookOpen size={22} /><p>正文选自陈泽丰《国际金融学：大国崛起视角》课程讲义（2026），按专题节选和整理。例题、图示与交互参数为教学设定。经典文献附原始论文入口。</p></div>
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
      <div className="article-contents"><span>本篇内容</span>{lesson.sections.map(section => <button key={section.id} onClick={() => scrollTo(section.id)}>{section.title}</button>)}{lesson.cases && <button onClick={() => scrollTo('topic-cases')}>历史案例</button>}{lesson.readings && <button onClick={() => scrollTo('topic-readings')}>经典文献</button>}<button onClick={() => scrollTo('topic-quizzes')}>练习与解析</button></div>
      <details className="module-switcher"><summary>其他模块<ChevronRight size={14} /></summary>{courseModules.filter(item => item.id !== module.id).map(item => <a key={item.id} href={lessonHref(lessons.find(topic => topic.moduleId === item.id)!.id)}>{item.title}<ArrowUpRight size={12} /></a>)}</details>
    </div>
  </aside>
}

function LessonReader({ lesson }: { lesson: Lesson }) {
  const index = lessons.findIndex(item => item.id === lesson.id)
  const module = courseModules.find(item => item.id === lesson.moduleId)!
  const hasExperiment = lesson.experiments.length > 0
  return <main className={'shell reader-page page-enter' + (hasExperiment ? '' : ' without-experiment')} data-chapter={lesson.id} id="main-content" tabIndex={-1}>
    <TopicNavigation lesson={lesson} />
    <section className="lesson-intro"><div className="lesson-position">{module.title}</div><h1>{(titleParts[lesson.id] || [lesson.title]).map(part => <span className="title-phrase" key={part}>{part}</span>)}</h1><p className="lesson-subtitle">{lesson.subtitle}</p><div className="learning-objectives"><h2>学习要求</h2><ul>{lesson.objectives.map(text => <li key={text}>{text}</li>)}</ul></div></section>
    {hasExperiment && <aside className="lesson-experiment"><Experiment kinds={lesson.experiments} topicId={lesson.id} /><p className="experiment-reading-note">正文与计算使用同一标价法；参数为教学设定。</p></aside>}
    <article className="lesson-body">
      {lesson.sections.map(section => <section className="prose-section" id={section.id} key={section.id}><h2>{section.title}</h2><Paragraphs texts={section.paragraphs} />{section.subsections?.map(sub => <div className="prose-subsection" key={sub.title}><h3>{sub.title}</h3><Paragraphs texts={sub.paragraphs} /></div>)}{section.formulas && <div className="formula-group">{section.formulas.map(item => <div className="reading-formula" key={item.expression}><div className="formula-expression">{item.expression}</div><p>{item.explanation}</p></div>)}</div>}{section.table && <ContentTable table={section.table} />}</section>)}
      {lesson.cases && <section className="case-collection" id="topic-cases"><h2>历史案例</h2>{lesson.cases.map(item => <section className="case-study" key={item.title}><h3>{item.title}</h3><Paragraphs texts={item.paragraphs} /></section>)}</section>}
      {lesson.readings && <section className="reading-collection" id="topic-readings"><h2>经典文献</h2>{lesson.readings.map(item => <section className="classic-reading" key={item.title}><div className="reading-author">{item.author} · {item.year}</div><h3>{item.question}</h3><p>{item.finding}</p><p className="reading-limit">{item.limit}</p><a href={item.href} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={17} /></a></section>)}</section>}
      <section className="quiz-collection" id="topic-quizzes"><h2>练习与解析</h2>{lesson.quizzes.map((quiz, i) => <QuizItem quiz={quiz} number={i + 1} key={quiz.id} />)}</section>
      <nav className="lesson-pagination" aria-label="上一篇和下一篇">{index > 0 ? <a href={lessonHref(lessons[index - 1].id)}><ArrowLeft size={16} /><span><small>上一篇</small>{lessons[index - 1].short}</span></a> : <a href="#learn"><ArrowLeft size={16} /><span>课程目录</span></a>}{index < lessons.length - 1 ? <a href={lessonHref(lessons[index + 1].id)}><span><small>下一篇</small>{lessons[index + 1].short}</span><ArrowRight size={16} /></a> : <a href="#learn"><span>课程目录</span><ArrowRight size={16} /></a>}</nav>
    </article>
  </main>
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('finance-atlas-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
  })
  const [mapVisited, setMapVisited] = useState(route.page === 'map')
  useEffect(() => {
    const update = () => { const next = readRoute(); setRoute(next); setMenuOpen(false); if (next.page === 'map') setMapVisited(true); window.scrollTo({ top: 0, behavior: 'instant' }) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#11161d' : '#f1f4f6')
    try { localStorage.setItem('finance-atlas-theme', theme) } catch { /* Theme also works without storage. */ }
  }, [theme])
  useEffect(() => { document.title = (route.lesson?.short || (route.page === 'learn' ? '课程读本' : '全球汇率')) + ' · 汇流' }, [route])
  useEffect(() => {
    if (route.lesson && route.section) document.getElementById('topic-' + route.section)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [route])
  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); const main = document.querySelector('main:not([hidden])') as HTMLElement | null; main?.focus(); main?.scrollIntoView() }}>跳到主要内容</a>
    <header className="site-header"><div className="header-inner shell">
      <a className="brand" href="#map" aria-label="汇流，回到全球汇率"><span className="brand-mark">汇</span><strong>汇流</strong><span className="brand-description">国际金融互动图谱</span></a>
      <nav className={'main-nav' + (menuOpen ? ' open' : '')} aria-label="主导航"><a href="#map" aria-current={route.page === 'map' ? 'page' : undefined}>全球汇率</a><a href="#learn" aria-current={route.page === 'learn' ? 'page' : undefined}>课程读本</a></nav>
      <div className="header-actions"><button className="icon-button theme-toggle" aria-label={theme === 'dark' ? '切换为日间阅读' : '切换为夜间阅读'} title={theme === 'dark' ? '日间阅读' : '夜间阅读'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><button className="icon-button mobile-menu" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div></header>
    {mapVisited && <Suspense fallback={<main hidden={route.page !== 'map'} className="shell atlas-fallback"><h1>全球汇率</h1><div className="skeleton map-skeleton" role="status" aria-label="正在加载世界地图" /></main>}><WorldAtlas visible={route.page === 'map'} theme={theme} /></Suspense>}
    {route.page === 'learn' && (route.lesson ? <LessonReader lesson={route.lesson} key={route.lesson.id} /> : <CourseOverview />)}
    <footer className="site-footer"><div className="shell"><div className="footer-identity"><span>汇流</span><p>国际金融课程小组项目 · 2026 秋</p></div><div className="footer-sources"><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">world-countries · ODbL</a><a href="https://maplibre.org/" target="_blank" rel="noreferrer">MapLibre</a></div></div></footer>
  </>
}

export default App
