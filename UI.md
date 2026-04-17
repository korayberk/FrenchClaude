# French Tenses — UI Specification

## Design Language

- Apple-inspired aesthetic: clean whites, soft grays, generous spacing, rounded corners.
- Color palette via CSS custom properties:
  - `--background`: `#F5F5F7` — page background
  - `--foreground`: `#1D1D1F` — primary text, dark buttons
  - `--secondary-label`: `#6E6E73` — secondary text, usage notes
  - `--tertiary-label`: `#AEAEB2` — timestamps, token counts
  - `--separator`: `#D2D2D7` — borders, dividers
  - `--card`: `#FFFFFF` — card surfaces
- Typography: system font stack (Geist / SF Pro fallback), no custom font overrides.
- No drop shadows heavier than `0 1px 4px rgba(0,0,0,0.06)` on cards; `0 8px 32px rgba(0,0,0,0.12)` on floating panels.

## Layout

### Desktop (≥ lg)
```
┌──────────────────┬──────────────────────────────────┐
│  History Panel   │          Main Content             │
│  256px fixed     │  flex-1, max-w-640px, centered    │
│                  │                                   │
│  [sort tabs]     │  Header: title + gear icon        │
│  ─────────────   │  Input area (or collapsed pill)   │
│  Tense section   │  Error banner (if any)            │
│  └ entry row     │  Carousel: Sentences | Verbs      │
│  └ entry row     │                                   │
└──────────────────┴──────────────────────────────────┘
```

### Mobile (< lg)
- History panel hidden; clock icon in header opens it as a full-height slide-over with backdrop.
- Main content spans full width with horizontal padding `px-5`.

## Components

### Header
- Left: clock icon (mobile only) + app title "French Tenses" (28px semibold) + subtitle "Type a sentence in French — see it across tenses" (15px, secondary-label).
- Right: gear icon button (18px, secondary-label) that opens the Settings panel.

### Settings Panel (floating, 300px wide)
- Positioned top-right relative to gear icon.
- Sections: API Key (password input) + Model picker (segmented list of 3 options).
- Active model: dark background (`--foreground`) + white text.
- Inactive model: `--background` + `--foreground` text.
- Save / Cancel buttons, right-aligned.

### Input Area (expanded state)
- White card (`--card`), 1px separator border, subtle shadow, `rounded-2xl`.
- Multi-line textarea, 15px, `--foreground` text.
- Placeholder: `#AEAEB2` (`--tertiary-label`).
- "Conjugate" submit button: dark pill (`--foreground` background, white text), disabled when no API key.
- "Corrected" banner below card (if auto-corrected): green-tinted (`#F0FDF4` bg, `#166534` text, `#BBF7D0` border), check mark icon.

### Input Area (collapsed state)
- Single-line pill: white card, full-width, sentence text (15px) + "Edit" badge (dark background, white text, `rounded-lg`).
- "corrected" badge (green pill) shown between sentence and Edit button when corrected.
- Token usage line below pill: 11px, tertiary-label, right-aligned. Format: `N in · M out · T total tokens`.

### Carousel
- Segmented control (`--separator` background, `rounded-xl`), self-start (left-aligned).
- Active tab: `--card` background + shadow; inactive: transparent + secondary-label text.
- Slide transition: CSS `translateX`, `0.32s cubic-bezier(0.4, 0, 0.2, 1)`.
- Touch swipe: 50px threshold to advance slide.

### Timeline (Sentences tab)

#### Controls
- "Most Used / All" segmented control, same style as Carousel tabs.
- "+N more tenses" hint (13px, tertiary-label) when in Most Used mode.

#### Timeline layout
- Single vertical line (2px, `--separator`) running through all entries.
- Zone labels left of the line (uppercase, 10px, tertiary-label, letter-spacing 0.05em): DISTANT PAST / NEAR PAST / PRESENT / NEAR FUTURE / FUTURE.
- Original entry: 18px filled dark dot (`--foreground`) with 6px white center; dark card (`--foreground` background, white text).
- Variation entries: 10px open gray circle; white card (`--card`), `--foreground` text, 13px usage note in secondary-label below translation.

#### Card anatomy
- Tense label: 11px uppercase, tertiary-label (white/60 on dark card).
- French sentence: 17px semibold.
- English translation: 15px.
- Usage note: 13px, secondary-label (white/70 on dark card).

### Verbs Tab
- Loading state: spinner + "Looking up conjugations…" (13px, tertiary-label).
- Per-verb card: italic infinitive header (15px semibold) + table.
- Table columns: sentence form | il/elle | ils/elles.
- Table rows: 4 tenses, each with a left zone-label badge.
- Token usage footer: same format as sentences token line.

### History Panel
- White background (`--card`), left border (`1px solid var(--separator)`).
- Sticky header: "History" title (15px semibold) + sort segmented control (Tense | New | Old, 12px).
- Scrollable body (`overflow-y-auto`).

#### Tense mode
- Section headers: tense name (12px semibold, secondary-label) + entry count badge.
- Collapse/expand toggle per section (chevron icon).

#### Date modes (New / Old)
- Section headers: day label (Today / Yesterday / Jan 15, 2026) — 11px uppercase, tertiary-label.

#### Entry row
- Full-width button, `px-3 py-2`, `rounded-xl`.
- Selected: `--separator` background.
- Hover: `--separator` background (0.5 opacity transition).
- Sentence text: 13px, foreground, truncated to 1 line.
- Meta line: relative time (11px, tertiary-label) + tense badge (in date modes).
- Delete button (×): appears on hover, right-aligned, 12px, secondary-label.

#### Empty state
- Centered text: "Your sentences will appear here" (13px, tertiary-label).

### Error Banner
- `rounded-xl`, 14px, inline below input area.
- Colors: `#FFF1F2` background, `#9F1239` text, `#FFE4E6` border.

## Spacing & Sizing Summary

| Element | Value |
|---|---|
| Page padding | `px-5 pt-16 pb-24` |
| Max content width | 640px |
| History panel width | 256px |
| Card border-radius | `rounded-2xl` (16px) |
| Button border-radius | `rounded-xl` (12px) |
| Card border | `1px solid var(--separator)` |
| Card shadow | `0 1px 4px rgba(0,0,0,0.06)` |
| Section gap | 10px–12px |
| Timeline dot (original) | 18px |
| Timeline dot (variation) | 10px |
