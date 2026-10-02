import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react'
import { lessons, lessonHref, modules, type Lesson } from './content'
import Experiment from './components/Experiments'

const WorldAtlas = lazy(() => import('./components/WorldAtlas'))
type Route = { page: 'map' | 'learn' | 'index'; lesson?: Lesson }
function readRoute(): Route {
  const hash = window.location.hash.slice(1)
  if (hash === 'index') return { page: 'index' }
  if (hash === 'lab') return { page: 'learn', lesson: lessons[1] }
  if (hash === 'cases') return { page: 'learn', lesson: lessons[3] }
  if (hash === 'reading' || hash === 'chapters') return { page: 'learn' }
  if (hash.startsWith('learn')) return { page: 'learn', lesson: lessons.find(l => l.id === hash.split('/')[1]) }
  return { page: 'map' }
}

function OrderOverview() {
  return <main className="shell order-page page-enter" id="main-content" tabIndex={-1}>
    <section className="order-intro">
      <div className="order-copy"><span className="context-label">国际金融课程</span><h1>国际金融学<br />课程读本</h1><p>以一笔三个月后收款的出口业务为例，介绍国际收支、汇率理论、开放经济政策、金融危机与国际货币体系。</p><a href={lessonHref('accounts')} className="primary-button">阅读第一章<ArrowRight size={18} /></a></div>
      <figure className="order-image"><img src={import.meta.env.BASE_URL + 'assets/export-port.webp'} width="1440" height="810" alt="货轮停靠集装箱码头的情境示意图" /><figcaption>教学情境配图 · AI 生成</figcaption></figure>
    </section>
    <div className="invoice-strip"><div><span>卖方</span><strong>中国出口企业</strong></div><ArrowRight size={22} /><div><span>买方</span><strong>美国客户</strong></div><div><span>合同金额</span><strong className="mono">$100,000</strong></div><div><span>收款期限</span><strong>三个月</strong></div></div>
    <section className="learning-path"><h2>章节目录</h2><p className="section-description">共五章。正文摘录课程讲义，各章附例题与计算。</p>
      <ol>{lessons.map((lesson, i) => <li key={lesson.id}><a href={lessonHref(lesson.id)}><span className="path-number">{i + 1}</span><div><h3>{lesson.title}</h3><p>{lesson.subtitle}</p></div><span className="path-topic">{lesson.short}</span><ArrowUpRight size={22} /></a></li>)}</ol>
    </section>
    <div className="overview-note"><BookOpen size={22} /><p>正文选自陈泽丰《国际金融学：大国崛起视角》课程讲义（2026），摘录下方标明印刷页码。例题金额与计算条件为教学设定。课程大纲的六个模块、14 讲见<a href="#index">课程索引</a>。</p></div>
  </main>
}

function Prediction({ lesson }: { lesson: Lesson }) {
  const [choice, setChoice] = useState<number | null>(null)
  return <div className="prediction"><h2>例题</h2><p>{lesson.question}</p><div className="prediction-options">{lesson.choices.map((text, i) => <button key={text} className={choice === i ? 'chosen' : ''} aria-pressed={choice === i} onClick={() => setChoice(i)}><span className="answer-circle">{choice === i && <Check size={12} />}</span>{text}</button>)}</div>{choice !== null && <div className="prediction-feedback" role="status"><strong>{choice === lesson.answer ? '回答正确' : '正确答案：' + lesson.choices[lesson.answer]}</strong><p>{lesson.explanation}</p></div>}</div>
}

function LessonReader({ lesson }: { lesson: Lesson }) {
  const index = lessons.findIndex(l => l.id === lesson.id)
  return <main className="shell reader-page page-enter" data-chapter={lesson.id} id="main-content" tabIndex={-1}>
    <aside className="lesson-nav"><a className="back-link" href="#learn"><ArrowLeft size={14} />课程目录</a><nav aria-label="章节目录">{lessons.map((item, i) => <a key={item.id} href={lessonHref(item.id)} aria-current={item.id === lesson.id ? 'page' : undefined}><span>{i + 1}</span>{item.short}<ChevronRight size={14} /></a>)}</nav><div className="order-reminder"><span>例题合同</span><strong>$100,000</strong><p>中国企业出口<br />三个月后收美元</p></div><a href="#index" className="inline-link">课程索引<ArrowUpRight size={13} /></a></aside>
    <section className="lesson-intro"><div className="lesson-position">第 {index + 1} 章 · 共 5 章</div><h1>{lesson.title}</h1><p className="lesson-subtitle">{lesson.subtitle}</p><div className="lesson-scene"><h2>案例条件</h2><p>{lesson.scene}</p></div><Prediction lesson={lesson} /></section>
    <aside className="lesson-experiment"><Experiment lesson={lesson.id} /></aside>
    <article className="lesson-body">{lesson.sections.map(section => <section className="prose-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(text => <p key={text}>{text}</p>)}<p className="excerpt-source">{section.source}</p>{section.details?.map(detail => <details className="theory-detail" key={detail.title}><summary>{detail.title}<ChevronRight size={16} /></summary><p>{detail.text}</p><p className="excerpt-source">{detail.source}</p></details>)}</section>)}
      {lesson.reading && <section className="classic-reading"><div className="reading-author">{lesson.reading.author} · {lesson.reading.year}</div><h2>经典文献</h2><p className="reading-question">{lesson.reading.question}</p><p>{lesson.reading.finding}</p><p className="reading-limit">{lesson.reading.limit}</p><p className="excerpt-source">{lesson.reading.source}</p><a href={lesson.reading.href} target="_blank" rel="noreferrer">{lesson.reading.title}<ArrowUpRight size={17} /></a></section>}
      {lesson.id === 'crisis' && <div className="source-links"><a href="https://www.imf.org/external/pubs/ft/fandd/1998/06/imfstaff.htm" target="_blank" rel="noreferrer">IMF：亚洲危机背景<ArrowUpRight size={13} /></a><a href="https://www.federalreserve.gov/monetarypolicy/bst_liquidityswaps.htm" target="_blank" rel="noreferrer">美联储：美元流动性互换<ArrowUpRight size={13} /></a></div>}
      {lesson.id === 'policy' && <div className="source-links"><a href="https://www.gov.cn/xinwen/2015-08/11/content_2911053.htm" target="_blank" rel="noreferrer">人民币中间价机制调整说明<ArrowUpRight size={13} /></a></div>}
      <div className="lesson-takeaway"><span>本章要点</span><p>{lesson.takeaway}</p></div>
      <div className="lesson-reference"><strong>课程依据</strong><p>{lesson.reference}</p><p>陈泽丰《国际金融学：大国崛起视角》（讲义版／教材初稿，2026）。正文按主题节选原文，省略文内参考文献标注，统一换行与公式排版；公式整理、案例条件和例题解析另行编写。</p></div>
      <nav className="lesson-pagination" aria-label="上一章和下一章">{index > 0 ? <a href={lessonHref(lessons[index - 1].id)}><ArrowLeft size={16} /><span><small>上一章</small>{lessons[index - 1].short}</span></a> : <a href="#learn"><ArrowLeft size={16} /><span>课程目录</span></a>}{index < 4 ? <a href={lessonHref(lessons[index + 1].id)}><span><small>下一章</small>{lessons[index + 1].short}</span><ArrowRight size={16} /></a> : <a href="#index"><span>课程索引</span><ArrowRight size={16} /></a>}</nav>
    </article>
  </main>
}

function CourseIndex() {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matches = modules.map(module => ({ ...module, lectures: module.lectures.filter(lecture => (lecture.title + ' ' + lecture.topics + ' ' + lecture.chapters).toLowerCase().includes(needle)) })).filter(module => module.lectures.length)
  return <main className="shell index-page page-enter" id="main-content" tabIndex={-1}>
    <div className="index-intro"><span className="context-label">对照 2026 秋季课程大纲</span><h1>课程索引</h1><p>按课程大纲列出六个模块、14 讲及对应的讲义章节。点击讲次可进入相关内容，也可按术语检索。</p></div>
    <label className="index-search"><span>查找课程内容</span><input type="search" placeholder="例如：国际收支、CIP、美元融资、数字货币" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <div className="course-modules">{matches.length ? matches.map(module => <section className="course-module" key={module.title}><h2>{module.title}</h2><div>{module.lectures.map(lecture => <a href={lessonHref(lecture.lesson)} className="lecture-row" key={lecture.no}><span className="lecture-number">第 {lecture.no} 讲</span><div><h3>{lecture.title}</h3><p>{lecture.topics}</p><small>{lecture.chapters}</small></div><span className="lecture-destination">{lessons.find(l => l.id === lecture.lesson)?.short}<ArrowUpRight size={18} /></span></a>)}</div></section>) : <div className="index-empty" role="status"><h2>没有找到对应条目</h2><p>请使用课程术语或英文缩写搜索。</p><button className="text-button" onClick={() => setQuery('')}>清除搜索</button></div>}</div>
    <section className="index-source"><h2>资料与口径</h2><p>课程依据：陈泽丰《国际金融学：大国崛起视角》讲义（2026）与《国际金融课程大纲：2026 秋》。第 15 讲机动补充不作为独立核心讲次；发展金融内容随债务与治理讨论。</p><p>地图提供每日参考汇率。五章中的金额、利率和压力情景为教学设定，并未使用实时银行报价。阅读入口连接原始论文或官方材料。</p><a href="https://data.imf.org/" className="inline-link" target="_blank" rel="noreferrer">IMF 数据库<ArrowUpRight size={16} /></a></section>
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
    try { localStorage.setItem('finance-atlas-theme', theme) } catch { /* Theme selection still works without storage. */ }
  }, [theme])
  useEffect(() => { document.title = (route.lesson?.short || (route.page === 'index' ? '课程索引' : route.page === 'learn' ? '课程读本' : '全球汇率')) + ' · 汇流' }, [route])
  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); const main = document.querySelector('main:not([hidden])') as HTMLElement | null; main?.focus(); main?.scrollIntoView() }}>跳到主要内容</a>
    <header className="site-header"><div className="header-inner shell">
      <a className="brand" href="#map" aria-label="汇流，回到全球汇率"><span className="brand-mark">汇</span><strong>汇流</strong><span className="brand-description">国际金融互动图谱</span></a>
      <nav className={'main-nav' + (menuOpen ? ' open' : '')} aria-label="主导航"><a href="#map" aria-current={route.page === 'map' ? 'page' : undefined}>全球汇率</a><a href="#learn" aria-current={route.page === 'learn' ? 'page' : undefined}>课程读本</a><a href="#index" aria-current={route.page === 'index' ? 'page' : undefined}>课程索引</a></nav>
      <div className="header-actions"><button className="icon-button theme-toggle" aria-label={theme === 'dark' ? '切换为日间阅读' : '切换为夜间阅读'} title={theme === 'dark' ? '日间阅读' : '夜间阅读'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><button className="icon-button mobile-menu" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div></header>
    {mapVisited && <Suspense fallback={<main hidden={route.page !== 'map'} className="shell atlas-fallback"><h1>全球汇率</h1><div className="skeleton map-skeleton" role="status" aria-label="正在加载世界地图" /></main>}><WorldAtlas visible={route.page === 'map'} theme={theme} /></Suspense>}
    {route.page === 'learn' && (route.lesson ? <LessonReader lesson={route.lesson} key={route.lesson.id} /> : <OrderOverview />)}
    {route.page === 'index' && <CourseIndex />}
    <footer className="site-footer"><div className="shell"><div className="footer-identity"><span>汇流</span><p>国际金融课程小组项目 · 2026 秋</p></div><div className="footer-sources"><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">world-countries · ODbL</a><a href="https://maplibre.org/" target="_blank" rel="noreferrer">MapLibre</a></div></div></footer>
  </>
}

export default App
