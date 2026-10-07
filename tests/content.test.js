import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { figureTitles } from "../src/figures-data.js";
const entries = JSON.parse(
  readFileSync(new URL("../src/theory-data.json", import.meta.url), "utf8"),
);
const course = JSON.parse(
  readFileSync(new URL("../src/course-data.json", import.meta.url), "utf8"),
);
const lessonIds = new Set(course.lessons.map((lesson) => lesson.id));
test("All 46 theory articles have substantive content, primary sources and valid cross-references", () => {
  const ids = new Set(entries.map((entry) => entry.id));
  assert.equal(entries.length, 46);
  assert.equal(ids.size, entries.length);
  for (const entry of entries) {
    assert.ok(
      entry.sections.length >= 5,
      entry.id + ": missing explanation sections",
    );
    assert.ok(
      entry.sections.flatMap((section) => section.paragraphs).join("").length >=
        700,
      entry.id + ": article too brief",
    );
    assert.ok(
      entry.sources.length >= 1,
      entry.id + ": missing original source",
    );
    for (const source of entry.sources)
      assert.match(source.url, /^https:\/\//, entry.id);
    for (const id of entry.related) {
      assert.ok(ids.has(id), `${entry.id}: unknown related theory ${id}`);
      assert.notEqual(id, entry.id);
    }
    for (const id of entry.lessonIds)
      assert.ok(lessonIds.has(id), `${entry.id}: unknown course ${id}`);
    if (entry.figure)
      assert.ok(
        entry.figure in figureTitles,
        `${entry.id}: unknown figure ${entry.figure}`,
      );
  }
});
test("Modern original excerpts remain short and are separate from the Chinese explanation", () => {
  const quoteWords = new Map();
  for (const entry of entries.filter((entry) => entry.year >= 1931))
    for (const source of entry.sources) {
      if (!source.quote) continue;
      assert.ok(
        source.translation,
        entry.id + ": original excerpt needs a labeled translation",
      );
      const quotes = quoteWords.get(source.url) || new Set();
      quotes.add(source.quote);
      quoteWords.set(source.url, quotes);
    }
  for (const [url, quotes] of quoteWords)
    assert.ok(
      [...quotes].join(" ").trim().split(/\s+/).length <= 25,
      "Excerpt exceeds 25 words: " + url,
    );
});
test("Every inline course figure resolves, and each of the ten added models is embedded", () => {
  const used = new Set();
  for (const lesson of course.lessons)
    for (const section of lesson.sections)
      for (const block of [section, ...(section.subsections || [])]) {
        if (!block.figure) continue;
        assert.ok(
          block.figure in figureTitles,
          lesson.id + ": unknown figure " + block.figure,
        );
        used.add(block.figure);
      }
  for (const id of [
    "iip-valuation",
    "balassa-samuelson",
    "cip-cashflow",
    "j-curve",
    "currency-mismatch",
    "repo-liquidity",
    "policy-capital-mobility",
    "money-adjustment",
    "specie-flow",
    "intertemporal-choice",
  ])
    assert.ok(used.has(id), id + ": not connected to reading");
});
