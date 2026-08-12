# Context: UI/UX implementation session

**Saved** 2026-08-12T20:25Z · **PR** [#214](https://github.com/mat3ra/wave.js/pull/214) · **Branch chain tip** `claude/uiux-p1-parameters` (PR head `claude/uiux-p0-viewer-states` is fast-forwarded to it)

Durable record of what was built, what was decided, and what is still open — so this does not have
to be reconstructed from commit archaeology.

---

## 1. What this session produced

A design proposal ([`docs/design/uiux-improvements-2026-08.md`](../../docs/design/uiux-improvements-2026-08.md),
14 findings `F1`–`F14`, 13 proposals `U-1`–`U-13`, 5 SVG mockups) followed by the implementation of
P0 and P1 — `U-1` through `U-11` — as one branch per item.

| Item | Branch | Commit | What |
|---|---|---|---|
| docs | `claude/uiux-improvements-brainstorm-p9svkn` | `37369dc` | proposal + mockups |
| U-1 | `claude/uiux-p0-status-bar` | `667b4e6` | `StatusBar` |
| U-2 | `claude/uiux-p0-mode-pill` | `6591930` | `ModePill` + measurement readout |
| U-3 | `claude/uiux-p0-keyboard-sheet` | `10cb287` | `KeyboardSheet` on `?` |
| U-4 | `claude/uiux-p0-view-switches` | `0bc1f91`, `5d7ddc4` | `ToggleIndicator` |
| U-5 | `claude/uiux-p0-viewer-states` | `eef4704` | `ViewerErrorBoundary` + `ViewerStatus` |
| U-6 | `claude/uiux-p1-inspector-split` | `f26ef8d` | `EditToolbar` + `SelectionInspector` (fixes F1) |
| U-9 | `claude/uiux-p1-undo-reachable` | `16a986e` | undo outside edit mode + last-action hint |
| U-10 | `claude/uiux-p1-camera-presets` | `f628e8f` | `setCameraAlongCellVector` |
| U-11 | `claude/uiux-p1-focus-visibility` | `da8f03d` | `:focus-visible` rings |
| U-7 | `claude/uiux-p1-quick-toggles` | `319447c` | `QuickToggles` |
| U-8 | `claude/uiux-p1-parameters` | `7972622` | parameters rework |
| — | (tip) | `e338f12` | merge `origin/dev` |
| — | (tip) | `5882636` | regenerate 17 visual baselines |
| — | (tip) | `6850383` | Netlify deploy config |
| — | (tip) | `2e5fa89` | this context record |
| — | (tip) | `19527bd` | retry `npm ci` (sharp/libvips 503) |
| U-12 | `claude/uiux-p2-figure-export` | `e4fb816` | figure export |

Suite: **185 → 410 passing**, 28/28 suites, 0 failed. `tsc --noEmit` clean, `npm run lint` 0 errors.

**`U-13` (touch and small screens) is a separate PR stacked on this one**, on branch
`claude/uiux-p2-touch-support`. It is the only item in the set that changes how *existing* input is
handled rather than adding a surface, so it is worth being separately reviewable and separately
revertable. Its own record is in §8.

## 2. Decisions worth not relitigating

- **`U-2` needed no new mixin callback.** Measurement managers already push `getSettings()` through
  `updateState` on every click. Two facts were added to that payload — `selectedAtomsCount` and
  `atomsPerMeasurement` — rather than opening a channel. Arity is declared on the managers
  (`atomsPerMeasurement = 2` on distance, `3` on angle) so the UI never restates "a distance needs
  two atoms".
- **`U-3` made the keydown handler config-driven.** The four hard-coded editor keys moved into
  `settings.editorKeysConfig`; `matchesEditorKey` is deliberately *stricter* than the inline
  comparisons it replaced — `Ctrl+Delete` no longer removes an atom, `Shift+Delete` still does.
- **`U-6`'s units toggle changes the display, not the material.** Editing stays in the material's
  native units; a non-native display makes the fields read-only and says why. Converting a whole
  point back on commit is riskier than switching a display and deserves its own slice with
  round-trip tests, in an editor whose spec is entirely about not corrupting coordinates.
- **`U-9` ungates `Ctrl/Cmd+Z` safely** — gated on *having something to undo* instead of on edit
  mode, so an empty stack leaves the event alone and an embedding host keeps the key for its own
  undo. That answered the proposal's open question 4 without needing host changes.
- **`U-5` uses an inline card, not `AlertDialog`.** A render failure is not a decision the user
  makes, and a modal would cover the toolbar needed to recover. `AlertDialog` and `ModalDialog`
  remain unused and should be deleted or moved to cove rather than given a contrived caller.
- **Nothing advertises a binding that does not work.** The pill claims `RMB = orbit` only once orbit
  is enabled (it starts disabled); `?` went unmentioned until the sheet existed; `U-8` ships no bond
  count because bonds are computed asynchronously.
- **Regeneration over tolerance for the visual baselines.** See §4.
- **`U-12` renders offscreen by resizing the real renderer, not by allocating a second one.** A
  second `WebGLRenderer` means a second GL context, a second copy of every texture and geometry, and
  a scene that can only belong to one of them at a time. Resizing the existing drawing buffer inside
  a `try/finally` gets the same result with one context; what it costs is the discipline of restoring
  *everything* — size, pixel ratio, clear colour and alpha, scene background, fog, and every material
  colour touched — which is what the tests pin.

## 3. Confirmed *not* defects — do not re-investigate

- **View menu shows *Rotate/Zoom* off at startup.** Correct, not rough edge R7's desync: orbit
  genuinely is off until toggled (`initOrbitControls(enabled = false)`), confirmed by dragging the
  live app and observing no camera change. The old grey checkmark said the same thing; the switch
  just makes it legible enough to notice.
- **MUI text fields and toggle buttons "without a focus indicator".** A crude outline/box-shadow
  probe reports those as unindicated; they signal focus through border and background instead. False
  negative, not a finding.
- **Full-width horizontal lines across an exported figure.** They are the axes/ruler overlay, present
  identically on screen — the export is faithful. Toggle Axes off. (Whether that overlay should look
  like a dense ruler grid at all is a separate question, untouched here.)
- **`document.querySelector("canvas")` returning a 100×100 element.** That is the axes-indicator
  overlay canvas; the main one is a later sibling. Any probe measuring "the canvas" must take the
  largest, or it silently measures the wrong element.
- **Two CI runs per commit on this chain.** Both branches (the per-item branch and the PR head) point
  at the same SHA, and `on: [push]` with a ref-keyed concurrency group gives each its own run. Not a
  race; the duplicate is expected while the chain is pushed twice.

## 4. Why CI was red, and how it was fixed

Not caused by this work. Checking out the branch point `4127347` in the same environment fails the
**same 17** tests. CI reported 17 failed / 323 passed on the tip; this container reproduced exactly
17 / 323, making it a faithful stand-in for the CI renderer.

Cause: the van der Waals fix (`7e3541f`) made atom radii per-element, which legitimately changes
every rendered image, and the baselines still encoded the pre-fix rendering. `ab4b022` recorded the
regeneration as outstanding — done and verified in an earlier session but uncommittable there
because the baselines are LFS-tracked and that environment got a 403 from the LFS endpoint.

Verified legitimate three ways before promoting anything:
1. Diff images show thin crescents on each sphere's **rim and nothing else** — wireframes, positions
   and colours pixel-identical.
2. Differences are 0.00%–0.50% of pixels.
3. Reintroducing the uniform-radius bug makes the old baselines pass again, pinning them to the
   pre-fix render.

**Chose regeneration over relaxing the comparison.** `takeSnapshotAndAssertEqualityAsync` asserts
`numDiffPixels === 0` while the README promises "comparison with a tolerance", so a pixel-count
budget is arguably missing — but any budget wide enough to absorb this (>0.5%) would also absorb the
radius regression these baselines exist to catch. If genuine cross-driver noise appears later, add
that tolerance on its own evidence, not as a way to hide a stale reference.

## 5. Environment gotchas (cost real time; worth knowing)

- **`git push --no-verify` skips the LFS pre-push hook**, which is what uploads the blobs. Pointers
  push, PNGs do not, and CI then fails fetching them. Run `git lfs push origin <branch>` explicitly
  after, and verify from a fresh clone.
- `git-lfs` is installable via `apt-get install -y git-lfs` here, and `git lfs pull` works — so the
  real baselines *can* be fetched, unlike the earlier session.
- Commit with `--no-verify` (pre-commit rebuilds `dist/`); push with `--no-verify` **plus** the
  explicit `git lfs push` above.
- Tests: `xvfb-run -s "-ac -screen 0 1024x768x24" npm test`. A single-file `npx jest <path>` run
  trips the global coverage thresholds — pass `--coverage=false`.
- Lint check: `npx eslint src` prints `error` with **two** spaces (`  error  `). A `grep ' error '`
  pattern silently reports zero — that mistake hid 13 orphaned imports for a while. Use the
  `✖ N problems (E errors, W warnings)` summary line.
- Enzyme cannot find MUI components by display name (`find("IconButton")` matches nothing). Use
  `findWhere` on a distinguishing prop.
- Playwright is not a project dependency; `playwright-core` was installed into the scratchpad, and
  the browser is at `/opt/pw-browsers/chromium` (the symlink is the binary, not a directory).

## 6. What the browser pass caught that jsdom could not

Six defects in newly written code, which is the argument for keeping a real-browser pass in the
loop rather than trusting the suite alone:

1. The pill advertised `RMB = orbit` unconditionally while orbit starts disabled.
2. The keyboard sheet footer read "Ctrl is Ctrl on Windows and Linux and Cmd on macOS".
3. Fixing F1's vertical clipping introduced **horizontal** clipping — the Z field ran off the card.
4. Cause of (3): MUI's `InputBase` root carries `min-width: 75px` against a 57 px grid column, and
   `MuiClassNameSetup` renames MUI classes to `wave-Mui*`, so a `.MuiInputBase-root` selector never
   matches — it needs a class-substring selector.
5. Slider range marks overlapped their caption, because MUI positions mark labels absolutely.
6. `U-12`'s scale-bar label was set at `height/28` only after looking at a rendered figure; the
   original `height/36` is about 5 pt at 300 dpi, under most journals' minimum type size.

One pre-existing bug also came out of verification rather than reading: the orthographic projection
matrix was never updated after the frustum was fitted to the cell. Caught by cross-checking the
scale bar against the camera's own projection over a known 2 Å separation — the kind of assertion
that catches a formula wrong by a constant factor, which nothing else in the suite would have.

## 7. Deployment

Netlify is live and confirmed. Site `mat3ra-mave`; PR #214's preview serves at
`https://deploy-preview-214--mat3ra-mave.netlify.app/` (HTTP 200, verified, with `/main.js` resolving
at the domain root — the `--base=/` override works). The production URL 404s because `netlify.toml`
only exists on this chain, so no build has run for `dev` yet; that resolves when this lands. Nothing
appeared on commit `6850383` because the site was linked *after* that push — Netlify builds on new
pushes, so the first evidence arrives with the next commit.

Chromium in this container cannot traverse the sandbox's egress proxy (curl can), so the live preview
was verified by fetching it, not by driving it. The interactive verification was done against the
byte-identical local build of the same artifact.

## 8. The stacked touch PR (`U-13`)

Branch `claude/uiux-p2-touch-support`, based on this PR's head rather than on `dev`. Kept separate
because it is the only item in the set that changes how *existing* input is handled — `touch-action`
on the canvas and OrbitControls' touch mapping in edit mode — rather than adding a new surface. That
makes it the one slice worth being able to review and revert on its own.

What it contains: `touch-action: none` on the renderer canvas (without which no touch drag ever
reached any handler); edit mode reserving the first finger, mirroring how it already frees the left
mouse button; `utils/inputCapabilities.ts` replacing the viewport-width `isMobile` with pointer
capability queries; 44 px targets under `(pointer: coarse)`; and the shortcut sheet reachable without
a keyboard, with a touch-gesture section and honest labels.

## 9. Open / next

- **PR size.** #214 carries the 25-commit editor stack it sits on (that work is not on `dev` —
  `interactive_structure_editor.ts` does not exist there) plus ~20 commits of this work. If the
  editor stack lands separately first, this PR shrinks to just the UI work.
- **Still true from the status analysis:** `dist/` is tracked and produced half the merge conflict
  surface again; untracking it remains the right fix. It also means every commit here carries a
  rebuilt `dist/`.
- **`initRenderer`'s dead `style.width = "100%"` pair**, overwritten by the `setSize` two lines later.
  Harmless while resizes keep them in step, deliberately not changed blind — it governs what the
  canvas does if a resize is ever missed, and that deserves a visual check rather than a guess.
- **`sharp` via `looks-same`.** The retry in `19527bd` makes an upstream 503 cost a retry instead of a
  red build, but the dependency itself is the fragility. Replacing the visual comparator, or vendoring
  a prebuilt libvips into the test image, would remove it.
- **The axes overlay's appearance.** It renders as a dense full-width ruler grid, on screen and in
  exports alike. Faithful, and arguably not what anyone wants; never in scope here.
