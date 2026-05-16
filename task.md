# Outflow — Task List

Move completed items to `task-archive.md`. Keep this file short and actionable.

---

## Bugs

- [x] **Category picker height mismatch** — added `minHeight: 44` to Pressable so selected and placeholder states share the same height.
- [x] **Daily spend bar chart — horizontal lines extend to edge** — removed `Math.max(..., 300)` minimum so chart width matches actual data, preventing x-axis from bleeding past the last bar.
- [x] **Spending breakdown card — center-aligned text** — moved `alignItems: 'center'` to an inner wrapper; title now has left-aligned `paddingHorizontal: 14`.

---

## Backlog

- [ ] **App icon + splash screen** — currently default Expo assets.
- [ ] **Certificate renewal reminder** — 7-day free Apple ID cert. Consider upgrading to paid ($99/yr) for 1-year cert.
- [x] **Daily spend chart — show all 14 days** — `useDailyTotals` now generates a 14-day window ending at min(today, monthEnd), filling zeros for days with no spending.
- [ ] **Monthly spending heatmap** — calendar-style overview card; colour intensity (white = highest, dark grey = lowest) proportional to daily spend; "✕" marker for zero-spend days.

---

## Ideas

- [ ] **Monthly view — daily spend accordion** — below daily spend section, accordion spanning the entire month; colour each day white (highest) → dark grey (lower) proportional to amount; show "✕" for days with no spending
- [ ] Budget limits per category with visual indicator when approaching/over
- [ ] Monthly spending trend (compare this month vs last month)
- [ ] Biometric lock (Face ID)
- [ ] iOS home screen widget showing monthly total
- [ ] LLM-based auto-categorisation fallback for items not in keyword map
- [ ] iCloud backup for SQLite DB
- [ ] Recurring expense pause (without deleting)
- [ ] Spending streak / habit tracking
