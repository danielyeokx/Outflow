# Outflow — Change History

Format: newest first. Tags: [FEATURE] [UI] [BUG] [REMOVED] [INFRA] [FIX]

---

## 2026-05-16

[INFRA] Created CLAUDE.md, history.md, task.md, task-archive.md project docs
[INFRA] Created /pp, /pc, /pppc, /eod custom slash commands
[FIX] `SectionList` date headers no longer sticky — added `stickySectionHeadersEnabled={false}`
[UI] Center `+` tab button — inset square in nav bar, opens unified add modal from any tab
[UI] Consistent sticky headers across all tabs via `PageHeader` component
[UI] Overview + Expenses: month switcher sticky below header with 2nd separator
[UI] `Sheet` component — 80% height bottom sheet, tap top 20% to dismiss, sticky confirm button
[UI] `transparentModal` presentation for all modal routes (add, category/new, recurring/new)
[KNOWN ISSUE] Sheet slides off screen when keyboard opens on physical device (iOS 18/26 + transparentModal incompatibility)

## 2026-05-15

### On-device install
[INFRA] Built Release IPA via Xcode → installed on iPhone 16 Pro via USB
[INFRA] Release build bundles JS — no Metro server needed on device
[INFRA] Certificate valid 7 days (free Apple ID), renew via Xcode ▶ Run

### Recurring expenses
[FEATURE] `recurring_expenses` table (migration 0002)
[FEATURE] Frequencies: monthly (day of month), weekly (day of week), yearly (month+day), custom (every N days)
[FEATURE] Auto-log engine in `lib/db.ts` — runs on app open, backdates missed entries to original due date
[FEATURE] RECURRING tab (4th tab) — list with frequency label + next due date + delete
[FEATURE] Add modal TYPE toggle: SINGLE | RECURRING — unified entry point via center + button
[FEATURE] Recurring expiry: FOREVER or UNTIL (month/year picker with stepper)
[REMOVED] Standalone `/recurring/new` screen — merged into unified `/add` modal

### Category management
[FEATURE] Settings categories tappable → category detail screen
[FEATURE] Category detail: built-in keywords (read-only) + user keywords (add/delete)
[FEATURE] New category modal: name + icon picker (25 icons), grayscale color auto-assigned
[FEATURE] `useAddKeyword`, `useDeleteKeyword`, `useAddCategory` mutations
[FEATURE] `useKeywordsForCategory` query

### Smart keyword learning
[FEATURE] `learned_keywords` table (migration 0001)
[FEATURE] 400ms debounce on item name → keyword auto-suggest
[FEATURE] Auto-reset category when item name cleared (if auto-picked)
[FEATURE] Manual category selection locks out auto-pick (autoPickedRef)
[FEATURE] On submit: if no static match → save to learned_keywords for future auto-pick
[FIX] Learned keyword insert wrapped in try-catch — failure no longer blocks expense save

### Sci-fi redesign
[UI] Full grayscale redesign: #0A0A0A bg, #111 surface, #2A2A2A 1px strokes, 4px radius
[UI] `lib/theme.ts` — design tokens + `toGray()` luminance converter
[UI] SVG dot grid (`DotGrid`) texture overlay on all screens
[UI] Total amount displayed as `> SGD 11.50` readout format
[UI] Month header: `[ MAY 2026 ]` bracket notation
[UI] HUD-style labels: `SYS.OVERVIEW`, `// EXPENSES`, `// DAILY.SPEND`
[UI] SpaceMono-Regular for all numbers and codes
[UI] All category colors converted to grayscale via `toGray()` — no colour rendered

### Core app (initial build)
[FEATURE] Expo SDK 54 + Expo Router + TypeScript
[FEATURE] NativeWind v4 + Tailwind v3 (v4 incompatible with NativeWind 4.x)
[FEATURE] expo-sqlite + Drizzle ORM — local SQLite, no backend
[FEATURE] Migration system: SQL inlined in `drizzle/migrations.js` (Metro can't bundle .sql)
[FEATURE] 8 default categories seeded on first launch
[FEATURE] Overview tab: pie chart + bar chart + category breakdown + monthly total
[FEATURE] Expenses tab: section list grouped by date
[FEATURE] Settings tab: category list
[FEATURE] Add expense form: amount (calculator-style right-to-left input), item, category picker, date
[FEATURE] Static keyword map in `lib/categorize.ts` (SGD-locale keywords)
[INFRA] Git init + GitHub remote: github.com/danielyeokx/Outflow (private)
[INFRA] iOS native folder generated via `expo prebuild`
[FIX] expo-sqlite v55 → downgraded to ~16.0.10 (SDK 54 compatible version)
[FIX] NativeWind: switched to `SafeAreaView` from react-native-safe-area-context with `edges={['top']}`
[FIX] Bar chart x-axis labels clipping — paddingBottom inside card
[FIX] Zod categoryId `.uuid()` rejects seed IDs (version 0) — changed to `.min(1)`
[REMOVED] Supabase — hit free tier 2-project limit, replaced with local SQLite
[REMOVED] Auth screens — single-user personal app, no login needed
