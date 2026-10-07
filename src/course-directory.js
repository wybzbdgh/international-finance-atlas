import {
  html as markup,
  svg as svgMarkup,
  content as renderContent,
  view,
  viewState,
  afterRender,
  compute,
  keepRef,
  uniqueId,
  elementRef,
  styles,
  ifDefined,
  live,
  keyed,
  unsafeHTML,
  selectValue,
} from "./ui/view.js";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Search,
  X,
} from "./ui/icons.js";
import { courseModules, lessons, lessonHref } from "./content.js";
import { activityTitles } from "./activities-data.js";
function paragraphSources(section) {
  const sources = [];
  section.paragraphs.forEach((text, i) =>
    sources.push({
      text,
      id: `${section.id}-p-${i}`,
    }),
  );
  section.subsections?.forEach((sub, subIndex) => {
    sub.paragraphs.forEach((text, i) =>
      sources.push({
        text,
        id: `${section.id}-sub-${subIndex}-p-${i}`,
        subsection: sub,
      }),
    );
  });
  return sources;
}
function orderedMatchPositions(text, query) {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const chars = [...normalizedQuery];
  const positions = [];
  let index = 0;
  for (const char of chars) {
    const next = normalizedText.indexOf(char, index);
    if (next === -1) return null;
    positions.push(next);
    index = next + 1;
  }
  return positions;
}
function matchesQuery(text, query) {
  return orderedMatchPositions(text, query) !== null;
}
const Highlight = view(function Highlight({ text, query }) {
  const positions = orderedMatchPositions(text, query);
  if (!positions) return markup`${renderContent(text)}`;
  const posSet = new Set(positions);
  const parts = [];
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    if (posSet.has(i)) {
      if (i > last)
        parts.push(markup`<span>${renderContent(text.slice(last, i))}</span>`);
      parts.push(markup`<mark>${renderContent(text[i])}</mark>`);
      last = i + 1;
    }
  }
  if (last < text.length)
    parts.push(markup`<span>${renderContent(text.slice(last))}</span>`);
  return markup`${renderContent(parts)}`;
});
function searchBodyText(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const result = [];
  for (const lesson of lessons) {
    const matches = [];
    for (const section of lesson.sections) {
      for (const source of paragraphSources(section)) {
        if (matchesQuery(source.text, needle)) {
          matches.push({
            text: source.text,
            id: source.id,
            section,
            subsection: source.subsection,
          });
        }
      }
    }
    if (matches.length)
      result.push({
        lesson,
        matches,
      });
  }
  return result;
}
function groupMatchesBySection(matches) {
  const groups = new Map();
  for (const match of matches) {
    const key = match.section.id + "::" + (match.subsection?.title || "");
    if (!groups.has(key))
      groups.set(key, {
        section: match.section,
        subsection: match.subsection,
        items: [],
      });
    groups.get(key).items.push(match);
  }
  return [...groups.values()];
}
const ModuleList = view(function ModuleList({ modules, lessons: lessonList }) {
  return markup`<div class="course-module-list">${renderContent(
    modules.map((module) => {
      const items = lessonList.filter(
        (lesson) => lesson.moduleId === module.id,
      );
      if (!items.length) return null;
      return markup`<section class="module-section" id=${ifDefined(`module-${module.id}`)}><div class="module-heading"><h3>${renderContent(module.title)}</h3><p>${renderContent(module.description)}</p></div><div class="module-lessons">${renderContent(
        items.map(
          (lesson) =>
            markup`<a class="topic-link" href=${ifDefined(lessonHref(lesson.id))}><div><h4>${renderContent(lesson.title)}</h4><p>${renderContent(lesson.subtitle)}</p></div>${ArrowUpRight(
              {
                size: 19,
              },
            )}</a>`,
        ),
      )}</div></section>`;
    }),
  )}</div>`;
});
const SearchResults = view(function SearchResults({ query, results, onClear }) {
  const total = results.reduce((n, item) => n + item.matches.length, 0);
  return markup`<div class="course-search-results" role="region" aria-label="正文搜索结果"><div class="course-search-results-toolbar"><p class="search-count" role="status">找到 ${renderContent(total)} 处匹配</p><button class="text-button back-to-directory" @click=${onClear}>${ArrowLeft(
    {
      size: 14,
    },
  )}返回课程目录</button></div>${renderContent(
    results.map(
      ({ lesson, matches }) =>
        markup`<section class="search-result-lesson"><div class="search-result-lesson-heading"><h3>${renderContent(lesson.title)}</h3><p>${renderContent(lesson.subtitle)}</p><a class="text-button" href=${ifDefined(lessonHref(lesson.id))}>查看专题${ArrowUpRight(
          {
            size: 14,
          },
        )}</a></div><div class="search-result-sections">${renderContent(
          groupMatchesBySection(matches).map(
            ({ section, subsection, items }) =>
              markup`<div class="search-result-section"><h4>${renderContent(section.title)}${renderContent(subsection ? ` · ${subsection.title}` : "")}</h4><div class="search-result-snippets">${renderContent(
                items.map(
                  (match) =>
                    markup`<a href=${ifDefined(lessonHref(lesson.id, match.id))} class="search-result-snippet"><p>${Highlight(
                      {
                        text: match.text,
                        query: query,
                      },
                    )}</p></a>`,
                ),
              )}</div></div>`,
          ),
        )}</div></section>`,
    ),
  )}</div>`;
});
const titleParts = {
  accounts: ["国际收支与", "对外资产负债表"],
  "long-run": ["长期汇率：", "购买力平价与", "货币分析法"],
  "short-run": ["短期汇率：", "利率平价与", "资产定价"],
  regimes: ["汇率制度选择与", "人民币汇率改革"],
  governance: ["国际金融组织与", "全球金融治理"],
  "capital-markets": ["全球金融市场：", "股票、债券与", "衍生品"],
  enterprise: ["中国企业出海：", "融资与", "汇率风险管理"],
  dollar: ["美元体系：", "特权、责任与", "全球金融周期"],
  "digital-money": ["数字货币与", "国际货币体系变革"],
};
const QuizItem = view(function QuizItem({ quiz, number }) {
  const [choice, setChoice] = viewState(null);
  return markup`<section class="prediction" data-quiz=${ifDefined(quiz.id)}><h3>练习 ${renderContent(number)}</h3><p>${renderContent(quiz.question)}</p><div class="prediction-options">${renderContent(
    quiz.choices.map(
      (text, i) =>
        markup`<button class=${ifDefined(choice === i ? "chosen" : "")} aria-pressed=${ifDefined(choice === i)} @click=${() => setChoice(i)}><span class="answer-circle">${renderContent(
          choice === i &&
            Check({
              size: 12,
            }),
        )}</span>${renderContent(text)}</button>`,
    ),
  )}</div>${renderContent(choice !== null && markup`<div class="prediction-feedback" role="status"><strong>${renderContent(choice === quiz.answer ? "回答正确" : "正确答案：" + quiz.choices[quiz.answer])}</strong><p>${renderContent(quiz.explanation)}</p></div>`)}</section>`;
});
export { QuizItem, SearchResults, ModuleList, searchBodyText, matchesQuery };
