# French Tenses — UI Specification

## Design Language

- Dark, minimalistic aesthetic: near-black surfaces, off-white text, generous spacing, rounded corners. Single-theme (no light mode).
- Color palette via CSS custom properties (defined in `app/globals.css`):
  - `--background`: `#0D0D0F` — page background
  - `--foreground`: `#F2F2F5` — primary text, inverted-surface buttons
  - `--secondary-label`: `#A8A8AE` — secondary text
  - `--tertiary-label`: `#75757B` — timestamps, token counts, placeholders
  - `--separator`: `#2A2A2E` — borders, dividers
  - `--card`: `#17171A` — card surfaces
  - `--surface`: `#121214` — sidebar background, table-row striping
  - `--card-hover`: `#222226` — row hover state
- Typography: system font stack (Geist / SF Pro fallback), no custom font overrides.
- Shadows: `0 1px 2px rgba(0,0,0,0.3)` on cards; `0 4px 20px rgba(0,0,0,0.45)` on the highlighted card; `0 12px 40px rgba(0,0,0,0.6)` on floating panels.
- Inverted surfaces (Conjugate button, Edit pill, highlighted TenseCard, selected model row) use `var(--foreground)` background paired with `var(--background)` text, so the inversion stays token-driven.

## Layout

### Desktop (≥ lg)
```
┌──────────────────┬──────────────────────────────────┐
│  History Panel   │          Main Content             │
│  256px fixed     │  flex-1, max-w-960px, centered    │
│                  │                                   │
│  [sort tabs]     │  Header: title + gear icon        │
│  ─────────────   │  Input area (or collapsed pill)   │
│  Tense section   │  Error banner (if any)            │
│  └ entry row     │  Carousel: Sentences | Verbs      │
│  └ entry row     │                                   │
└──────────────────┴──────────────────────────────────┘
```

### Mobile (< lg)
- History panel hidden; clock icon in header opens it as a full-height slide-over with a dimmed backdrop (`rgba(0,0,0,0.6)`).
- Main content spans full width with horizontal padding `px-5`.

## Components

### Header
- Left: clock icon (mobile only) + app title "French Tenses" (28px semibold) + subtitle "Type a sentence in French — see it across tenses" (15px, `--secondary-label`).
- Right: gear icon button (18px, `--secondary-label`) that opens the Settings panel.

### Settings Panel (floating, 300px wide)
- Positioned top-right relative to gear icon.
- Sections: API Key (password input) + Model picker (stacked list of 3 options).
- Active model: `--foreground` background + `--background` text.
- Inactive model: `--background` surface with `--foreground` text.
- Save / Cancel buttons, right-aligned.

### Input Area (expanded state)
- Card (`--card`), 1px `--separator` border, subtle shadow, `rounded-2xl`.
- Multi-line textarea, 17px, `--foreground` text, transparent background.
- Placeholder: `--tertiary-label`.
- "Conjugate" submit button: `--foreground` pill with `--background` text; when disabled, `--separator` background + `--secondary-label` text.
- After a result exists, a "Collapse" pill appears beneath the card (right-aligned, `--separator` background, `--secondary-label` text).
- "Corrected" banner below card (if auto-corrected): green-tinted (`rgba(34,197,94,0.10)` bg, `#86EFAC` text, `rgba(34,197,94,0.28)` border), check mark icon.

### Input Area (collapsed state)
- Single-line pill: card surface, full-width, sentence text (15px) + "Edit" badge (`--foreground` bg, `--background` text, `rounded-lg`).
- "corrected" badge (green pill: `rgba(34,197,94,0.16)` bg, `#86EFAC` text) shown between sentence and Edit button when corrected.
- Token usage line below pill: 11px, `--tertiary-label`, right-aligned. Format: `N in · M out · T total tokens`.

### Carousel
- Segmented control (`--separator` background, `rounded-xl`), self-start (left-aligned).
- Active tab: `--card` background + shadow; inactive: transparent + `--secondary-label` text.
- Slide transition: CSS `translateX`, `0.32s cubic-bezier(0.4, 0, 0.2, 1)`.
- Touch swipe: 50px threshold to advance slide.

### Timeline (Sentences tab)

#### Controls
- "Most Used / All" segmented control, same style as Carousel tabs.
- "+N more tenses" hint (12px, `--tertiary-label`) when in Most Used mode.

#### Timeline layout
- Single 1px vertical line (`--separator`) running through all entries.
- Zone labels left of the line: 10px uppercase, `--tertiary-label` (variation) / `--secondary-label` semibold (original).
- Original entry: 18px filled dot (`--foreground`) with a 6px `--background` center; inverted card (`--foreground` bg, `--background` text).
- Variation entries: 10px open circle bordered in `--tertiary-label`; standard card (`--card` bg).

#### Card anatomy (single-row layout)
- Horizontal card: `[chip] → [french stacked over english]`.
- Tense chip: 11px uppercase, tinted accent per tense (see below). On the highlighted card, chip uses `rgba(13,13,15,0.12)` bg + `rgba(13,13,15,0.8)` text.
- French sentence: 17px medium.
- English translation: 13px, `--secondary-label` (or `rgba(13,13,15,0.68)` on the highlighted card).
- Usage note: not shown on the card; surfaced as a native browser tooltip via the card's `title` attribute.

#### Tense accent chips (dark-saturated bg + bright text)
- Présent: `rgba(52,211,153,0.14)` / `#6EE7B7`
- Imparfait: `rgba(251,146,60,0.14)` / `#FDBA74`
- Passé composé: `rgba(244,114,182,0.14)` / `#F9A8D4`
- Futur simple: `rgba(96,165,250,0.14)` / `#93C5FD`
- Conditionnel: `rgba(167,139,250,0.14)` / `#C4B5FD`
- Passé simple: `rgba(248,113,113,0.14)` / `#FCA5A5`
- Plus-que-parfait: `rgba(190,242,100,0.14)` / `#D9F99D`
- Fallback: `rgba(255,255,255,0.06)` / `#A8A8AE`

### Verbs Tab
- Loading state: spinner + "Looking up conjugations…" (13px, `--tertiary-label`).
- Verbs are rendered two per card (singulier + pluriel columns for each verb). A trailing odd verb gets a single-verb card.
- Card header: a CSS grid (`110px 1fr 1fr` for pair, `110px 1fr` for single) so each verb's italic infinitive label sits directly above its own conjugation columns. A vertical `--separator` divider falls between the two verbs.
- Table: first column (110px) is the tense label (Présent / Imparfait / Passé composé / Futur simple) with a zone hint underneath. Remaining columns are `singulier` / `pluriel`, repeated for each verb.
- Each conjugation cell: two-column grid (pronoun label in `--tertiary-label`, conjugated form in `--foreground`), six pronouns (je, tu, il/elle, nous, vous, ils/elles).
- Alternating tense rows are striped with `--surface`.
- Token usage footer: same format as sentences token line.

### History Panel
- `--surface` background, 1px `--separator` right border.
- Sticky header: "History" title (13px semibold) + sort segmented control (Tense | New | Old, 11px).
- Scrollable body (`overflow-y-auto`).

#### Tense mode
- Section headers: tense name (11px semibold uppercase, `--secondary-label`) + entry count badge.
- Collapse/expand toggle per section (chevron icon).

#### Date modes (New / Old)
- Section headers: day label (Today / Yesterday / Jan 15, 2026) — 11px uppercase, `--secondary-label`.

#### Entry row
- Full-width row, `px-3 py-2.5`.
- Selected: `--separator` background.
- Hover: `--card-hover` background.
- Sentence text: 13px, `--foreground`, truncated to 1 line.
- Meta line: relative time (11px, `--tertiary-label`) + tense badge (in date modes).
- Delete button (×): appears on hover, right-aligned, 14px, `--tertiary-label`.

#### Empty state
- Centered text: "Your sentences will appear here" (13px, `--tertiary-label`).

### Error Banner
- `rounded-xl`, 14px, inline below input area.
- Colors: `rgba(239,68,68,0.12)` background, `#FCA5A5` text, `rgba(239,68,68,0.28)` border.

## Spacing & Sizing Summary

| Element | Value |
|---|---|
| Page padding | `px-5 pt-16 pb-24` |
| Max content width | 960px |
| History panel width | 256px |
| Card border-radius | `rounded-2xl` (16px) |
| Button border-radius | `rounded-xl` (12px) |
| Card border | `1px solid var(--separator)` |
| Card shadow | `0 1px 2px rgba(0,0,0,0.3)` |
| Highlighted card shadow | `0 4px 20px rgba(0,0,0,0.45)` |
| Section gap | 10px–12px |
| Timeline dot (original) | 18px |
| Timeline dot (variation) | 10px |
| Verb table tense-label column | 110px |
