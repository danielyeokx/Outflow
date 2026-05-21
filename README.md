# Outflow

> A native iOS expense tracker built to eliminate interaction fatigue through intelligent, zero-friction logging.

## Overview

Outflow was built out of frustration with modern budgeting apps — ad-heavy, subscription-gated, and demanding tedious manual categorisation. The philosophy here is simple: **the more you use it, the less you have to do.** Every transaction you categorise teaches the app, so future entries auto-suggest the right category before you even finish typing.

The entire application — problem definition, UX design, and working code — was built within a **5-hour timebox** using agentic coding workflows to compress the engineering timeline.

<img width="3680" height="2760" alt="mockup" src="https://github.com/user-attachments/assets/a0f458ab-1d41-4c70-a62c-4ec253ba367b" />


---

## Features

- **Two-input logging** — only cost and item name are required. Date and timestamp are automatic.
- **Adaptive keyword engine** — learns your categorisation habits and auto-suggests categories on future entries. Also ships with a static keyword map covering common merchants (Grab, Netflix, Starbucks, etc.) that can be toggled on or off.
- **Recurring expenses** — schedule subscriptions and bills on monthly, weekly, yearly, or custom-day intervals. The engine auto-logs missed entries on app launch so nothing falls through the gaps.
- **Multi-currency** — log expenses in 12 currencies (SGD, USD, EUR, GBP, JPY, AUD, CNY, MYR, HKD, KRW, THB, INR). The overview chart converts everything into your default display currency using hardcoded indicative rates.
- **Category management** — 8 default categories seeded on first launch. Create, rename, and delete your own. Each category has a colour and icon that renders in grayscale to match the app aesthetic.
- **CSV export** — export your full expense history from the settings tab via the iOS share sheet.
- **Local-first, no account required** — all data is stored on-device in SQLite. Nothing leaves your phone.

<img width="3680" height="2760" alt="mockup3" src="https://github.com/user-attachments/assets/bcd6c737-4198-4544-9861-2b7ecff66206" />
<img width="3680" height="2760" alt="mockup6" src="https://github.com/user-attachments/assets/2bc65755-08da-4e39-a2d1-c981b3c59b41" />


---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 / Expo SDK 54 |
| Routing | Expo Router 6 (file-based) |
| Database | expo-sqlite + Drizzle ORM (local SQLite) |
| Server state | TanStack Query v5 |
| Forms | react-hook-form + Zod |
| Styling | NativeWind 4 (Tailwind v3) + inline styles |
| Charts | react-native-gifted-charts |
| Icons | lucide-react-native |
| Build tooling | Xcode + CocoaPods (iOS native) |
| AI collaborator | Claude Code |

Data is stored in SQLite on the device's local filesystem. It persists across app restarts, OS updates, and Xcode re-deploys as long as the app is not deleted from the device.

---

## Running Locally

> **iOS only.** The web target is broken (expo-sqlite uses WASM on web, which Metro cannot bundle). Android is untested.

### Prerequisites

- Node.js v18+
- Xcode (latest stable)
- CocoaPods (`gem install cocoapods` or `brew install cocoapods`)
- An Apple ID (free tier works; developer certificate expires every 7 days and must be renewed by rebuilding)

### Setup

```bash
git clone https://github.com/danielyeokx/Outflow.git
cd Outflow
npm install
cd ios && pod install && cd ..
```

### Run on iOS Simulator

```bash
npx expo start
# Press i to open in the iOS Simulator
```

### Deploy to a physical iPhone

1. Open `ios/outflow.xcworkspace` in Xcode (not the `.xcodeproj`)
2. Select your iPhone as the target device
3. Set the scheme to **Release** (Edit Scheme → Run → Build Configuration → Release)
4. Set your Apple ID team under Signing & Capabilities
5. Press **Run (▶)**

On first install you'll need to trust the developer certificate: **Settings → General → VPN & Device Management → your Apple ID → Trust**.

> If you see `Cannot find native module 'ExpoSharing'` after adding dependencies, run `cd ios && pod install` then clean + rebuild in Xcode.

---

## Data Persistence

All expenses, categories, learned keywords, and recurring schedules are stored in a local SQLite file (`outflow.db`) in the app's document directory. The database survives:

- App restarts
- Xcode re-deploys (Release builds)
- iOS updates

It does **not** survive uninstalling the app, as iOS wipes the document directory on uninstall.

---

## Project Structure

```
app/
  (tabs)/         # Bottom tabs: overview, expenses, recurring, settings
  category/       # Category detail + new category modal
  recurring/      # New/edit recurring expense modals
  expense/        # Edit expense modal
  add.tsx         # Unified add modal (one-time + recurring toggle)

components/
  charts/         # Pie + bar charts
  expense/        # Category picker, list item
  overview/       # Month switcher, category breakdown

lib/
  categorize.ts   # Static keyword map + learned keyword lookup
  db.ts           # Drizzle client + migration runner + recurring engine
  mutations.ts    # All TanStack mutations + CSV export
  queries.ts      # All TanStack queries
  rates.ts        # Hardcoded exchange rates + convertCurrency()
  recurring.ts    # Due date computation (monthly/weekly/yearly/custom)
  schema.ts       # Drizzle table definitions + Zod validation schemas
  settings.ts     # Read/write settings.json (default currency, keyword toggle)

drizzle/
  migrations.js   # SQL migrations inlined as strings (Metro can't bundle .sql files)
```

---

## Design System

Grayscale sci-fi aesthetic. All category colours are converted to luminance-equivalent grays at render time — no colour ever displays as-is. Monospace font (Space Mono) throughout. SVG dot grid overlay on every screen.

| Token | Value | Usage |
|---|---|---|
| bg | `#0A0A0A` | Screen backgrounds |
| surface | `#111111` | Cards, containers |
| elevated | `#181818` | Inputs, buttons |
| border | `#2A2A2A` | All strokes (1px) |
| text.primary | `#FFFFFF` | Main text |
| text.secondary | `#888888` | Labels, subtitles |
| text.muted | `#444444` | Placeholders |
