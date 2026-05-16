# Outflow — Completed Tasks

---

## 2026-05-16 (session 6)

- [x] **Settings: Clear All Keywords** — clears DB + disables static map via flag; category detail hides static keywords; auto-suggest off
- [x] **Settings: Reset Categories to Defaults** — re-seeds 8 defaults, removes unused custom categories, clears keywords, re-enables static map
- [x] **Settings: data section layout** — export separated from destructive actions into its own card

## 2026-05-16 (session 5)

- [x] **Expense edit** — tap expense row body to open pre-populated edit sheet; full CRUD on amount, item name, category, date, currency
- [x] **Overview polish** — empty state: [ NO DATA ] header + subtitle + [ + LOG EXPENSE ] button
- [x] **Bar chart bottom padding** — confirmed already resolved (paddingBottom: 56); no code change needed
- [x] **Recurring tab + button context** — decided by design: + always defaults to SINGLE; no code change needed
- [x] **Export to CSV or PDF** — done via expo-sharing; CSV with date/item/category/amount/currency/note columns
- [x] **Multi-currency support with conversion** — done; hardcoded rates in lib/rates.ts; JPY/KRW zero-decimal support added session 5

## 2026-05-16 (session 4)

- [x] **Recurring expense edit** — tap row opens edit sheet (transparentModal); pre-populated form; UPDATE + delete; item name→category auto-suggest; day-of-month local string state fix; currency chip
- [x] **Settings: Export CSV** — expo-file-system/legacy + expo-sharing; columns: date/item/category/amount/currency/note
- [x] **Settings: Clear All Data** — deletes expenses + recurring + learned_keywords; double-Alert; keeps categories
- [x] **Settings: Default Currency** — 12 currencies; persisted to settings.json; all app totals/displays update on change
- [x] **Multi-currency input** — currency chip (square) on amount field in add + edit forms; dropdown picker; stored per-expense
- [x] **Multi-currency display** — expense list shows own currency + conversion subtitle (~SGD) when differs from default; charts convert all amounts to default currency via hardcoded rates (lib/rates.ts)

## 2026-05-16 (session 3)

- [x] **Settings "+new" touch target** — paddingVertical 5→11, paddingHorizontal 10→16
- [x] **Category edit + delete** — rename (useRenameCategory) + delete (useDeleteCategory with FK check); full UI in category/[id].tsx

## 2026-05-16

- [x] **Nav bar text clipping** — useSafeAreaInsets drives tab bar height; labels clear rounded corners + home bar on iPhone 16 Pro
- [x] **Bottom sheet swipe-to-dismiss** — PanResponder drag handle; overlay fades via translateY interpolation; absoluteFillObject prevents edge ghosting on fast swipe
- [x] **Date picker** — custom inline year/month/day grid picker; displays "16 MAY 2026"; auto-scrolls into view on open; future dates disabled
- [x] **Text consistency: item name field** — added SpaceMono-Regular to base input style in theme.ts; uppercased all sentence-case placeholders across add.tsx, category/[id].tsx, recurring/new.tsx
- [x] **Sheet + keyboard bug** — replaced KeyboardAvoidingView with react-native-keyboard-aware-scroll-view; extraScrollHeight={24} gives gap between focused input and keyboard
- [x] **Day-of-month number entry** — changed default from pre-filled "1" to blank; onChangeText now resets to undefined on clear; matches amount entry behaviour

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
