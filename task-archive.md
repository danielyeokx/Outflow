# Outflow — Completed Tasks

---

## 2026-05-15 / 2026-05-16

- [x] Scaffold Expo app with TypeScript + Expo Router
- [x] Set up NativeWind v4 + Tailwind v3
- [x] Set up expo-sqlite + Drizzle ORM with migration system
- [x] Build core data layer: categories, expenses, learned_keywords, recurring_expenses
- [x] Seed 8 default categories on first launch
- [x] Build Overview tab with pie chart + bar chart + category breakdown
- [x] Build Expenses tab with section list grouped by date
- [x] Build Settings tab with category management
- [x] Add expense form with calculator-style amount input
- [x] Static keyword auto-suggest with 400ms debounce
- [x] Keyword learning system — persist unknown items to learned_keywords table
- [x] Category picker bottom sheet
- [x] Grayscale sci-fi redesign with dot grid texture
- [x] Recurring expenses: frequencies, auto-log engine, expiry picker
- [x] Unified add modal (SINGLE / RECURRING toggle)
- [x] Category detail screen with keyword management (add/delete/view built-in)
- [x] New category modal (name + icon picker)
- [x] Center + tab button (inset square, opens add modal)
- [x] Consistent sticky headers across all tabs via PageHeader
- [x] Sheet component (80% height, dismissal overlay, sticky action button)
- [x] Git + GitHub setup (github.com/danielyeokx/Outflow, private)
- [x] iOS native build via expo prebuild + Xcode
- [x] Release build installed on iPhone 16 Pro via USB
- [x] Fix: SectionList date headers sticking — added stickySectionHeadersEnabled={false}
- [x] Fix: expense save failing when learned_keywords insert threw — wrapped in try-catch
- [x] Fix: category picker showing error after selection — changed zod .uuid() to .min(1)
- [x] Fix: bar chart labels clipped — added paddingBottom inside card container
- [x] Fix: black block above tab bar — SafeAreaView edges={['top']} on all tab screens
- [x] Created CLAUDE.md, history.md, task.md, task-archive.md
- [x] Created /pp, /pc, /pppc, /eod slash commands
