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
| U-13 | `claude/uiux-p2-touch-support` | `52539cf` | touch + small screens |

Suite: **185 → 440 passing**, 30/30 suites, 0 failed. `tsc --noEmit` clean, `eslint src tests` 0 errors.
**Every U-n is now shipped.**

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
- **`U-13` sizes by pointer capability, never by viewport width.** The `isMobile` it replaces asked
  the wrong question in both directions. Sizing keys off `(pointer: coarse)`, documentation off
  whether touch exists at all, and both are read at call time — a window can be dragged to a
  touchscreen mid-session.
- **`U-13` is not a mobile port and should not grow into one.** The existing chrome was *measured* at
  390×844 and fits: no collisions, no clipping. The defects were gesture ownership, 32 px targets and
  labels naming keys the device lacks. A bottom sheet would have been a rewrite in search of a
  problem.

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

Nine defects in newly written code, which is the argument for keeping a real-browser pass in the
loop rather than trusting the suite alone:

1. The pill advertised `RMB = orbit` unconditionally while orbit starts disabled.
2. The keyboard sheet footer read "Ctrl is Ctrl on Windows and Linux and Cmd on macOS".
3. Fixing F1's vertical clipping introduced **horizontal** clipping — the Z field ran off the card.
4. Cause of (3): MUI's `InputBase` root carries `min-width: 75px` against a 57 px grid column, and
   `MuiClassNameSetup` renames MUI classes to `wave-Mui*`, so a `.MuiInputBase-root` selector never
   matches — it needs a class-substring selector.
5. Slider range marks overlapped their caption, because MUI positions mark labels absolutely.
6. The figure export's scale-bar label was set at `height/36`, about 5 pt at 300 dpi — under most
   journals' minimum type size. Only visible by looking at a rendered figure.
7. The shortcut sheet still promised "? or Esc to close" on a touch profile with neither, and had no
   visible way out at all (the exits were `?`, Escape, or knowing that the backdrop dismisses).
8. The touch gesture group rendered *last*, below three groups of keyboard shortcuts, on the one
   device where those gestures are the only way in — and the sheet is single-column there, so group
   order is scroll distance.
9. Probes that measured "the canvas" were measuring the 100×100 axes overlay, not the viewer.

Two pre-existing bugs also came out of verification rather than reading (both fixed): the
orthographic projection matrix never being updated after the frustum was fitted to the cell, and
`touch-action: auto` swallowing every touch drag. The first was caught by cross-checking the scale
bar against the camera's own projection over a known 2 Å separation — the kind of assertion that
catches a formula wrong by a constant factor, which nothing else in the suite would have.

## 7. Deployment

Netlify is live and confirmed. Site `mat3ra-mave`; PR #214's preview serves at
`https://deploy-preview-214--mat3ra-mave.netlify.app/` (HTTP 200, verified). The production URL 404s
because `netlify.toml` only exists on this chain, so no build has run for `dev` yet — expected, and it
resolves when this lands. Nothing appeared on commit `6850383` because the site was linked *after*
that push; Netlify builds on new pushes, so the first evidence arrives with the next commit.

## 8. Maintainer review pass over both branches

A read of the two open branches as a maintainer would read them, after the teammate feedback had been
addressed. Five findings, all implemented on both lines. What they have in common is that none is
visible in the suite as it stood — four are correctness-under-a-condition-nobody-tested, and the fifth
is a dependency direction.

1. **The GIF square only held until encoding started.** The size restore was in a `finally`, so the
   512×512 drawing buffer survived through gifshot's encode — seconds for 60 frames, all of them with
   the on-screen canvas stretching a square buffer across a wide viewer. The frames are captured
   before the encode begins, so the restore belongs immediately after the capture loop; the `finally`
   keeps a null-guarded copy for the throwing path. The test asserts the canvas dimensions *inside*
   the mocked `createGIFAsync`, which is the only place the distinction is observable.

2. **`useObservedWidth` shared one record across every observer.** The mutable record was declared
   outside the `[]`-dep `useCallback`, so it was module-level state: two mounted components measuring
   different containers wrote to the same object. Nothing in the app mounts two today, which is why
   the suite was quiet.

3. **Parameters were clamped on the way out but not on the way in.** The menu clamped typed input,
   and the slider pinned at its bounds — but a value arriving from a saved URL or a host's
   `initialViewSettings` went straight to the viewer. A radius of 3.0 rendered at 3.0 while the slider
   sat at 1.0, then snapped there on first touch. `clampParameterSettings` lives next to the ranges
   that define it, and the editor runs its initial settings through it. This became reachable *because*
   the range tightened to 0.1–1.0 on the teammate's feedback — the old 10× ceiling hid it.

4. **`getMaxFigureDimension()` ran every frame.** Three `gl.getParameter` calls — each a pipeline
   sync — to compute a bound only the export dialog reads. Gated on the dialog being open.

5. **`ModePill` imported its geometry from `SelectionInspector`.** An overlay depending on a sibling
   component for a width, so a change to the inspector silently moved the pill. The shared numbers are
   now in `chromeLayout.ts`, which both read from — including the inset that the pill uses to avoid
   the inspector and the inspector uses to size itself.

Verified on both lines before pushing: `npm run lint` (0 errors), `tsc --noEmit`, `npm run build`, and
the full suite — 461 tests on this line (#214), 431 on the U-12 line (#216), the difference being
U-13's two touch suites.

The port to #216 was a `cherry-pick -n`, not a file copy. #216 predates U-13, so its `ModePill.tsx`
and `ThreeDEditor.jsx` legitimately lack the coarse-pointer wording and the sheet menu entry;
overwriting those files with this branch's copies would have silently back-ported U-13 content into the
PR that is not supposed to contain it. The merge was verified by grepping the result for
`isCoarsePointer` and finding none.

## 9. Open / next

Every `U-n` is shipped. What remains is not this work:

- **PR size.** #214 carries the 25-commit editor stack it sits on (that work is not on `dev` —
  `interactive_structure_editor.ts` does not exist there) plus ~22 commits of this work. If the
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
