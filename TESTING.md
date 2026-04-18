# Manual QA Checklist

Instructions for a browser-based agent (or human tester) verifying the Verbs tab cache and history behavior. Assumes devtools Network and Application tabs are available.

Before starting: open devtools → Application → Local Storage → site origin. Delete the `french_verb_cache` key if present (gives a clean starting point). Have a valid Anthropic API key saved via the gear icon.

## 1. Cold path (first fetch populates the cache)

1. Application tab → `french_verb_cache` is absent.
2. Enter sentence "Je mange une pomme." → submit.
3. Click the **Verbs** tab.
4. **Expected network**: one `POST /api/verb-infinitives` (returns `["manger"]`), then one `POST /api/verbs` with body `{"infinitives":["manger"],...}`.
5. **Expected UI**: one verb card for *manger* with full 6-pronoun × 4-tense grid.
6. **Expected storage**: `french_verb_cache` now contains key `manger` with full conjugations.

## 2. All-cached path (big savings)

1. Pre-condition: step 1 complete (cache has *manger*).
2. Enter a different sentence reusing the same verb: "Nous mangeons ensemble." → submit.
3. Click **Verbs** tab.
4. **Expected network**: one `POST /api/verb-infinitives` only. **No** call to `/api/verbs`.
5. **Expected UI**: *manger* card renders from cache.
6. **Expected token footer**: reflects only the identify call (small numbers, e.g. low hundreds of input, single-digit output).

## 3. Partial-hit path (the main win)

1. Pre-condition: cache has *manger* from step 1.
2. Enter "Je mange et je cours." → submit → Verbs tab.
3. **Expected**: identify call returns `["manger","courir"]`. Conjugate call body is `{"infinitives":["courir"],...}` (only the miss). Cache now contains both *manger* and *courir*.
4. Enter "Nous mangeons et nous parlons." → submit → Verbs tab.
5. **Expected**: identify returns `["manger","parler"]`. Conjugate body is `{"infinitives":["parler"],...}` only. UI shows both verbs (manger from cache, parler fresh). Cache now has three entries.

## 4. Persistence across reload

1. Pre-condition: cache has at least *manger*.
2. Reload the page.
3. Enter "Je mange." → submit → Verbs tab.
4. **Expected**: identify call fires, no conjugate call, *manger* renders. Cache survived the reload.

## 5. History-item selection refetches when needed (regression check)

This covers the bug where clicking a history entry from the Verbs tab previously showed "No verb data — try conjugating again."

1. Submit "Je parle français." → wait for result.
2. Click the **Verbs** tab → wait for the verb grid to render.
3. Submit a second sentence: "Tu lis un livre." → result renders.
4. Click the **Verbs** tab → wait for the verb grid.
5. In the History sidebar, click the first entry ("Je parle français.").
6. **Expected**: the Verbs tab shows *parler* (fetched from cache if present, or via the two-call flow if not). Never shows "No verb data".
7. Click the second entry ("Tu lis un livre.") in history.
8. **Expected**: verbs update to *lire*. Again, never "No verb data".

## 6. Cross-sentence ordering

1. Submit a sentence with multiple verbs in a specific order, e.g. "Je bois et je mange." (expect verbs `["boire","manger"]`).
2. **Expected**: the two verb cards render in the order *boire*, *manger* (matching the order Claude identified them), regardless of whether either was cached or fetched.

## 7. Empty/no-verb sentence (edge case)

1. Submit a sentence with no verbs, e.g. "La voiture rouge." (if Claude returns an empty list).
2. Click Verbs tab.
3. **Expected**: only the identify call fires; UI shows "No verb data — try conjugating again." This message is correct here — not a bug.

## 8. Type check / build (run from the repo root)

```
npx tsc --noEmit
```

Should exit with no output and code 0.
