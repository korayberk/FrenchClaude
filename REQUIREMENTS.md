# French Tenses — Functional Requirements

## Core Feature: Sentence Conjugation

- User enters or pastes a French sentence into a text input area.
- On submit, the app silently corrects spelling, accents, and punctuation errors.
  - If corrected, shows a "Corrected" badge and stores the corrected form.
- The app generates tense variations of the sentence spanning past → future (avoiding subjunctive), with:
  - French sentence in that tense
  - Natural English translation
  - Short usage note (one sentence, in English)
- The original sentence tense is identified and labeled.
- No limit on the number of tense variations returned.

## Tense Timeline

- Variations are displayed in chronological order (distant past → future).
- Default view: "Most Used" — original + 4 common tenses (Présent, Imparfait, Passé composé, Futur simple).
- Full view: all returned tenses, toggled via "Most Used / All" segmented control.
- A hint shows how many additional tenses are hidden in Most Used mode.
- Each entry shows a zone label left of the timeline: "distant past", "near past", "present", "near future", "future".

## Verb Conjugation Table

- Available as a second tab ("Verbs") in a carousel alongside the tense view.
- Loaded lazily: API call only fires when the user first switches to the Verbs tab for a given sentence.
- Identifies every verb in the sentence, including:
  - Conjugated verbs (e.g. "mange" → manger).
  - Auxiliaries of compound tenses as separate entries (e.g. "je suis arrivé" yields être AND arriver).
  - Infinitives as separate entries (e.g. "j'aime nager" yields aimer AND nager).
- Infinitives are de-duplicated: the same verb appearing in multiple tenses within one sentence yields a single card.
- For each verb, the API returns all 8 tenses in one call; the UI filters client-side.
  - Default view "Most Used": Présent, Imparfait, Passé composé, Futur simple.
  - Full view "All": adds Plus-que-parfait, Passé simple, Futur proche, Conditionnel (no subjonctif).
  - Toggle via a "Most Used / All" segmented control; switching does NOT trigger a new API call.
  - A hint shows how many additional tenses are hidden in Most Used mode.
  - Pronouns: je, tu, il/elle, nous, vous, ils/elles.
- Verb card header shows the infinitive in italic plus its English meaning (e.g. "manger · to eat") and a cache-status badge (cached / fresh).
- Verbs are grouped two per card (singulier + pluriel columns for each verb, with a shared tense-label column). A trailing odd verb uses a single-verb card.
- Token usage for the verbs call is shown separately in the Verbs tab footer.

### Verb cache

- Verb conjugations are cached per-infinitive in localStorage (max 500 entries, FIFO-by-recency).
- Key: `french_verb_cache_v2`. Each cached entry stores all 8 tenses plus the English meaning.
- On verb lookup, cached infinitives are served immediately; only missing ones hit the API.
- Cache badge on each verb card indicates source: "cached" (local) or "fresh" (just fetched).

### Verb browser (`/verbs`)

- Standalone page listing every verb in the local cache, sorted alphabetically.
- Reuses the verb card component in "All tenses" view by default (toggle to "Most Used" remains available).
- Search box filters the list by French infinitive or English meaning (case-insensitive substring match).
- Verb count is shown next to the page title.
- Empty states:
  - No cached verbs: prompt to conjugate a sentence on the main page.
  - Query with no matches: inline "No verbs match …" message.
- Entry points:
  - "Verbs" link in the main-page header (next to the gear icon).
  - "Browse cached verbs" link in the History panel footer (above the Clear button; hidden during the Clear confirmation step). On mobile, clicking the link also dismisses the History slide-over.
- Back link in the page header returns to `/`.

## Input Behavior

- Textarea accepts free-form French text.
- Submit fires on button click or Cmd/Ctrl+Enter.
- After a successful conjugation, the input area collapses to a single-line pill showing the sentence.
- The pill includes an "Edit" button to re-expand the input area.
- When the input is manually re-expanded (post-submit), a "Collapse" button is shown to dismiss it again without re-submitting.
- A "Corrected" badge appears on the pill if the sentence was auto-corrected.
- Token usage for the conjugation call is shown under the collapsed pill.

## History / Archive

- Every conjugated sentence is saved to localStorage (max 1,000 entries; oldest dropped).
- History persists across page refreshes.
- History is browsable in a sidebar panel with three sort modes:
  - **Tense**: entries grouped by detected tense, each group collapsible.
  - **New**: newest-first, grouped into day sections (Today, Yesterday, then dates).
  - **Old**: oldest-first, same day grouping.
- Each history entry shows:
  - The (corrected) French sentence, truncated to one line.
  - Relative time (e.g., "2 days ago").
  - Tense badge (in New/Old modes).
- Clicking a history entry instantly restores the sentence and its full result with no additional API call.
  - Verb conjugations are re-resolved from the verb cache on tab switch (no sentence-level API call required).
- Hovering an entry reveals a delete (×) button.
- The active entry is highlighted in the panel.
- A "Clear all history & cache" button in the panel footer wipes both the history and the verb cache after a two-click confirmation.

## Settings

- Gear icon opens a settings panel.
- User enters their Anthropic API key (stored in browser localStorage only, never sent to any server other than Anthropic).
- User selects which Claude model to use:
  - Sonnet 4.6 (default) — fast, balanced
  - Opus 4.7 — best quality, slower
  - Haiku 4.5 — cheapest, quick
- Settings are persisted in localStorage.

## Layout

- Desktop (≥ lg breakpoint): two-column layout — fixed-width history sidebar (256 px) + scrollable main content (max 960 px).
- Mobile (< lg): history panel hidden by default; a clock icon in the header opens it as a slide-over overlay.

## Error Handling

- Missing sentence or API key: 400 error surfaced as inline message.
- Claude response too long (max_tokens exceeded): user-friendly error message.
- Empty or unparseable JSON from Claude: user-friendly retry message.
- Network/fetch errors: error message shown inline.
