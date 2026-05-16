# Outflow — Task List

Move completed items to `task-archive.md`. Keep this file short and actionable.

---

## Critical

- [x] **Sheet + keyboard bug** — sheet slides off screen when keyboard opens on physical device. `KeyboardAvoidingView` with `behavior="padding"` doesn't work with `transparentModal` on iOS 18/26. Fix: try `behavior="position"` or replace Sheet with `@gorhom/bottom-sheet`.
- [ ] **Bottom sheet swipe-to-dismiss** — sheets without internal scrollable content should respond to swipe-down gesture and close; currently only the overlay tap dismisses them. Quick fix: PanResponder on a drag handle. Proper fix: replace Sheet with `@gorhom/bottom-sheet` (handles swipe-to-dismiss natively, dynamic height snap points, removes content overflow issues — requires refactoring all screens using Sheet)
- [ ] **Nav bar text clipping** — tab bar labels clipped at screen edges on iPhone's rounded corners; increase nav bar height so text sits higher and clears the home bar + rounded edges

---

## Backlog

- [x] **Text consistency: item name field** — placeholder text and input text in item name should use SpaceMono (mono); rest of expense entry is already mono but item name renders in serif
- [ ] **Settings "+new" touch target** — increase touch target size of the "+new" button for adding categories in the settings page
- [ ] **Category edit + delete** — settings currently only supports add + keyword management. Add rename and delete (with FK constraint check — can't delete if expenses exist).
- [ ] **Recurring expense edit** — currently delete + recreate only. Add edit flow.
- [ ] **Expense edit** — tap an expense in the list to edit amount, category, date.
- [ ] **Date picker** — replace YYYY-MM-DD text input with a proper date picker component.
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
- [ ] Export to CSV or PDF
- [ ] Multi-currency support with conversion
- [ ] Biometric lock (Face ID)
- [ ] iOS home screen widget showing monthly total
- [ ] LLM-based auto-categorisation fallback for items not in keyword map
- [ ] iCloud backup for SQLite DB
- [ ] Recurring expense pause (without deleting)
- [ ] Spending streak / habit tracking
