import "@fontsource-variable/inter/wght.css";
import "katex/dist/katex.min.css";
import "./figure-updates.css";
import "./styles.css";
import "./reading-updates.css";
import "./theory.css";
import { render, nothing, mountAt } from "./ui/view.js";
import { Sun, Moon, Menu, X, ArrowLeft } from "./ui/icons.js";
import { lessons, courseModules, lessonById, lessonHref } from "./content.js";
import {
  theoryIndex,
  theoryOrigin,
  rememberTheoryOrigin,
} from "./theory-navigation.js";
import { activityTitles } from "./activities-data.js";
import {
  restoreReadingPosition,
  saveReadingPosition,
} from "./lib/reading-position.js";
import {
  QuizItem,
  SearchResults,
  ModuleList,
  searchBodyText,
  matchesQuery,
} from "./course-directory.js";

const base = import.meta.env.BASE_URL;
const readingSlot = document.querySelector("#reading-slot");
const mapMarker = document.querySelector("#map-marker");
const themeButton = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".mobile-menu");
const navigation = document.querySelector(".main-nav");
let theme = document.documentElement.dataset.theme;
let menuOpen = false;
let mapView;
let mapPart;
let mapImport;
let routeVersion = 0;
let previousHash = window.location.hash;
let hasNavigated = false;
let mountedRoute;
let restore;
let dispose = [];
const pageCache = new Map();

themeButton.replaceChildren();
menuButton.replaceChildren();
function updateTheme() {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#11161d" : "#f1f4f6";
  themeButton.setAttribute(
    "aria-label",
    theme === "dark" ? "切换为日间阅读" : "切换为夜间阅读",
  );
  themeButton.title = theme === "dark" ? "日间阅读" : "夜间阅读";
  render(
    theme === "dark" ? Sun({ size: 19 }) : Moon({ size: 19 }),
    themeButton,
  );
  try {
    localStorage.setItem("finance-atlas-theme", theme);
  } catch {}
  updateMap(readRoute().page === "map");
}
function updateMenu() {
  navigation.classList.toggle("open", menuOpen);
  menuButton.setAttribute("aria-label", menuOpen ? "关闭导航" : "打开导航");
  menuButton.setAttribute("aria-expanded", String(menuOpen));
  render(menuOpen ? X({ size: 21 }) : Menu({ size: 21 }), menuButton);
}
themeButton.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  updateTheme();
});
menuButton.addEventListener("click", () => {
  menuOpen = !menuOpen;
  updateMenu();
});
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  const main = document.querySelector("main:not([hidden])");
  main?.focus();
  main?.scrollIntoView();
});

function readRoute() {
  const hash = window.location.hash.slice(1);
  if (hash === "theory" || hash.startsWith("theory/"))
    return { page: "theory", id: hash.split("/")[1] };
  if (hash === "lab") return { page: "learn", id: "enterprise" };
  if (hash === "cases") return { page: "learn", id: "currency-crises" };
  if (["index", "reading", "chapters"].includes(hash)) return { page: "learn" };
  if (hash === "learn" || hash.startsWith("learn/")) {
    const [, id, section] = hash.split("/");
    return { page: "learn", id: lessonById(id)?.id, section };
  }
  if (hash === "map") return { page: "map" };
  return { page: "home" };
}
function updateMap(visible) {
  if (mapView)
    mapPart = render(mapView({ visible, theme }), mapMarker.parentNode, {
      renderBefore: mapMarker,
    });
}
async function showMap() {
  if (!mapImport)
    mapImport = import("./components/WorldAtlas.js")
      .then((module) => {
        mapView = module.default;
      })
      .catch((error) => {
        mapImport = undefined;
        throw error;
      });
  await mapImport;
  updateMap(readRoute().page === "map");
}
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({
    block: "start",
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}
async function loadPage(path) {
  if (!pageCache.has(path))
    pageCache.set(
      path,
      fetch(base + "pages/" + path + ".html")
        .then((response) => {
          if (!response.ok) throw new Error("文章暂时无法加载。");
          return response.text();
        })
        .catch((error) => {
          pageCache.delete(path);
          throw error;
        }),
    );
  return pageCache.get(path);
}

function bindHome(root) {
  // Home page links use standard hash navigation; no extra binding required.
}

function bindSidebarToggle(root) {
  const sidebar = root.querySelector(
    ".lesson-nav, .course-nav, .theory-era-nav, .theory-reading-nav",
  );
  if (!sidebar) return;

  let pageRoot;
  if (root.classList.contains("reader-page") ||
      root.classList.contains("course-overview")) {
    pageRoot = root;
  } else if (root.classList.contains("theory-directory")) {
    pageRoot = root.querySelector(".theory-directory-layout");
  } else if (root.classList.contains("theory-reader")) {
    pageRoot = root;
  }
  if (!pageRoot) return;

  const storageKey = "finance-atlas-sidebar-collapsed";
  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.setAttribute("aria-label", "收起侧边栏");
  toggle.setAttribute("aria-expanded", "true");
  render(Menu({ size: 18 }), toggle);

  toggle.addEventListener("click", () => {
    const collapsed = pageRoot.classList.toggle("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed ? "展开侧边栏" : "收起侧边栏",
    );
    try {
      sessionStorage.setItem(storageKey, String(collapsed));
    } catch {}
  });

  sidebar.prepend(toggle);

  try {
    if (sessionStorage.getItem(storageKey) === "true") {
      pageRoot.classList.add("sidebar-collapsed");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "展开侧边栏");
    }
  } catch {}
}

function bindCourseDirectory(root) {
  const input = root.querySelector(".course-search input");
  const search = input.closest("label");
  const original = root.querySelector(".course-module-list");
  const marker = document.createComment("course-search-results");
  original.after(marker);
  let clear;
  const update = () => {
    const query = input.value,
      needle = query.trim().toLowerCase();
    original.remove();
    if (query && !clear) {
      clear = document.createElement("button");
      clear.setAttribute("aria-label", "清除专题搜索");
      render(X({ size: 15 }), clear);
      clear.addEventListener("click", () => {
        input.value = "";
        update();
        input.focus();
      });
      search.append(clear);
    } else if (!query && clear) {
      clear.remove();
      clear = null;
    }
    const onClear = () => {
      input.value = "";
      update();
      input.focus();
    };
    const results = needle ? searchBodyText(needle) : [];
    const directory = lessons.filter(
      (lesson) =>
        !needle ||
        matchesQuery(
          [
            lesson.title,
            lesson.subtitle,
            ...lesson.sections.map((s) => s.title),
            ...lesson.sections.flatMap(
              (s) => s.subsections?.map((sub) => sub.title) || [],
            ),
            ...(lesson.cases?.map((item) => item.title) || []),
            ...(lesson.readings?.map(
              (item) => item.title + " " + item.question,
            ) || []),
            ...lesson.sections
              .map((s) => (s.activity ? activityTitles[s.activity] : ""))
              .filter(Boolean),
          ].join(" "),
          needle,
        ),
    );
    if (results.length)
      render(SearchResults({ query, results, onClear }), marker.parentNode, {
        renderBefore: marker,
      });
    else {
      const template = document.createElement(
        needle && directory.length ? "p" : "div",
      );
      if (needle && !directory.length) {
        template.className = "search-empty";
        template.setAttribute("role", "status");
        template.innerHTML =
          '<p>没有找到相关专题或段落，请换一个课程术语。</p><button class="text-button">清除搜索</button>';
        template.querySelector("button").onclick = onClear;
      } else if (needle) {
        template.className = "search-count";
        template.setAttribute("role", "status");
        template.textContent = "找到 " + directory.length + " 个专题";
      }
      render(
        [
          needle ? template : nothing,
          directory.length
            ? ModuleList({ modules: courseModules, lessons: directory })
            : nothing,
        ],
        marker.parentNode,
        { renderBefore: marker },
      );
    }
  };
  input.addEventListener("input", update);
  root.querySelectorAll('.course-nav a[href^="#module-"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollTo(link.hash.slice(1));
    }),
  );
  dispose.push(() => {
    const part = render(nothing, marker.parentNode, { renderBefore: marker });
    part.setConnected(false);
  });
}

function bindLesson(root, lesson) {
  const links = [...root.querySelectorAll(".article-contents button")];
  const targets = lesson.sections.map((section) => section.id);
  const firstFigure = lesson.sections.find(
    (section) =>
      section.figure || section.subsections?.some((sub) => sub.figure),
  );
  if (firstFigure)
    targets.push(
      "figure-" +
        (firstFigure.subsections?.find((sub) => sub.figure)?.figure ||
          firstFigure.figure),
    );
  const activity = lesson.sections.find(
    (section) => section.activity,
  )?.activity;
  if (activity) targets.push("activity-" + activity);
  if (lesson.cases) targets.push("topic-cases");
  if (lesson.readings) targets.push("topic-readings");
  if (theoryIndex.some((entry) => entry.lessonIds.includes(lesson.id)))
    targets.push("topic-theories");
  targets.push("topic-quizzes");
  links.forEach((button, i) =>
    button.addEventListener("click", () => scrollTo(targets[i])),
  );
  root
    .querySelector(".mobile-topic-select select")
    ?.addEventListener("change", (event) => {
      window.location.hash = lessonHref(event.target.value);
    });
  root
    .querySelectorAll('a[href^="#theory/"]')
    .forEach((link) =>
      link.addEventListener("click", () =>
        rememberTheoryOrigin(link.hash.split("/")[1]),
      ),
    );
}

function bindTheoryDirectory(root) {
  const input = root.querySelector('input[type="search"]'),
    select = root.querySelector("select");
  try {
    input.value = sessionStorage.getItem("theory-search") || "";
    select.value = sessionStorage.getItem("theory-filter") || "all";
  } catch {}
  const metadata = new Map(theoryIndex.map((entry) => [entry.id, entry]));
  const groups = [...root.querySelectorAll(".theory-era")];
  let observer;
  const update = () => {
    const needle = input.value.trim().toLowerCase(),
      kind = select.value;
    try {
      sessionStorage.setItem("theory-search", input.value);
      sessionStorage.setItem("theory-filter", kind);
    } catch {}
    groups.forEach((group) => {
      group.querySelectorAll("li").forEach((row) => {
        const item = metadata.get(row.querySelector("a").hash.split("/")[1]);
        row.hidden = !(
          (kind === "all" || item.kind === kind) &&
          (!needle ||
            [
              item.title,
              item.authors,
              item.originalTitle,
              item.question,
              item.yearLabel,
              ...item.terms,
            ]
              .join(" ")
              .toLowerCase()
              .includes(needle))
        );
      });
      group.hidden = !group.querySelector("li:not([hidden])");
      const index = groups.indexOf(group);
      root.querySelectorAll(".theory-era-nav button")[index].hidden =
        group.hidden;
    });
    root.querySelector(".search-empty")?.remove();
    if (groups.every((group) => group.hidden)) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.setAttribute("role", "status");
      empty.innerHTML =
        '<p>没有找到对应条目，可以换一个作者姓名或理论名称。</p><button class="text-button">清除筛选</button>';
      empty.querySelector("button").onclick = () => {
        input.value = "";
        select.value = "all";
        update();
      };
      root.querySelector(".theory-chronology").append(empty);
    }
    root.querySelector(".course-search button")?.remove();
    if (input.value) {
      const button = document.createElement("button");
      button.setAttribute("aria-label", "清除理论搜索");
      render(X({ size: 15 }), button);
      button.onclick = () => {
        input.value = "";
        update();
        input.focus();
      };
      input.parentNode.append(button);
    }
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        const active = entries.find((entry) => entry.isIntersecting);
        if (active)
          root
            .querySelectorAll(".theory-era-nav button")
            .forEach((button, i) => {
              if (groups[i] === active.target)
                button.setAttribute("aria-current", "true");
              else button.removeAttribute("aria-current");
            });
      },
      { rootMargin: "-100px 0px -55% 0px", threshold: 0 },
    );
    groups
      .filter((group) => !group.hidden)
      .forEach((group) => observer.observe(group));
  };
  input.addEventListener("input", update);
  select.addEventListener("change", update);
  root
    .querySelectorAll(".theory-era-nav button")
    .forEach((button, i) => (button.onclick = () => scrollTo(groups[i].id)));
  update();
  dispose.push(() => observer?.disconnect());
}

function bindTheoryArticle(root, id) {
  const sections = [...root.querySelectorAll(".theory-article > section[id]")];
  root
    .querySelectorAll(".theory-reading-nav nav button")
    .forEach((button, i) => (button.onclick = () => scrollTo(sections[i]?.id)));
  const origin = theoryOrigin(id);
  if (origin) {
    const link = document.createElement("a");
    link.className = "theory-return";
    link.href = origin;
    render([ArrowLeft({ size: 14 }), "回到刚才的正文"], link);
    root.querySelector(".theory-reading-nav").append(link);
  }
  const buttons = [...root.querySelectorAll(".original-language button")];
  buttons.forEach(
    (button, index) =>
      (button.onclick = () => {
        buttons.forEach((item, n) =>
          item.setAttribute("aria-pressed", String(n === index)),
        );
        root.querySelectorAll(".theory-excerpt").forEach((excerpt) => {
          excerpt.querySelector("blockquote").hidden = index === 2;
          const translation = excerpt.querySelector(".theory-translation");
          if (translation)
            translation.hidden =
              index === 1 ||
              (index === 0 &&
                translation.hasAttribute("data-fallback-translation"));
          else if (index === 2) {
            const p = document.createElement("p");
            p.className = "theory-translation";
            p.setAttribute("data-fallback-translation", "");
            p.textContent = excerpt.querySelector("blockquote").textContent;
            excerpt.querySelector("blockquote").after(p);
          }
        });
      }),
  );
}

async function bindFigures(root, version) {
  const markers = [...root.querySelectorAll("[data-view]")];
  const modules = {
    ReadingFigure: () => import("./components/ReadingFigure.js"),
    ReadingActivity: () => import("./components/ReadingActivity.js"),
    Experiments: () => import("./components/Experiments.js"),
    Quiz: async () => ({ default: QuizItem }),
  };
  await Promise.all(
    markers.map(async (placeholder) => {
      const factory = (await modules[placeholder.dataset.view]()).default;
      if (version !== routeVersion) return;
      const props = JSON.parse(placeholder.dataset.props);
      const marker = document.createComment(placeholder.dataset.view);
      placeholder.replaceWith(marker);
      dispose.push(mountAt(marker, factory(props)));
    }),
  );
}

async function navigate() {
  const version = ++routeVersion,
    route = readRoute();
  restore?.();
  if (hasNavigated) saveReadingPosition(previousHash);
  hasNavigated = true;
  previousHash = window.location.hash;
  menuOpen = false;
  updateMenu();
  navigation.querySelectorAll("a").forEach((link) => {
    if (link.hash === "#" + route.page)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.body.classList.toggle("home-route", route.page === "home");
  const routeKey = route.page + "/" + (route.id || "");
  const selector =
    route.page === "map"
      ? "main#atlas:not([hidden])"
      : route.page === "theory"
        ? route.id
          ? ".theory-reader"
          : ".theory-directory"
        : route.page === "home"
          ? ".home-landing"
          : route.id
            ? ".reader-page"
            : ".course-overview";
  const section = ["cases", "readings", "theories"].includes(route.section)
    ? "topic-" + route.section
    : route.section;
  if (mountedRoute === routeKey) {
    restore = restoreReadingPosition(window.location.hash, selector, section);
    return;
  }
  mountedRoute = undefined;
  dispose.splice(0).forEach((cleanup) => cleanup());
  readingSlot.replaceChildren();
  updateMap(route.page === "map");
  const lesson = route.page === "learn" ? lessonById(route.id) : undefined;
  const theory =
    route.page === "theory"
      ? theoryIndex.find((entry) => entry.id === route.id)
      : undefined;
  document.title =
    (lesson?.short ||
      (route.page === "theory"
        ? theory?.title || "理论深思"
        : route.page === "learn"
          ? "课程读本"
          : route.page === "home"
            ? "国际金融课程"
            : "全球汇率")) + " · 国际金融";
  try {
    if (route.page === "map") {
      if (!mapView)
        readingSlot.innerHTML =
          '<main class="shell atlas-fallback"><h1>全球汇率</h1><div class="skeleton map-skeleton" role="status" aria-label="正在加载世界地图"></div></main>';
      await showMap();
      if (version === routeVersion) readingSlot.replaceChildren();
    } else if (route.page === "theory" && route.id && !theory)
      readingSlot.innerHTML =
        '<main class="shell theory-reader" id="main-content" tabindex="-1"><h1>没有找到这篇文章</h1><a class="back-link" href="#theory">返回理论深思目录</a></main>';
    else {
      if (route.page === "theory")
        readingSlot.innerHTML =
          '<main class="shell theory-loading" id="main-content" aria-busy="true"><h1>理论深思</h1><p role="status">正在打开文章…</p></main>';
      const text = await loadPage(
        route.page === "home"
          ? "home/index"
          : (route.page === "learn" ? "course/" : "theory/") +
              (route.id || "index"),
      );
      if (version !== routeVersion) return;
      readingSlot.innerHTML = text.replaceAll("__BASE__", base);
      const root = readingSlot.querySelector("main");
      if (route.page === "home") {
        bindHome(root);
      } else if (route.page === "learn") {
        if (lesson) bindLesson(root, lesson);
        else bindCourseDirectory(root);
      } else if (theory) bindTheoryArticle(root, theory.id);
      else bindTheoryDirectory(root);
      await bindFigures(root, version);
    }
    if (version !== routeVersion) return;
    bindSidebarToggle(root);
    mountedRoute = routeKey;
    restore = restoreReadingPosition(window.location.hash, selector, section);
  } catch (error) {
    if (version !== routeVersion) return;
    console.error(error);
    readingSlot.innerHTML =
      '<main class="shell" id="main-content" tabindex="-1"><p>页面暂时无法加载。</p><button class="secondary-button">重新加载</button></main>';
    readingSlot.querySelector("button").onclick = navigate;
  }
}
history.scrollRestoration = "manual";
window.addEventListener("hashchange", navigate);
updateTheme();
updateMenu();
navigate();
