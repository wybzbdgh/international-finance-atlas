// HTML is the source of truth. This script only writes search/navigation data;
// it never rewrites the articles you edit in public/pages/.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { parseHTML } from "linkedom";

const root = new URL("../", import.meta.url);
const read = (path) =>
  parseHTML(readFileSync(new URL(path, root), "utf8")).document;
const all = (node, selector) => [...node.querySelectorAll(selector)];
const text = (node) => {
  if (!node) return "";
  const copy = node.cloneNode(true);
  all(copy, ".sr-only, [aria-hidden], svg").forEach((el) => el.remove());
  return copy.textContent.replace(/\s+/g, " ").trim();
};
const get = (node, selector) => text(node.querySelector(selector));
const metadata = (document) =>
  JSON.parse(document.querySelector("[data-page-meta]").textContent);
const props = (node) => JSON.parse(node.getAttribute("data-props"));
const write = (name, data) =>
  writeFileSync(
    new URL("src/" + name + ".json", root),
    JSON.stringify(data, null, 2) + "\n",
  );
const formulas = (node) =>
  all(node, ".reading-formula").map((el) => ({
    expression:
      get(el, 'annotation[encoding="application/x-tex"]') ||
      get(el, ".formula-expression"),
    explanation: get(el, ":scope > p"),
  }));

function block(node, subsection = false) {
  const result = {
    ...(subsection ? {} : { id: node.id }),
    title: get(node, subsection ? ":scope > h3" : ":scope > h2"),
    paragraphs: all(node, ":scope > p[data-reading-anchor]").map(text),
  };
  const subs = all(node, ":scope > .prose-subsection");
  if (subs.length) result.subsections = subs.map((el) => block(el, true));
  for (const [view, key] of [
    ["ReadingFigure", "figure"],
    ["ReadingActivity", "activity"],
  ]) {
    const placeholder = node.querySelector(
      ':scope > [data-view="' + view + '"]',
    );
    if (placeholder) result[key] = props(placeholder).kind;
  }
  return result;
}

const directory = read("public/pages/course/index.html");
const modules = all(directory, ".module-section").map((el) => ({
  id: el.id.replace("module-", ""),
  title: get(el, ".module-heading h3"),
  description: get(el, ".module-heading p"),
}));
const ids = all(directory, ".topic-link").map(
  (el) => el.getAttribute("href").split("/")[1],
);
const lessons = ids.map((id) => {
  const document = read("public/pages/course/" + id + ".html");
  const lesson = {
    ...metadata(document),
    title: get(document, ".lesson-intro h1"),
    subtitle: get(document, ".lesson-subtitle"),
    objectives: all(document, ".learning-objectives li").map(text),
    sections: all(document, ".lesson-body > .prose-section").map((el) =>
      block(el),
    ),
    quizzes: all(document, '[data-view="Quiz"]').map((el) => props(el).quiz),
  };
  const cases = all(document, ".case-study").map((el) => ({
    title: get(el, "h3"),
    paragraphs: all(el, ":scope > p").map(text),
  }));
  const readings = all(document, ".classic-reading").map((el) => ({
    title: get(el, "a"),
    question: get(el, "h3"),
    paragraphs: all(el, ":scope > p").map(text),
    url: el.querySelector("a")?.getAttribute("href"),
  }));
  if (cases.length) lesson.cases = cases;
  if (readings.length) lesson.readings = readings;
  if (lesson.id !== id || !modules.some((m) => m.id === lesson.moduleId))
    throw new Error("Invalid course metadata: " + id);
  return lesson;
});

const theories = readdirSync(new URL("public/pages/theory/", root))
  .filter((file) => file.endsWith(".html") && file !== "index.html")
  .map((file) => {
    const document = read("public/pages/theory/" + file);
    const entry = {
      ...metadata(document),
      yearLabel: get(document, ".theory-bibliography-line time"),
      title: get(document, ".theory-article-heading h1"),
      authors: get(document, ".theory-authors"),
      originalTitle: get(document, ".theory-original-title"),
      question: get(document, ".theory-question"),
      sections: all(document, ".theory-article > .prose-section").map((el) => ({
        title: get(el, "h2"),
        paragraphs: all(el, ":scope > p").map(text),
      })),
      sources: all(document, ".theory-sources li").map((el) => {
        const a = el.querySelector("a");
        const source = {
          title: text(a),
          url: a.getAttribute("href"),
          note: get(el, "p"),
        };
        const excerpt = all(document, ".theory-excerpt").find(
          (e) => e.querySelector("a").getAttribute("href") === source.url,
        );
        if (excerpt) {
          source.quote = get(excerpt, "blockquote p");
          const translation = excerpt
            .querySelector(".theory-translation")
            ?.cloneNode(true);
          translation?.querySelector("span")?.remove();
          if (translation) source.translation = text(translation);
          if (excerpt.querySelector(".theory-excerpt-label"))
            source.excerptLabel = get(excerpt, ".theory-excerpt-label");
        }
        return source;
      }),
    };
    const derivation = formulas(document);
    if (derivation.length) entry.formulas = derivation;
    if (entry.id + ".html" !== file)
      throw new Error("Invalid theory metadata: " + file);
    return entry;
  })
  .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));

const theoryIds = new Set(theories.map((entry) => entry.id));
for (const entry of theories) {
  for (const id of entry.related)
    if (!theoryIds.has(id))
      throw new Error(entry.id + ": unknown related theory " + id);
  for (const id of entry.lessonIds)
    if (!ids.includes(id)) throw new Error(entry.id + ": unknown course " + id);
}
write("course-data", { modules, lessons });
write("theory-data", theories);
write(
  "theory-index",
  theories.map(
    ({
      id,
      year,
      yearLabel,
      title,
      authors,
      originalTitle,
      kind,
      question,
      lessonIds,
      terms,
    }) => ({
      id,
      year,
      yearLabel,
      title,
      authors,
      originalTitle,
      kind,
      question,
      lessonIds,
      terms,
    }),
  ),
);
console.log(
  `HTML content: ${lessons.length} courses, ${theories.length} theories, ${lessons.reduce((n, lesson) => n + lesson.quizzes.length, 0)} quizzes.`,
);
