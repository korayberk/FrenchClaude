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
- Loaded lazily: API call only fires when the user first switches to the Verbs tab.
- Identifies all conjugated verbs in the sentence.
- For each verb, shows a table with 4 tenses × 3 forms:
  - Sentence form (same person/number as the input sentence)
  - il/elle form
  - ils/elles form
- The 4 tenses shown: Présent, Imparfait, Passé composé, Futur simple.
- Token usage for the verbs call is shown separately in the Verbs tab footer.

## Input Behavior

- Textarea accepts free-form French text.
- Submit fires on button click or Cmd/Ctrl+Enter.
- After a successful conjugation, the input area collapses to a single-line pill showing the sentence.
- The pill includes an "Edit" button to re-expand the input area.
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
- Hovering an entry reveals a delete (×) button.
- The active entry is highlighted in the panel.

## Settings

- Gear icon opens a settings panel.
- User enters their Anthropic API key (stored in browser localStorage only, never sent to any server other than Anthropic).
- User selects which Claude model to use:
  - Sonnet 4.6 (default) — fast, balanced
  - Opus 4.7 — best quality, slower
  - Haiku 4.5 — cheapest, quick
- Settings are persisted in localStorage.

## Layout

- Desktop (≥ lg breakpoint): two-column layout — fixed-width history sidebar (256 px) + scrollable main content.
- Mobile (< lg): history panel hidden by default; a clock icon in the header opens it as a slide-over overlay.

## Error Handling

- Missing sentence or API key: 400 error surfaced as inline message.
- Claude response too long (max_tokens exceeded): user-friendly error message.
- Unparseable JSON from Claude: user-friendly retry message.
- Network/fetch errors: error message shown inline.
