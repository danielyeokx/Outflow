import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { getCurrencyDecimals } from "./rates";

export function formatCurrency(minor: number, currency = "SGD"): string {
  const decimals = getCurrencyDecimals(currency);
  const amount = minor / Math.pow(10, decimals);
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const float = parseFloat(cleaned);
  if (isNaN(float)) return 0;
  return Math.round(float * 100);
}

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM yyyy");
}

export function formatMonthLabel(isoDate: string): string {
  return format(parseISO(isoDate), "MMMM yyyy");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function monthBounds(isoDate: string): { start: string; end: string } {
  const d = parseISO(isoDate);
  return {
    start: format(startOfMonth(d), "yyyy-MM-dd"),
    end: format(endOfMonth(d), "yyyy-MM-dd"),
  };
}

export function addMonths(isoDate: string, delta: number): string {
  const d = parseISO(isoDate);
  d.setMonth(d.getMonth() + delta);
  return format(d, "yyyy-MM-dd");
}

// Flat 7-column-aligned cell list for a calendar grid: leading nulls pad the
// 1st of the month to its correct weekday column, no trailing pad needed.
// weekStartsOn: 0 = grid's first column is Sunday, 1 = Monday.
export function calendarGridDays(monthISO: string, weekStartsOn: 0 | 1 = 0): (string | null)[] {
  const { start, end } = monthBounds(monthISO);
  const startWeekday = getDay(parseISO(start)); // 0=Sun..6=Sat
  const leadingPad = (startWeekday - weekStartsOn + 7) % 7;
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) })
    .map((d) => format(d, "yyyy-MM-dd"));
  return [...Array(leadingPad).fill(null), ...days];
}
