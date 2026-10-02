type ReadingPosition = { y: number; anchor?: string; offset?: number }
const key = (hash: string) => 'finance-reading-position:' + hash

export function saveReadingPosition(hash: string) {
  const main = document.querySelector('main:not([hidden])')
  const anchors = [...(main?.querySelectorAll<HTMLElement>('[data-reading-anchor], .reading-figure[id], .prose-section[id]') || [])]
  const target = anchors.filter(el => el.getBoundingClientRect().bottom > 100).sort((a, b) => Math.abs(a.getBoundingClientRect().top - 120) - Math.abs(b.getBoundingClientRect().top - 120))[0]
  const position: ReadingPosition = { y: window.scrollY, ...(target ? { anchor: target.id, offset: target.getBoundingClientRect().top } : {}) }
  try { sessionStorage.setItem(key(hash), JSON.stringify(position)) } catch { /* Storage is optional. */ }
}

export function restoreReadingPosition(hash: string, mainSelector: string, section?: string) {
  let saved: ReadingPosition | undefined
  try { const raw = sessionStorage.getItem(key(hash)); if (raw) saved = JSON.parse(raw) } catch { /* Start at the requested section. */ }
  let cancelled = false, frame = 0, timeout = 0
  let resize: ResizeObserver | undefined
  let main: HTMLElement | null = null
  const restore = () => {
    if (cancelled || !main) return
    const anchor = saved?.anchor ? document.getElementById(saved.anchor) : null
    if (anchor && saved?.offset !== undefined) window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - saved.offset, behavior: 'instant' })
    else if (saved) window.scrollTo({ top: saved.y, behavior: 'instant' })
    else if (section) document.getElementById(section)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(restore) }
  const stop = () => { cancelled = true; cancelAnimationFrame(frame); clearTimeout(timeout); resize?.disconnect(); mutation.disconnect(); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('pointerdown', stop); window.removeEventListener('keydown', stop) }
  const ready = () => {
    main = document.querySelector<HTMLElement>(mainSelector)
    if (!main) return
    mutation.disconnect()
    main.focus({ preventScroll: true })
    resize = new ResizeObserver(schedule); resize.observe(main)
    schedule()
    void document.fonts.ready.then(() => { if (!cancelled) schedule() })
    timeout = window.setTimeout(stop, 1800)
  }
  // A lazy article may not yet exist when the route state changes.
  const mutation = new MutationObserver(ready)
  mutation.observe(document.getElementById('root')!, { childList: true, subtree: true })
  ready()
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(event, stop, { passive: true })
  return stop
}
