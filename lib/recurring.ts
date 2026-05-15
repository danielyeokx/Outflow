import {
  parseISO, format, addDays, addWeeks, addMonths, addYears,
  isAfter, isBefore, isEqual, getDaysInMonth, getDay, setDay,
  startOfDay,
} from "date-fns";
import { RecurringExpense } from "./schema";

export function todayDate(): Date {
  return startOfDay(new Date());
}

function fmt(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function clampDay(year: number, month: number, day: number): Date {
  const maxDay = getDaysInMonth(new Date(year, month - 1));
  return new Date(year, month - 1, Math.min(day, maxDay));
}

// Returns all due dates in [fromDate, toDate] inclusive
export function getDueDates(r: RecurringExpense, fromStr: string, toStr: string): string[] {
  const from = parseISO(fromStr);
  const to = parseISO(toStr);
  if (isAfter(from, to)) return [];

  const results: string[] = [];

  if (r.frequency === "monthly") {
    const dom = r.dayOfMonth ?? 1;
    // Start from month of fromDate
    let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    while (!isAfter(cursor, to)) {
      const due = clampDay(cursor.getFullYear(), cursor.getMonth() + 1, dom);
      if (!isBefore(due, from) && !isAfter(due, to)) results.push(fmt(due));
      cursor = addMonths(cursor, 1);
    }

  } else if (r.frequency === "weekly") {
    const dow = r.dayOfWeek ?? 1; // 0=Sun
    // Find first occurrence of that weekday >= from
    let cursor = new Date(from);
    while (getDay(cursor) !== dow) cursor = addDays(cursor, 1);
    while (!isAfter(cursor, to)) {
      results.push(fmt(cursor));
      cursor = addWeeks(cursor, 1);
    }

  } else if (r.frequency === "yearly") {
    const dom = r.dayOfMonth ?? 1;
    const moy = r.monthOfYear ?? 1;
    let year = from.getFullYear();
    while (true) {
      const due = clampDay(year, moy, dom);
      if (isAfter(due, to)) break;
      if (!isBefore(due, from)) results.push(fmt(due));
      year++;
    }

  } else if (r.frequency === "custom") {
    const interval = r.intervalDays ?? 30;
    let cursor = parseISO(r.startDate);
    // advance to first occurrence >= from
    while (isBefore(cursor, from)) cursor = addDays(cursor, interval);
    while (!isAfter(cursor, to)) {
      results.push(fmt(cursor));
      cursor = addDays(cursor, interval);
    }
  }

  return results;
}

export function getNextDueDate(r: RecurringExpense): string | null {
  const tomorrow = fmt(addDays(todayDate(), 1));
  const farFuture = fmt(addYears(todayDate(), 5));
  if (r.endDate && r.endDate < tomorrow) return null;
  const dates = getDueDates(r, tomorrow, farFuture);
  return dates[0] ?? null;
}

export function frequencyLabel(r: RecurringExpense): string {
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  if (r.frequency === "monthly") return `MONTHLY · ${r.dayOfMonth ?? 1}${ordinal(r.dayOfMonth ?? 1)}`;
  if (r.frequency === "weekly")  return `WEEKLY · ${DAYS[r.dayOfWeek ?? 1]}`;
  if (r.frequency === "yearly")  return `YEARLY · ${r.dayOfMonth ?? 1} ${MONTHS[(r.monthOfYear ?? 1) - 1]}`;
  if (r.frequency === "custom")  return `EVERY ${r.intervalDays ?? 30} DAYS`;
  return r.frequency.toUpperCase();
}

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return "TH";
  switch (n % 10) {
    case 1: return "ST";
    case 2: return "ND";
    case 3: return "RD";
    default: return "TH";
  }
}
