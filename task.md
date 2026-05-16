# Outflow — Task List

Move completed items to `task-archive.md`. Keep this file short and actionable.

---

## Backlog

- [ ] **Expense edit** — tap an expense in the list to edit amount, category, date.
- [ ] **Overview polish** — empty state for months with no data is plain text. Add icon + better layout.
- [ ] **Bar chart bottom padding** — labels still slightly clipped on some screen sizes. Fine-tune `paddingBottom`.
- [ ] **Recurring tab + button context** — center + on Recurring tab could default TYPE to RECURRING in the add modal.
- [ ] **App icon + splash screen** — currently default Expo assets.
- [ ] **Certificate renewal reminder** — 7-day free Apple ID cert. Consider upgrading to paid ($99/yr) for 1-year cert.

---

## Ideas

- [ ] **Monthly view — daily spend accordion** — below daily spend section, accordion spanning the entire month; colour each day white (highest) → dark grey (lower) proportional to amount; show "✕" for days with no spending
- [ ] Budget limits per category with visual indicator when approaching/over
- [ ] Monthly spending trend (compare this month vs last month)
- [ ] ~~Export to CSV or PDF~~ — done (CSV via expo-sharing)
- [ ] ~~Multi-currency support with conversion~~ — done (hardcoded rates in lib/rates.ts); live rate fetching or user-editable rates still possible

- [ ] Biometric lock (Face ID)
- [ ] iOS home screen widget showing monthly total
- [ ] LLM-based auto-categorisation fallback for items not in keyword map
- [ ] iCloud backup for SQLite DB
- [ ] Recurring expense pause (without deleting)
- [ ] Spending streak / habit tracking
