# Outflow — Change History

Format: newest first. Tags: [FEATURE] [UI] [BUG] [REMOVED] [INFRA] [FIX]

---

## 2026-05-16 (session 6)

[FEATURE] Settings — Clear All Keywords: deletes `learned_keywords` table + sets `staticKeywordsEnabled: false` in settings.json; stops auto-suggest and hides static keywords in category detail; keyword learning on new expense entry continues unaffected
[FEATURE] Settings — Reset Categories to Defaults: removes unused custom categories (no expense/recurring refs), re-seeds 8 defaults (restores names/icons/colors), clears keywords, re-enables static keywords
[FEATURE] Settings — data section split into two cards: Export to CSV alone in first card; Clear All Keywords + Reset Categories + Clear All Data grouped in second card below with 12px gap
[FIX] Static keywords now respect `staticKeywordsEnabled` flag in category detail screen — `getStaticKeywordsForCategory` result gated behind `useStaticKeywordsEnabled` query
[INFRA] `KEYWORD_MAP` exported from `categorize.ts`; `useLearnedKeywords` merges static map when `staticKeywordsEnabled: true` (DB overrides static); `suggestCategoryId` only checks `learnedMap` (no separate static map lookup)
[INFRA] `useStaticKeywordsEnabled` query added to `queries.ts`; `staticKeywordsEnabled: boolean` added to `AppSettings` in `settings.ts` (default: true)
[UI] All three destructive actions (Clear All Keywords, Reset Categories, Clear All Data) consistently require double-confirm Alert

## 2026-05-16 (session 5)

[FEATURE] Expense edit — tap expense row body in list to open pre-populated edit sheet (`app/expense/[id].tsx`); transparentModal Sheet; fields: amount, item name, category, date, currency; trash icon in header triggers delete-with-confirm; `[ SAVE ]` sticky button
[FEATURE] `useExpense(id)` query in `lib/queries.ts` — fetches single expense by ID
[FEATURE] `useUpdateExpense` mutation in `lib/mutations.ts` — UPDATE with full cache invalidation + refetchQueries for monthly-summary
[FIX] Overview total not refreshing after any expense mutation — `useAddExpense` + `useDeleteExpense` never invalidated `["monthly-summary"]`; switched to `refetchQueries` for forced refetch; added `useFocusEffect` on Overview tab to refetch `monthly-summary` + `daily-totals` on tab focus
[UI] `ExpenseListItem` — row body is now a tappable Pressable (→ edit); trash icon remains separate; press state dims text + lightens icon bg
[UI] Overview empty state — `[ NO DATA ]` header + `NO EXPENSES LOGGED FOR THIS MONTH.` subtitle + `+ LOG EXPENSE` button that opens add modal
[FEATURE] Zero-decimal currency support (JPY, KRW) — `decimals` field on each CURRENCIES entry; `getCurrencyDecimals(code)` helper in rates.ts; `formatCurrency` divides by `10^decimals`; `convertCurrency` applies `10^(toDecimals−fromDecimals)` scale factor for cross-decimal conversions; amount input skips decimal for 0-decimal currencies; digit slice raised to 9 digits (max ₩999,999,999)
[INFRA] Bar chart bottom padding — confirmed already fixed (paddingBottom: 56 workaround); marked done
[INFRA] Recurring tab + button context — decided to keep + defaulting to SINGLE (99% of use); marked done

## 2026-05-16 (session 4)

[FEATURE] Recurring expense edit — tap row navigates to `app/recurring/[id].tsx` (transparentModal Sheet); form pre-populated from stored data; UPDATE + delete (Alert confirm); currency chip on amount field
[FEATURE] Settings: Export CSV — `expo-file-system/legacy` + `expo-sharing`; all expenses with date/item/category/amount/currency/note columns
[FEATURE] Settings: Clear All Data — deletes expenses + recurring + learned_keywords; double-Alert confirmation; keeps categories
[FEATURE] Settings: Default Currency preference — persisted to `settings.json` via `lib/settings.ts` (expo-file-system); 12 currencies supported
[FEATURE] Multi-currency on add/edit forms — currency chip (square aspect-ratio button) next to amount input; dropdown picker; initialises from default currency setting
[FEATURE] Per-expense currency stored and displayed — `formatCurrency(amountCents, currency)` everywhere; conversion subtitle on expense list items when currency ≠ default (`~SGD xx.xx`)
[FEATURE] `lib/rates.ts` — hardcoded approximate exchange rates (SGD base); `convertCurrency(amount, from, to)` + shared `CURRENCIES` list
[FEATURE] Chart queries converted to JS-side aggregation with currency conversion — `useMonthlySummary` + `useDailyTotals` now fetch per-row and convert to default currency before summing
[FEATURE] Overview wired to `useMonthlySummary` + `useDailyTotals` + `useDefaultCurrency` — total, pie chart, bar chart, category breakdown all reflect default currency
[FIX] Changing default currency invalidates `monthly-summary` + `daily-totals` query cache so charts update immediately
[FIX] Recurring edit: item name clear → category auto-reset (autoPickedRef initialised true on load)
[FIX] Day-of-month input: local string state (`dayText`) prevents Math.max(1,n) clamp blocking re-entry — applied to both add.tsx and recurring/[id].tsx
[FIX] Export CSV: `expo-file-system/legacy` import required for SDK 54; `isAvailableAsync()` check before shareAsync; encoding `'utf8'` string literal (EncodingType enum undefined)
[FIX] Recurring list rows: `Pressable` children render-prop pattern + `ChevronRight` affordance for tap-to-edit discoverability
[UI] `useUpdateRecurring` mutation now writes currency field
[UI] `CategoryPieChart` + `CategoryBreakdown` accept `currency` prop — all amount displays use correct currency symbol

## 2026-05-16 (session 3)

[FEATURE] `useRenameCategory` mutation — updates `categories.name`, invalidates `["categories"]`
[FEATURE] `useDeleteCategory` mutation — counts referencing expenses + recurring_expenses; throws `CATEGORY_IN_USE` if either > 0; cascade-deletes `learned_keywords` then the category
[UI] Category detail screen: `// RENAME.CATEGORY` section — TextInput pre-filled with current name via `useEffect` on `category?.name`, white placeholder color, Save (floppy disk) icon button
[UI] Category detail screen: unified `// KEYWORDS` list — static + user keywords merged, all rows have Trash2 delete icon; static keyword removals are session-local (hidden via state), user keyword removals persist to DB
[UI] Category detail screen: `DELETE CATEGORY` full-width button — `T.elevated` (#181818) background, `T.text.secondary` (#888888) border, children render-prop pattern for press state
[UI] Category detail screen: delete confirmation is a custom floating modal (not native Alert) — `rgba(0,0,0,0.85)` overlay, centered dialog panel with `T.surface` bg + border, CANCEL / DELETE side-by-side buttons
[UI] Action buttons (Save icon, + icon): `width: 44`, height stretches to match TextInput (`height: 44` on inputs, flex row stretch on buttons)
[UI] Settings `+NEW` button touch target enlarged: paddingVertical 5→11, paddingHorizontal 10→16
[FIX] Renamed `handleDelete` → `handleDeleteKeyword` to avoid naming conflict with category delete handler

## 2026-05-16 (session 2)

[FEATURE] Custom inline date picker — year stepper + month grid + day grid (7/row), replaces native DateTimePicker; displays as "16 MAY 2026"
[UI] Category + date fields side by side in single expense form to reduce sheet overflow
[UI] Auto-scroll to date picker card when opened via KeyboardAwareScrollView.scrollToPosition
[UI] Sheet swipe-to-dismiss — PanResponder drag handle, overlay fades with translateY interpolation, absoluteFillObject overlay prevents edge ghosting
[UI] Expires-until picker: year now above month in both add.tsx and recurring/new.tsx
[UI] Expiry month grid: two equal rows of 6 filling full card width (flex:1 per button)
[UI] Tab bar height uses useSafeAreaInsets — labels clear rounded corners and home bar on iPhone 16 Pro
[UI] All form field sizes unified: amount + item name at fontSize 26, all secondary inputs/buttons at fontSize 14 + paddingVertical 13
[UI] Base input style gains SpaceMono-Regular; all placeholders uppercased for consistency
[UI] Day-of-month default changed from pre-filled "1" to blank (matches amount entry)
[UI] Calendar icon added to date trigger field
[UI] Year before month ordering in expires-until card
[FIX] Sheet keyboard bug — removed KeyboardAvoidingView, added react-native-keyboard-aware-scroll-view with extraScrollHeight=24
[FIX] Overlay ghost on sheet dismiss — overlay now absoluteFillObject, fades independently of sheet
[REMOVED] @react-native-community/datetimepicker — replaced by custom picker

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
