# Wave.js UI/UX — what to introduce next

| | |
|---|---|
| **Status** | All of P0, P1 and P2 shipped 2026-08-12 (§0.1). Every U-n is implemented. |
| **Date** | 2026-08-12 |
| **Scope** | The viewer's own chrome: toolbars, panels, feedback, discoverability. Not the interaction model (settled in the [editor spec](./interactive-editor-spec.md)), not rendering. |
| **Basis** | Read of `ThreeDEditor.jsx`, `IconsToolbar.tsx`, `ParametersMenu.tsx`, `SquareIconButton.tsx`, `settings.ts`, `main.css`; the editor spec's own R-register; the [status analysis](../codebase-status-2026-08.md). Prior art: VESTA, CrystalMaker, Avogadro 2, Blender, Figma. |
| **Numbering** | **U-n**, to avoid colliding with the spec's `D-n`/`R-n` and the status doc's `S-n`. |

**Mockups:** [viewer chrome](./assets/uiux-viewer-chrome.svg) · [inspector panel](./assets/uiux-inspector-panel.svg) · [mode affordances](./assets/uiux-mode-affordances.svg) · [keyboard sheet](./assets/uiux-shortcut-sheet.svg) · [parameters & camera](./assets/uiux-parameters-and-camera.svg)

---

## 0. The short version

The editor spec fixed *what happens when you click*. Almost nothing has yet been spent on *knowing what will happen before you click*, or *seeing what happened after*. Concretely:

- Nothing on screen says what structure you are looking at — no formula, no atom count, no lattice, no units.
- Nothing says which mode you are in. Arming a measurement leaves no trace after the menu closes, and edit mode silently moves orbit-rotate to the right mouse button.
- Ten of the twenty-one keyboard and pointer bindings appear in no tooltip and no menu, including every selection modifier and undo.
- The one panel that does show data is 84 px wide and about 600 px tall, so in a short viewer its coordinate fields are simply cut off.

The three highest-value additions are a **status bar**, a **mode pill**, and a **keyboard sheet**. None of them touch the interaction model, the material, or the render loop; all three are new read-only surfaces over state the component already holds. That is the P0 slice, and it is small.

---

## 0.1 What shipped

All thirteen proposals are implemented as a branch chain off this document's branch, one branch per item, opened as a single PR ([#214](https://github.com/mat3ra/wave.js/pull/214)) intended to squash-land:

| # | Branch | Commit | Tests |
|---|---|---|---|
| U-1 | `claude/uiux-p0-status-bar` | `667b4e6` | 19 |
| U-2 | `claude/uiux-p0-mode-pill` | `6591930` | 22 |
| U-3 | `claude/uiux-p0-keyboard-sheet` | `10cb287` | 21 |
| U-4 | `claude/uiux-p0-view-switches` | `0bc1f91`, `5d7ddc4` | 8 |
| U-5 | `claude/uiux-p0-viewer-states` | `eef4704` | 11 |
| U-6 | `claude/uiux-p1-inspector-split` | `f26ef8d` | 20 |
| U-9 | `claude/uiux-p1-undo-reachable` | `16a986e` | 13 |
| U-10 | `claude/uiux-p1-camera-presets` | `f628e8f` | 10 |
| U-11 | `claude/uiux-p1-focus-visibility` | `da8f03d` | 6 |
| U-7 | `claude/uiux-p1-quick-toggles` | `319447c` | 8 |
| U-8 | `claude/uiux-p1-parameters` | `7972622` | 15 |
| U-12 | `claude/uiux-p2-figure-export` | `e4fb816` | 70 |
| U-13 | `claude/uiux-p2-touch-support` | `52539cf` | 32 |

`tsc --noEmit` and `npm run lint` are clean on the tip, and the whole suite passes: **461 passing**,
32 suites, up from 185 at the branch point. The 17 visual-snapshot failures that were red throughout
this work were never caused by it — reproduced exactly on the branch point — and were fixed by
regenerating the baselines the van der Waals radii fix (`7e3541f`) had invalidated (`5882636`, and
§0.2). Every surface was also driven in Chromium against the **production bundle**, not just the dev
server, on a desktop viewport and on a 390×844 touch profile.

### P2's scope question, answered

Both P2 items were held on one question: where does wave.js stop and the host app begin? The answer
each item reached, for the record:

- **U-12 belongs in wave.js.** A figure export needs the scene graph, the camera frustum and the
  renderer's clear state; a host has none of those and could only screenshot the canvas, which is
  precisely the thing that does not work. The *file* is the host's business, and stays there — this
  hands off a data URL through the same downloader the existing screenshot uses.
- **U-13 is not a mobile port.** It is the removal of a half-measure. The viewer did not need a
  bottom sheet or a rebuilt layout; at 390 px the existing chrome already fits (measured). What it
  needed was to stop losing every touch gesture to the browser, to size its controls for a finger,
  and to stop naming inputs the device does not have. No new layout, no viewport-width branching.

**Where the implementation deviates from this document**, and why:

1. **U-5 uses an inline card, not `AlertDialog`.** A render failure is not a decision the user has
   to make, and a modal would cover the toolbar needed to recover. `AlertDialog` and `ModalDialog`
   remain unused; they should be deleted or moved to cove rather than given a contrived caller.
2. **The status bar is hidden while the viewer is not interactive**, so "at all times" in U-1 means
   "whenever the viewer is on". The power toggle is an explicit off state; adding chrome to it
   would contradict that.
3. **U-2's pill does not claim `RMB = orbit` unconditionally.** Orbit controls start disabled
   (`initOrbitControls(enabled = false)`, confirmed by dragging the live app), so while orbit is
   off the pill names the key that enables it instead of a gesture that does nothing.
4. **U-3 dropped the mockup's "advertised nowhere" markers.** They were a device for arguing the
   case here; as code they would be a claim about other UI with nothing keeping them true.
5. **U-6's units toggle changes the display, not the material.** Editing is enabled only in the
   material's own units, with the fields read-only and an explanation otherwise. Converting a whole
   point back on commit is a riskier change than switching a display and belongs in its own slice
   with round-trip tests.
6. **U-8 ships no live bond count**, though the mockup showed one. Bonds are computed
   asynchronously; printing a number that had not been computed would be the same false-claim
   problem the rest of this work removes. The caption explains what the factor multiplies instead.
7. **U-11 is partial by design.** It covers the buttons this package styles. MUI's own text fields
   and toggle buttons signal focus through border and background changes rather than an outline, and
   are left to MUI. Keyboard *canvas* selection stays out of scope, with the roadmap's arrow-key
   nudging and its unresolved axis-frame decision (D-6).
8. **U-2 needed no new mixin callback.** The measurement managers already push `getSettings()`
   through `updateState` on every click; two facts were added to that payload
   (`selectedAtomsCount`, `atomsPerMeasurement`) instead of adding a channel.
9. **U-12 keeps the old one-click Screenshot alongside the dialog.** Capturing exactly what is on
   screen is still the common case and should not pay for a dialog. Figure export is the separate,
   publication case. Its scale bar is exact only under the orthographic camera, and the dialog says
   so rather than presenting a perspective approximation as a measurement.
10. **U-13 sizes by pointer, not by viewport.** The `isMobile` it replaces asked the wrong question:
    a narrow desktop window is not touch input, and a touch laptop is touch input at full width.
    Sizing keys off `(pointer: coarse)`; the gesture documentation keys off whether touch exists at
    all, so a touch laptop gets the gestures listed and keeps its compact chrome. No bottom sheet was
    needed — the existing layout was measured at 390 px and fits.

Recorded so they are not re-investigated: the View menu reporting *Rotate/Zoom* as off at startup
is correct, not rough edge R7's desync — orbit really is off until toggled
(`initOrbitControls(enabled = false)`, confirmed by dragging the live app). **F1 is now fixed** and
measured: at 1100×520, the viewport that used to clip, the inspector occupies 12–196 px and the tool
strip 12–380 px against a status bar at 486 px, with no field overflowing its card.

Three layout bugs were found by measuring the live DOM rather than by eye, all in code added here:
a clipped third coordinate field, MUI's `InputBase` 75 px `min-width` overriding its grid column,
and slider mark labels overlapping a caption. None were visible in jsdom.

**Pre-existing bugs the P2 work surfaced**, fixed with it because each was load-bearing for the
feature that found it:

- `setOrthographicCameraFrustum` never called `updateProjectionMatrix`, so from construction until
  the first resize the orthographic camera projected the initial ±10 frustum from `initCameras`
  rather than the cell-fitted one. Invisible in a browser, where `ResizeObserver` fires immediately
  and `handleResize` repairs it; fatal for a scale bar that reads those frustum fields. Found by
  cross-checking the reported scale against the camera's own projection over a known 2 Å separation —
  an assertion every other test would have passed with the formula off by a factor of two.
- The canvas had `touch-action: auto`, so no touch drag ever reached any of the pointer handlers.
- The `style.width = "100%"` pair in `initRenderer` is dead: the `setSize` call two lines later
  overwrites both with pixel values. Harmless today because `handleResize` keeps them in step, and
  left alone rather than "fixed" blind — it decides how the canvas behaves if a resize is ever
  missed, which deserves its own visual check.

## 1. What the UI is today

| Surface | Where | Contents |
|---|---|---|
| Menu strip, top-left | `IconsToolbar.tsx` | Power/interactive toggle, then View · Parameters · Measurements · Export, plus Edit when `editable` |
| View menu | `getViewSettingsActions()` | 9 toggles + Reset View, each with a ✓ whose *colour* carries the on/off state |
| Parameters menu | `ParametersMenu.tsx` | 5 bare number inputs: atomic radius, repetitions A/B/C, connectivity factor |
| Measurements menu | `getMeasurementsActions()` | Distance · Angle · Copy-coordinates modes, delete connection, reset |
| Export menu | `getExportActions()` | GIF · Screenshot · Download (JSON, POSCAR) |
| Edit panel, top-right | `renderEditToolbar()` | Translate/Rotate · Add/Clone/Delete · Focus · Undo/Redo, then Element + X/Y/Z fields |
| Interaction cover | `renderCoverDiv()` | Transparent div that blocks input when not interactive |

That is the whole of it. There is no status bar, no legend, no empty state, no loading state, no error state, no help.

## 2. Findings

Each verified against the source, not inferred.

| # | Where | Finding |
|---|---|---|
| F1 | `ThreeDEditor.jsx:1291-1452` | The edit panel is one column of fixed width `84px` carrying 8 icon buttons (48 px each) plus 4 text fields — roughly 600 px tall. In any viewer shorter than that the coordinate fields are clipped, and the `Paper` has no scroll. |
| F2 | `ThreeDEditor.jsx:969-974` | `getCheckmark(false)` renders a **grey checkmark** for every inactive View item. A grey ✓ reads as "checked but disabled", not "off". |
| F3 | `IconsToolbar.tsx:58-73`, `settings.ts:161` | `toggleInteractive: "i"` is bound but its tooltip is just `"Interactive"` — the key appears nowhere in the UI. |
| F4 | spec §3f, `interactive_structure_editor.ts` | Entering edit mode remaps orbit-rotate to the right mouse button. Nothing in the UI mentions it; the user discovers it by finding that dragging no longer orbits. |
| F5 | `getMeasurementsActions()`, `measurements/base.ts:212` | A measurement mode is armed from a dropdown that then closes, leaving no persistent indicator, and its result is only a 3D sprite plus an unannounced `navigator.clipboard.writeText`. |
| F6 | `ThreeDEditor.jsx:252-255`, `:1468` | Undo/redo buttons render only inside the edit panel, and `Ctrl/Cmd+Z` early-returns unless `isEditModeActive`. Leaving edit mode does *not* clear `historyStack` — the history survives but becomes unreachable. |
| F7 | `ParametersMenu.tsx` | Five bare number inputs. Ranges exist only as `inputProps` (invisible), there is no reset, and nothing says what a value will cost — a `4×4×4` repetition on a 24-atom cell draws 1,536 atoms with no warning. |
| F8 | `AlertDialog.jsx`, `ModalDialog.jsx`, `LoadingIndicator.jsx` | **Zero call sites for all three.** There is no empty, loading, or error state; combined with `reloadViewer`'s swallow-and-`console.warn` (status doc S-1), a failed render is an unexplained blank canvas. |
| F9 | `SquareIconButton.tsx:38-40` | `disableFocusRipple` with no `focus-visible` replacement, so keyboard focus is invisible. The only accessibility affordance in the package is `aria-label`; there is no live region, and the canvas cannot be reached by keyboard at all. |
| F10 | — | No formula, atom count, lattice parameters, or units are displayed anywhere. The units string appears only as a caption inside the edit panel, and only while exactly one atom is selected. |
| F11 | `settings.ts:elementColors`, `atoms.ts` | Colour and (since the vdW fix) radius both encode element identity, with no key. Element labels are the only alternative: text on every atom, all or nothing. |
| F12 | `handleResetViewer()` | The only camera command is Reset View. No axis-aligned views, though `focusCameraOnSelection` and `adjustCamerasTargetAndFrustum` already do the hard part. |
| F13 | `index.html`, `IconsToolbar.tsx:36` | `isMobile` is computed and forwarded to `NestedDropdown`, and nothing else adapts: a 44 px strip pinned over the structure, pointer-only interaction, `user-scalable=no`. |
| F14 | `settings.ts:backgroundColor`, `getExportActions()` | Screenshot captures the live canvas, so every exported image bakes in `#202020` at whatever the current canvas size happens to be. No control over background, resolution, or chrome. |

## 3. Proposals

Effort is rough developer-days for one person including tests. "Decision" flags proposals that need a call from a maintainer before implementation.

### P0 — read-only surfaces over state we already have — **shipped**, see §0.1

| # | Proposal | Fixes | Effort | Mockup |
|---|---|---|---|---|
| **U-1** | **Status bar** along the bottom of the canvas. Left: formula, atom count, lattice type and parameter, basis units. Middle: per-element chips (swatch + symbol + count) drawn from `settings.elementColors`. Right: live selection summary and the latest measurement result. | F5, F10, F11 | 1.5 | [chrome](./assets/uiux-viewer-chrome.svg) |
| **U-2** | **Mode pill**, top-centre, one per active mode, naming the mode and its non-obvious bindings, with a ✕ that exits. Edit: `drag = move · RMB = orbit · Del = remove · Esc = deselect`. Measurements: how many picks remain and that the result is copied. | F4, F5 | 1 | [modes](./assets/uiux-mode-affordances.svg) |
| **U-3** | **Keyboard sheet** on `?`, rendered from `settings.hotKeysConfig` plus the hard-coded editor keys moved into it, grouped View / Select & Edit / Measure, marking every binding that has no other UI. | F3 | 1 | [sheet](./assets/uiux-shortcut-sheet.svg) |
| **U-4** | **Switches instead of coloured checkmarks** in the View menu, with the hotkey as a keycap chip in a fixed slot rather than spelled inside the label. | F2, F3 | 0.5 | [modes](./assets/uiux-mode-affordances.svg) |
| **U-5** | **Wire the three dead components.** `LoadingIndicator` during the first structure build; `AlertDialog` for a render failure, with the reason and a Retry; a plain empty state when there is no material. Pairs with narrowing `reloadViewer`'s catch (S-1) — right now the UI cannot report what that catch hides. | F8 | 1 | — |

U-1 also gives accessibility a foothold for free: it is the natural `aria-live="polite"` region, so selection and measurement changes become announceable without inventing a new surface (part of U-11).

### P1 — restructuring existing surfaces

| # | Proposal | Fixes | Effort | Mockup |
|---|---|---|---|---|
| **U-6** | **Split the edit panel.** Icons stay a vertical strip in the same language as the left menu; per-selection data moves into a wider inspector card with legible fields, a display-only crystal/cartesian toggle, a bond/neighbour readout, and a real empty state that teaches the selection modifiers. | F1, F10 | 2.5 | [inspector](./assets/uiux-inspector-panel.svg) |
| **U-7** | **Quick-toggle row** for the highest-frequency View items (bonds, element labels, coordinate labels, axes, orthographic), so the common case stops being a four-click round trip through a menu that closes. | F2 | 1 | [chrome](./assets/uiux-viewer-chrome.svg) |
| **U-8** | **Parameters panel rework.** Sliders with visible ranges for radius and bond cutoff, each paired with a numeric box; a linked A=B=C toggle for repetitions; per-row and global reset; a live consequence line ("2 × 2 × 2 → 192 atoms drawn", "32 bonds at this cutoff"). Keep the menu open while adjusting. | F7 | 1.5 | [parameters](./assets/uiux-parameters-and-camera.svg) |
| **U-9** | **Undo reachable outside edit mode.** Render undo/redo whenever the history is non-empty and drop the `isEditModeActive` gate on `Ctrl/Cmd+Z`, so the surviving history stops being unreachable. Add a transient "Moved Si #12 · ⌘Z to undo" hint driven by `onEditCommit`'s existing `{source}` enum — no new plumbing. | F6 | 1 | — |
| **U-10** | **Camera presets** — view down a, b, c, [111], next to Fit and the existing orthographic toggle. Prior art in VESTA and CrystalMaker; with orthographic on, an axis view makes a screen drag an exact two-axis move (spec §3a). | F12 | 1 | [parameters](./assets/uiux-parameters-and-camera.svg) |
| **U-11** | **Accessibility pass, scoped.** Restore a visible focus ring (replace `disableFocusRipple` with a `focus-visible` style), make the inspector fully keyboard-operable, and mark the status bar as a live region. Keyboard *canvas* selection — cycling atoms with the arrow keys — is deliberately out of this slice; it belongs with the roadmap's arrow-key nudging (spec §3h, decision D-6). | F9 | 1.5 | — |

### P2 — decided and shipped (see §0.1)

| # | Proposal | Decision reached | Effort |
|---|---|---|---|
| **U-12** | **Figure export.** A small dialog for the publication case: white or transparent background, fixed pixel size independent of the on-screen canvas, chrome excluded, optionally a scale bar. Today every screenshot bakes in the dark theme at whatever size the canvas happens to be. | **wave.js owns it.** The render needs the scene graph, camera frustum and renderer clear state; a host has none of those and can only screenshot the canvas — the thing that does not work. The file handoff stays with the host. | 2.5 |
| **U-13** | **Touch and small-screen support.** Either adapt properly — bottom sheet instead of a pinned strip, larger hit targets, a documented touch gesture set — or state that the viewer is desktop-only and stop half-computing `isMobile`. | **Adapt, but not as a port.** The layout already fits at 390 px (measured); what was missing was gesture ownership, finger-sized targets and honest labels. No bottom sheet, no viewport-width branching, `isMobile` replaced by pointer capability. | 1.5 |

## 4. Suggested order

1. **U-1, U-2, U-3** first. They address the largest gap (nothing tells you what you are looking at or what mode you are in) at the lowest risk, since all three are read-only views of existing state. Roughly one week together.
2. **U-4, U-5** as drive-by fixes alongside — half a day each, and U-5 unblocks the S-1 cleanup.
3. **U-6, U-7** next: this is the real restructuring, and F1 is a functional defect, not a matter of taste.
4. **U-8, U-9, U-10, U-11** in any order; independent of each other.
5. **U-12, U-13** only once their decisions are made. *(Both decided and shipped — §0.1. Each turned
   out to answer its own scope question once the code was in front of it, which is worth remembering
   the next time a slice is held for a decision that only the implementation can inform.)*

Ordering caveat: U-6 rewrites the block the status doc already wants extracted (item 11 — `ThreeDEditor.jsx` → `.tsx`, with `EditToolbar` split out of the ~250-line render). Doing U-6 as part of that extraction rather than before it avoids paying for the same surgery twice.

## 5. Questions for review

1. **Is the status bar acceptable as permanent chrome?** It costs ~40 px of canvas height. The alternative is a corner overlay that appears on hover, which is less discoverable but takes no space. Recommendation: permanent, collapsible.
2. ~~**U-12 and U-13 both hinge on the same scope question**~~ — **answered**; see the P2 table in §3 and §0.1. Figure export needs renderer internals a host cannot reach, so it lives here; touch support turned out not to be a mobile port at all, so the question of "is mobile in scope" dissolved into "stop half-doing it".
3. **Should the element chips be interactive** (click to select every atom of that element) or purely a legend? Interactive composes cleanly with the existing multi-select and costs little, but it puts a selection control in a status bar, which is unusual.
4. **U-9 relaxes a deliberate guard.** `Ctrl/Cmd+Z` is currently edit-mode-only. Ungating it means the viewer swallows a key that an embedding host might want for its own undo — the ref API in spec §6.3 exists precisely so hosts can drive our stack instead. Worth confirming against materials-designer's expectations before changing.

## 6. Explicitly out of scope

- **The interaction model.** Snapping, arrow-key nudging, double-click-to-select-fragment and the rest stay where the spec put them (§11, decisions D-5 through D-7). This document proposes no new interactions except U-10's camera presets.
- **Theming and light mode.** The viewer is deliberately dark (`DarkMaterialUITheme`, `backgroundColor: "#202020"`). U-12 handles the one case that genuinely needs a light background — figure export — without making the whole component themeable.
- **A history panel.** Ruled out with the old editor and still ruled out (spec §11).
- **Anything requiring React 18.** Every proposal here works on React 17, so none of it is blocked behind the enzyme migration.
