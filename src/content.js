import data from "./course-data.json";
const course = data;
export const lessons = course.lessons;
export const courseModules = course.modules;
export const lessonHref = (id, section) =>
  "#learn/" + id + (section ? "/" + section : "");
const aliases = {
  exchange: "fx-market",
  system: "dollar",
};
export const lessonById = (id) =>
  lessons.find((lesson) => lesson.id === (aliases[id] || id));
export const courseStats = {
  topics: lessons.length,
  cases: lessons.reduce((n, lesson) => n + (lesson.cases?.length || 0), 0),
  readings: lessons.reduce(
    (n, lesson) => n + (lesson.readings?.length || 0),
    0,
  ),
  quizzes: lessons.reduce((n, lesson) => n + lesson.quizzes.length, 0),
  experiments: new Set([
    ...lessons.flatMap((lesson) => lesson.experiments),
    ...lessons.flatMap((lesson) =>
      lesson.sections.flatMap((section) =>
        section.activity ? [section.activity] : [],
      ),
    ),
  ]).size,
};
