import { monthsBefore } from "./atlas-models.js";

export const rangeLabels = {
  30: "1 个月",
  90: "3 个月",
  365: "1 年",
  1826: "5 年",
};

export function presetPeriod(today, range) {
  const months = { 30: 1, 90: 3, 365: 12, 1826: 60 }[range] ?? 3;
  return { from: monthsBefore(today, months), to: today };
}

export function dateOffset(start, date) {
  return Math.round((Date.parse(date) - Date.parse(start)) / 86400000);
}

function isCalendarDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function dateRangeError(from, to, today) {
  if (!isCalendarDate(from) || !isCalendarDate(to))
    return "请填写完整的起止日期。";
  const earliest = monthsBefore(today, 120);
  if (from < earliest || to < earliest || from > today || to > today)
    return `请选择 ${earliest} 至 ${today} 之间的日期。`;
  if (from >= to) return "结束日期须晚于开始日期。";
  return "";
}
