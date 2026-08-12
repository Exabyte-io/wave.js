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

Suite: **185 → 340 passing**, 25/25 suites, 0 failed. `tsc --noEmit` clean, `eslint src tests` 0 errors.

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

## 3. Confirmed *not* defects — do not re-investigate

- **View menu shows *Rotate/Zoom* off at startup.** Correct, not rough edge R7's desync: orbit
  genuinely is off until toggled (`initOrbitControls(enabled = false)`), confirmed by dragging the
  live app and observing no camera change. The old grey checkmark said the same thing; the switch
  just makes it legible enough to notice.
- **MUI text fields and toggle buttons "without a focus indicator".** A crude outline/box-shadow
  probe reports those as unindicated; they signal focus through border and background instead. False
  negative, not a finding.

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

Five defects in newly written code, which is the argument for keeping a real-browser pass in the
loop rather than trusting the suite alone:

1. The pill advertised `RMB = orbit` unconditionally while orbit starts disabled.
2. The keyboard sheet footer read "Ctrl is Ctrl on Windows and Linux and Cmd on macOS".
3. Fixing F1's vertical clipping introduced **horizontal** clipping — the Z field ran off the card.
4. Cause of (3): MUI's `InputBase` root carries `min-width: 75px` against a 57 px grid column, and
   `MuiClassNameSetup` renames MUI classes to `wave-Mui*`, so a `.MuiInputBase-root` selector never
   matches — it needs a class-substring selector.
5. Slider range marks overlapped their caption, because MUI positions mark labels absolutely.

## 7. Open / next

- **`U-12` figure export** — the publication case: white or transparent background, fixed output
  resolution independent of the on-screen canvas, chrome excluded.
- **`U-13` touch and small screens** — needs the scope call below.
- **The scope question** both P2 items hinge on: where does wave.js stop and the host app begin?
  Decision D-2 answered it for multi-material editing. For mobile specifically the proposal's
  position is that half-support is the worst of the three options, and `isMobile` is currently
  half-computed (`IconsToolbar.tsx` computes it and forwards it to one dropdown; nothing else
  adapts).
- **PR size.** #214 carries the 25-commit editor stack it sits on (that work is not on `dev` —
  `interactive_structure_editor.ts` does not exist there) plus ~18 commits of this work. If the
  editor stack lands separately first, this PR shrinks to just the UI work.
- **Still true from the status analysis:** `dist/` is tracked and produced half the merge conflict
  surface again; untracking it remains the right fix.
