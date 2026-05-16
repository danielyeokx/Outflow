# Outflow — Project Reference

## What this app is
Personal expense tracker for iOS. Single-user, local SQLite storage, grayscale sci-fi aesthetic. No backend, no auth.

## Stack & versions
| Package | Version | Notes |
|---|---|---|
| Expo SDK | ~54.0.33 | Managed workflow |
| Expo Router | ~6.0.23 | File-based routing |
| React Native | 0.81.5 | New Architecture enabled |
| TypeScript | ~5.9.2 | Strict mode |
| NativeWind | 4.2.3 | Tailwind v3 only (v4 breaks it) |
| Tailwind CSS | ^3.4.19 | Must stay on v3 |
| expo-sqlite | ~16.0.10 | Local DB |
| Drizzle ORM | ^0.45.2 | SQLite adapter |
| TanStack Query | ^5.100.10 | Server state / cache |
| react-hook-form | ^7.75.0 | Forms |
| zod | ^4.4.3 | Validation |
| react-native-gifted-charts | ^1.4.76 | Pie + bar charts (SVG, no Skia) |
| lucide-react-native | ^1.16.0 | Icons |
| date-fns | ^4.1.0 | Date utilities |
| expo-file-system | ~18.0.7 | CSV export + settings.json persistence — import from `expo-file-system/legacy` |
| expo-sharing | ~13.0.1 | iOS share sheet for CSV export |

## File structure
```
app/
  (tabs)/           # Bottom tabs: overview, expenses, recurring, settings
    _layout.tsx     # Tab bar config (center + button)
    index.tsx       # Overview — charts + monthly total
    expenses.tsx    # Expense list, grouped by date
    recurring.tsx   # Recurring schedule list
    settings.tsx    # Category management
    add-tab.tsx     # Placeholder for center + tab (never navigated to)
  category/
    [id].tsx        # Category detail — rename, delete, unified keyword list (static+user), delete confirmation modal
    new.tsx         # New category modal (Sheet)
  recurring/
    new.tsx         # New recurring modal (Sheet) — legacy, use /add instead
    [id].tsx        # Edit recurring modal (Sheet) — pre-populated form, UPDATE + delete
  expense/
    [id].tsx        # Edit expense modal (Sheet) — pre-populated form, UPDATE + delete
  _layout.tsx       # Root layout: QueryClient, DB migration, recurring engine
  add.tsx           # Unified add modal (single + recurring toggle)
  +not-found.tsx

components/
  DotGrid.tsx       # SVG dot grid texture overlay (sci-fi background)
  PageHeader.tsx    # Sticky header used on all tab screens
  Sheet.tsx         # 80% bottom sheet with dismissal overlay
  charts/
    CategoryPieChart.tsx
    MonthlyBarChart.tsx
  expense/
    CategoryPicker.tsx   # Bottom sheet category selector
    ExpenseForm.tsx      # Used inside add.tsx (legacy, merged into add.tsx)
    ExpenseListItem.tsx
  overview/
    CategoryBreakdown.tsx
    MonthHeader.tsx       # [ MAY 2026 ] month switcher

lib/
  categorize.ts     # Static keyword map + learned keyword lookup
  db.ts             # Drizzle client, migrations runner, recurring engine
  format.ts         # Currency formatters, date formatters
  mutations.ts      # All TanStack Mutations + exportExpensesCSV (standalone async)
  queries.ts        # All TanStack Queries
  rates.ts          # Hardcoded exchange rates (SGD base) + convertCurrency() + CURRENCIES list
  recurring.ts      # Due date computation engine (monthly/weekly/yearly/custom)
  schema.ts         # Drizzle table defs + Zod schemas (expenseFormSchema + recurringFormSchema both have optional currency field)
  seeds.ts          # Default 8 categories
  settings.ts       # Read/write settings.json via expo-file-system/legacy (defaultCurrency)
  theme.ts          # Design tokens + toGray() helper

drizzle/
  migrations.js     # SQL inlined as strings (Metro can't bundle .sql files)
  0000_*.sql        # categories + expenses
  0001_*.sql        # learned_keywords
  0002_*.sql        # recurring_expenses
```

## Database schema
- **categories** — id, name, color (hex), icon (lucide name), sortOrder, isDefault
- **expenses** — id, categoryId, amountCents (cents integer), currency, itemName, spentAt (YYYY-MM-DD), note
- **learned_keywords** — keyword (PK, normalised lowercase), categoryId, updatedAt
- **recurring_expenses** — id, itemName, amountCents, categoryId, frequency, dayOfMonth, dayOfWeek, intervalDays, monthOfYear, startDate, endDate, lastLoggedDate, note, isActive

## Design system
| Token | Value | Usage |
|---|---|---|
| bg | #0A0A0A | Screen backgrounds |
| surface | #111111 | Cards, list containers |
| elevated | #181818 | Inputs, pressed states |
| border | #2A2A2A | All strokes — 1px |
| text.primary | #FFFFFF | Main text |
| text.secondary | #888888 | Labels, subtitles |
| text.muted | #444444 | Placeholders, hints |
| radius | 4px | All corners |
| font mono | SpaceMono-Regular | Numbers, codes, labels |

**Rules:**
- All category colors run through `toGray()` (luminance conversion) — no colour ever renders as-is
- SVG dot grid (`DotGrid`) overlays every screen — `pointerEvents="none"`
- Section labels style: `// CATEGORY.NAME` or `SYS.CONTEXT`
- All amounts stored in **cents** (integer), displayed via `formatCurrency()`
- Modals use `transparentModal` presentation + `Sheet` component (80% height, tap overlay or swipe drag handle to dismiss)
- Sheet has a drag handle at top with PanResponder swipe-to-dismiss; overlay fades via translateY interpolation
- Sticky confirm/create buttons sit outside ScrollView inside Sheet
- Form ScrollViews inside Sheet use `KeyboardAwareScrollView` from `react-native-keyboard-aware-scroll-view` with `extraScrollHeight={24}`

## Key conventions
- All inline styles (not className) — NativeWind applied only to SafeAreaView backgrounds as backup
- `SafeAreaView` always from `react-native-safe-area-context`, always `edges={['top']}`
- `SectionList` always has `stickySectionHeadersEnabled={false}`
- Drizzle migrations: after generating with `drizzle-kit generate`, inline the SQL into `drizzle/migrations.js` manually (Metro can't bundle .sql imports)
- New screens added to root Stack in `app/_layout.tsx`
- Modals registered as `presentation: "transparentModal"`
- **Pressable button pattern**: use `children` render-prop (`{({ pressed }) => <View>...</View>}`) rather than `style={({ pressed }) => ...}` — more reliable press-state rendering
- **Button backgrounds**: use `T.elevated` (#181818) as resting state for standalone buttons so they contrast against `T.bg` (#0A0A0A). `T.surface` (#111111) is too close to screen bg and looks like plain text
- **Square action buttons**: set `width: 44` on the button and `height: 44` on the sibling TextInput — flex row stretch makes the button match input height, giving a natural square
- **In-app confirmation modals**: use RN `Modal` with `transparent` + `animationType="fade"`, `rgba(0,0,0,0.85)` overlay, centered floating panel (`T.surface` bg + `T.border` border). Outer Pressable dismisses on backdrop tap; inner Pressable swallows touches
- **Currency chip on amount inputs**: `flexDirection: 'row', alignItems: 'stretch', gap: 8` parent; TextInput has `flex: 1`; currency button has `aspectRatio: 1` — height stretches to match input, width = height automatically
- **Multi-currency**: amounts stored in minor units with currency code per-expense. `convertCurrency(minor, from, to)` in `lib/rates.ts` for chart aggregation — accounts for 0-decimal currencies (JPY, KRW) via scale factor. `formatCurrency(minor, currency)` for display — always pass the stored currency, never assume SGD. `getCurrencyDecimals(code)` returns 0 or 2
- **Zero-decimal currencies (JPY, KRW)**: `amountCents` column stores whole units (¥1500 = 1500, not 150000). Amount input skips decimal insertion; digit limit is 9 (not 7). `formatCurrency` divides by `10^decimals` so display is correct
- **Overview tab refetch**: uses `useFocusEffect` to call `refetch()` on `monthly-summary` + `daily-totals` every time the tab gains focus — ensures totals are always fresh after edits/adds. All expense mutations also call `refetchQueries(["monthly-summary"])`
- **Settings persistence**: `lib/settings.ts` reads/writes `{documentDirectory}/settings.json` via `expo-file-system/legacy`. Fields: `defaultCurrency`, `staticKeywordsEnabled`. Use `useDefaultCurrency()` / `useStaticKeywordsEnabled()` queries; mutations invalidate `["settings"]`
- **Keyword system**: `KEYWORD_MAP` exported from `categorize.ts`. `useLearnedKeywords` merges static map when `staticKeywordsEnabled: true` (DB entries override static). `suggestCategoryId` only checks `learnedMap` — static keywords flow through it. Keyword learning (writing to `learned_keywords`) is always active regardless of the flag. `useStaticKeywordsEnabled` query used to gate static keywords in `category/[id].tsx`
- **expo-file-system**: must import from `expo-file-system/legacy` in SDK 54 — the top-level import throws deprecation errors at runtime

## Known issues
- **NativeWind className on RN components**: not all className styles apply reliably — use inline `style` prop as source of truth, className as enhancement only.
- **Expo Go web target**: broken — expo-sqlite uses WASM on web which Metro can't bundle. Web is not a target platform.
- **Sheet swipe-to-dismiss with scroll content**: PanResponder drag handle works for all sheets but full swipe-anywhere-to-dismiss is not implemented. Consider @gorhom/bottom-sheet for a proper solution (tracked in task.md).

## Dev workflow
```bash
# Start dev server + simulator
cd /Users/danielyeo/Desktop/Outflow && npx expo start
# Press i for iOS Simulator

# Port to iPhone 16 Pro
# Open ios/outflow.xcworkspace in Xcode
# Select iPhone 16 Pro, scheme = Release, press ▶
# Certificate expires every 7 days (free Apple ID) — just re-run to renew
```

## Git
- Remote: https://github.com/danielyeokx/Outflow (private)
- Branch: main
- Use `/pp` to push, `/pc` to prep for context clear, `/eod` for end of day
