# Dossier: Wave.js In-Viewer 3D Crystal-Structure Editor

Consolidated from four research reports: old-editor archaeology, current-editor inventory, host-app contract, prior-art interaction models, and test pathways. All file references are to `/Users/timur/Code/wave` (branch `feat/upgrade-2026-07-11-separated`) unless noted. Recommendations are marked **[REC]**; genuinely contested items are deferred to Section 6.

---

## 1. Feature landscape

### 1.1 Comparison table

| Capability | Old editor (`ThreejsEditorModal` + `@mat3ra/threejs-editor`) | Current in-viewer editor | Gap status |
|---|---|---|---|
| Enter/exit editing | Fullscreen modal replacing viewer; toolbar "3D Edit" + hotkey | In-viewer edit mode toggle; toolbar "Edit [E]" (hotkey dead — D2) | Improved shape; hotkey broken |
| Select atom | Click (raycast); outline `Box3Helper` | Click (<5 px threshold); faint emissive `0x333333` highlight + gizmo | Present; highlight nearly invisible |
| Multi-select / rubber-band | Yes — Mat3ra custom `MultipleSelectionControls` (`M` key, marquee, pivot group at centroid, Submit/Cancel, unsubmitted-exit guard) | **None** | **Lost** |
| Group transform (translate/rotate/scale N atoms about centroid) | Yes, with undoable submit | **None** | **Lost** |
| Translate atom | Gizmo drag + typed world X/Y/Z | Gizmo drag, free camera-plane drag, typed coordinates | Present |
| Rotate / scale modes | Yes (single objects and groups), local/world toggle | Rotate button exists but is a **structural no-op** (D4); no scale; no local/world | **Lost** (rotate only meaningful for groups anyway) |
| Add atom | Clone existing (keeps element) or add sphere + rename | Hardcoded `"Si"` at `(ax/2, by/2, cz/2)` — wrong center for non-orthogonal cells, stacks duplicates (D22) | **Degraded** — no element choice, no click-to-place, no duplicate |
| Change element | Rename object (`name.split("-")[0]`) | **None** | **Lost** |
| Delete atom | `Delete`/`Backspace` + menu, undoable | Toolbar trash button only; no key | Degraded (mouse-only) |
| Typed coordinates | World/cartesian only | Cartesian **or crystal** units (new capability the old editor lacked) | **Improved** — but 1 history entry + full rebuild per keystroke (D18) |
| Undo/redo | Full command pattern (26 command classes), Ctrl/Cmd+Z(+Shift), History sidebar with click-to-jump, optional persistence | Full-material-clone stack in React state; buttons only, no Ctrl+Z; wiped by any parent re-render (D16) | **Degraded** |
| Edit lattice/cell | Implicit — transform the cell object, lattice re-derived on exit | None (lattice round-trips lossily through extraction, causing D1) | Lost (arguably out of scope; see Section 6 #8) |
| Camera focus on selection (`F`/double-click) | Yes | None | Lost |
| Outliner / scene tree | Yes | None (out of scope for structure editing) | Intentionally dropped |
| Import (25+ formats incl. `xyz`) / Export (OBJ/STL/GLTF/PLY/USDZ/JSON…) | Yes | Viewer's own download button — but exports **pre-edit** material (D8) | Lost + defective |
| Multi-material editing | Yes (`materials` array prop; merge workflow, +2 Å X offset per extra material) | **None** — single `material` | **Lost**, breaks materials-designer (Section 2) |
| Configurable shortcuts | Yes (Settings sidebar, localStorage) | Fixed viewer hotkeys; no edit-mode keys at all | Lost |
| Exit guards / transactionality | Unsubmitted-group 3-way dialog; extraction-failure fallback returning original material | None — edits commit immediately per action | **Lost** (see Section 2, cancel/commit) |
| Generic 3D authoring (primitives, lights, materials editor, scripting, player, VR, publish) | Yes | None | Intentionally dropped — out of scope |

### 1.2 Prose summary

The old editor was a forked three.js r140 editor: enormously capable but generic, with structure semantics bolted on by convention (atoms = named sphere meshes; the material re-derived from the scene only at exit). Its genuinely structure-relevant capabilities were: **rubber-band multi-select with centroid group transforms and submit/cancel semantics** (the one substantial custom Mat3ra feature), clone/rename-based element control, a real command-pattern undo with a history UI, camera focus, multi-material merge editing, and batch (exit-time) commit with guard dialogs.

The new in-viewer editor inverts the model: edits are incremental, each pointer-up extracts a fresh `Made.Material` from the live scene and streams it out. It adds two things the old editor never had — **crystal-coordinate typed editing** and per-edit host notification — but currently lacks multi-select, element choice, rotate/scale semantics, keyboard access to editing, and any transactional cancel. The extraction-from-scene approach it inherited (`ThreeDSceneDataToMaterial`) is also the root cause of the worst defect cluster in Section 4 (D1, D5, D6, D7): it was designed for exit-time conversion of a clean dedicated scene, and is now run per-edit against a scene shared with bonds, boundaries, repetition clones, and measurements.

**[REC]** The spec should treat the "gap list" for parity as: multi-select + group translate/rotate, element picker (add + change-in-place), clone atom, undo hotkeys + history robustness, camera focus on selection, and a decision on multi-material (Section 6 #2). The generic three.js-editor features (primitives, lights, scripting, exports to mesh formats) should be explicitly declared out of scope. Extraction should move from "re-derive everything from scene meshes" to "apply the known delta to the known material" — this dissolves D1/D5/D6/D7/D9 as a class rather than patching them individually.

---

## 2. Host-app integration requirements

### 2.1 Old contract (pre-`751a7e3`, published as `@exabyte-io/wave.js@2026.6.30-0`)

- Exports: `ThreeDEditor`, `ThreejsEditorModal`, `parseViewSettingsFromUrlParams`, `serializeViewSettingsToUrlParams`.
- `ThreejsEditorModal` props: `materials: Made.Material[]` (array — multi-material), `show` (host-controlled), `onHide(material)` — the **single return channel**: one reconstructed material on normal exit, the original materials on forced exit after extraction error. **Batch/transactional model: materials in as prop, one material out at exit, host owns visibility.**
- `ThreeDEditor.onUpdate(material)` fired **once per editing session** (on modal exit), with lattice `type` re-stamped from the original.

### 2.2 How materials-designer (the known host) consumes it

Repo `mat3ra/materials-designer` (branch `dev`), pinned to `"@exabyte-io/wave.js": "2026.6.30-0"` — pre-break.

1. **Embedded pane** — `ThreeDEditorFullscreen extends ThreeDEditor` (`src/components/3d_editor/ThreeDEditorFullscreen.jsx`), instantiated in `src/MaterialsDesigner.jsx` with `editable`, single `material`, `onUpdate` → re-wraps as `MDMaterial.fromMadeMaterial(material, metadata)` (metadata is **not** round-tripped through wave; the host re-attaches it) → dispatches into MD's redux undo/redo. Relies on synthetic `window.dispatchEvent(new Event("resize"))` for pane relayout.
2. **"Multi-Material 3D Editor" menu item** — `HeaderMenuToolbar.jsx` renders `ThreejsEditorModal` with the **entire materials collection**; result comes back via `onHide` and is **added** (`onAdd`) as a new material, not replacing.

### 2.3 New surface today and the migration gaps

Exports now: `ThreeDEditor` + the two URL-param helpers. `ThreejsEditorModal` deleted. `ThreeDEditor` props keep the same names (`material` singular, `editable`, `onUpdate`, `boundaryConditions`, `isConventionalCellShown`, `isStandalone`, `initialViewSettings`) but semantics changed:

| # | Migration gap | Impact on materials-designer |
|---|---|---|
| 1 | `ThreejsEditorModal` export deleted | Hard import break in `HeaderMenuToolbar.jsx`; "Multi-Material 3D Editor" has no replacement |
| 2 | Multi-material editing lost | MD's merge-and-`onAdd` workflow has no equivalent |
| 3 | `onUpdate` cadence: once-per-session → per-drag/per-keystroke/per-undo | Floods MD's redux undo history with micro-edits; two competing undo systems (wave internal stack vs MD header Undo) |
| 4 | Echo loop: every `onUpdate` the host stores and re-renders triggers `UNSAFE_componentWillReceiveProps`, which **resets wave's history and selection** (D16) | Editing state destroyed mid-session in any normal Redux host unless it identity-guards props |
| 5 | No cancel/commit semantics | Modal's exit-without-save transactionality gone; hosts wanting "Cancel" must snapshot externally |
| 6 | `onSelectionChanged` exists internally but is not a public prop | MD's `EditorSelectionInfo` footer (currently a placeholder) has no data source |

Also present: an unauthenticated `window.postMessage` bridge (`handleMessage`) that reflectively invokes **any** component method — simultaneously the de-facto iframe API and an injection surface (D17).

### 2.4 Required contract for the spec **[REC — from host-app report, endorsed]**

**State model.** Document `ThreeDEditor` as *uncontrolled with controlled reset*: internal edit/undo state keyed by material identity; a new `material` prop resets state **only** if its id/hash differs from the last material the editor itself emitted. This is the fix for gap #4 and must be spec'd precisely.

**Props (input).** Keep `material` (singular, required), `editable`, `boundaryConditions`, `isConventionalCellShown`, `initialViewSettings`, `isStandalone`. Add `editSessionOptions` (default add-atom element, snap settings). Multi-material: decision required (Section 6 #2).

**Callbacks (output) — tiered event model.**
- `onUpdate(material)` — committed changes only, cadence documented; and/or a richer `onEditCommit(material, {source: "drag"|"coordinate-input"|"add"|"remove"|"undo"|"redo"})` so hosts can build history without double-recording.
- `onSelectionChanged(atomIndexOrNull)` — promoted to public prop.
- `onEditModeChanged(isActive)` — new, lets hosts disable conflicting UI.
- Optional transactional pair: `onEditSessionStart(material)` / `onEditSessionEnd(finalMaterial | null)` (null = cancelled) — restores the modal's commit-or-discard guarantee.

**Undo/redo ownership.** One owner. **[REC]** wave owns intra-session undo/redo; the host records only commits/session-ends. Expose imperative `undo()/redo()/canUndo()/canRedo()` (ref API) for host toolbar wiring.

**Environment.** Replace `window`-resize reliance with `ResizeObserver` on the container. Scope hotkeys to the component container or focus-gate them (multiple instances currently conflict; D14). Either allowlist the `postMessage` bridge (with origin check) or remove it. Document round-tripping guarantees: `lattice.type` preserved (currently explicit), basis `units` preserved (currently **not** — D7), material metadata **not** preserved (hosts re-wrap).

---

## 3. Interaction-model recommendations

Per-question defaults from the prior-art survey (Avogadro2, VESTA, CrystalMaker, Materials Studio, Jmol, three.js editor/TransformControls, Blender, Unity, Unreal, Figma). Items needing a product decision are cross-referenced to Section 6.

**(a) Drag plane.** Unanimous prior art: unconstrained free drag = **camera-facing (screen-parallel) plane, depth held constant** (Avogadro, Blender `G`, three.js free handle); precise 3D placement via gizmo axis/plane handles or numeric entry. Never infer depth from a 2D drag. The current implementation already does this correctly. Orthographic camera makes screen-parallel drag especially well-behaved — lean on ortho views for 2-axis placement.

**(b) Click vs. drag threshold.** **4–5 px** (Windows default 4 px; Blender configurable; current code uses 5 px — keep). Below threshold at pointer-up = click/select; at/above = drag. No dwell delay. Optionally expose as an advanced preference for trackpad users.

**(c) Esc cancel / revert.** Blender is the gold standard: `Esc`/RMB mid-drag reverts to the pre-drag transform and pushes **no** history entry; release/Enter commits. `TransformControls` provides **none of this** — it must be built (snapshot on mouseDown, restore on Esc, suppress the history push). **[REC]** High-value, low-cost; do not ship without it. Directly fixes D10.

**(d) Hover affordances.** Highlight the atom under the cursor pre-click (emissive boost or outline), rely on TransformControls' built-in handle hover-highlight, change CSS cursor to *move* over draggable atoms/handles and *crosshair* in add-atom mode. Currently absent (rough edge R2); measurement mode already sets a precedent in this codebase.

**(e) Snapping + modifiers.** Dominant 3D convention: **hold `Ctrl`/`Cmd` = increment snap** during transform (Blender, Unity); three.js's `Shift` default is the outlier — override it so `Shift` stays reserved for additive selection. `Ctrl+Shift` = fine snap. Provide a persistent magnet toggle in the toolbar too. Domain snap targets: **lattice sites, fractional-coordinate grid, snap-to-atom** (Avogadro's drag-onto-existing-atom merge/bond precedent). Default granularity is contested → Section 6 #5.

**(f) Multi-select + group transforms.** Universal conventions: `click` = replace, `Shift+click` = add, `Ctrl/Cmd+click` = toggle, **click-drag on empty space = rubber-band box**. Add `double-click` = select bonded fragment (Avogadro/VESTA precedent). Group transforms act rigidly about the selection centroid — matching the old editor's pivot-group behavior, but **[REC]** without its submit/cancel two-phase model: prior art commits group transforms directly with normal undo, which is simpler and matches the new incremental architecture. Note: rubber-band drag on empty space conflicts with "drag empty space = orbit" — mode/modifier resolution is a design decision (Section 6 #4).

**(g) Undo granularity.** Confirmed firm norm: **one undo step per completed drag** (three.js editor uses mergeable commands; Blender/Unity/Unreal all one-step). Snapshot at pointer-down, commit one entry at pointer-up; a cancelled drag pushes nothing. Coordinate typing must also be debounced/merged into one entry per field-edit session (fixes D18-iii). Never push per-move or per-keystroke.

**(h) Keyboard nudging.** No dominant 3D convention (Blender/Unity/Unreal have none; arrow-nudge is a 2D idiom). **[REC]** Hybrid: arrow keys nudge the selection in the screen plane by a small step, `Shift+arrow` big step (Figma-style, configurable), plus the coordinate inspector for exact placement, plus (optionally) Blender-style axis-then-number entry. Screen-space vs. crystal-axis nudging is contested → Section 6 #6.

**Cross-cutting stack note.** `TransformControls` supplies: gizmo, per-handle drag planes, `translationSnap/rotationSnap/scaleSnap`, `space` world/local, handle hover-highlight, `dragging-changed`/`objectChange` events. It does **not** supply: Esc-cancel, undo integration, snap-to-atom/lattice, rubber-band multi-select, keyboard nudging. Those five are the custom layer the spec must define; each has clear prior art to copy.

---

## 4. Defect & rough-edge register

Severity: **Crit** = data corruption/crash/security; **High** = core workflow broken or badly misleading; **Med** = friction/waste; **Low** = polish. Status: ✅ confirmed live; 📖 found by code reading (plausible-to-near-certain, not live-verified).

### Defects (D# = current-editor report C#)

| # | St | Sev | Defect | Fix direction |
|---|---|---|---|---|
| D1 | ✅ | High | Camera snaps to default framing after **every** edit/undo/redo: lossy lattice float round-trip through `extractLatticeFromScene` defeats `shouldViewerAdjust`'s exact `JSON.stringify` compare; not gated by `bypassReloadViewer` | Stop re-deriving the lattice from scene vertices (delta-based edits); or epsilon-compare cells; gate camera-adjust on the bypass flag |
| D2 | ✅ | Med | "Edit [E]" hotkey dead — `hotKeysConfig.toggleThreejsEditorModal` doesn't exist in settings; lands on literal key `"undefined"`; `"e"` is already taken by element labels | Add a real hotkey entry with a non-colliding key; update tooltip |
| D3 | 📖 | High | Mid-drag React rebuild orphans the dragged mesh: `beginAtomDrag_` → synchronous setState → full `reloadViewer` → `clearView()` removes the mesh `pendingDragAtom_` holds; direct drag becomes a no-op with a junk history entry in the composed app (unit tests miss it — no React around the mixin) | Set bypass flag on selection changes / defer `onSelectionChanged`, or re-point drag refs after rebuild |
| D4 | ✅ | Med | Rotate mode is a structural no-op (sphere rotation never changes world position) that still fires `onStructureModified` → junk history + rebuild + D1 snap | Remove rotate button until group-rotate exists; suppress no-op commits |
| D5 | 📖 | Crit | `extractBasisFromScene` treats every `type==="Mesh"` as an atom: (a) bond `InstancedMesh` → phantom "Si" at origin; (b) boundary planes → phantom "Si" per plane; (c) repetition clones baked into the material (N×reps³ atoms), selectable with out-of-range `atomicIndex`, and drags write world coords into shifted-group local positions | Extract only meshes in the base `"Atoms"` group / tag atoms explicitly; exclude clones from `collectAllAtoms` picking or map clone picks to base atoms |
| D6 | 📖 | Crit | Edits **crash** under non-periodic boundary conditions: extraction grabs the first LineSegments (16-vertex half-cell) and indexes `vertices[17]` → TypeError | Locate the cell object by name/reference, not first-DFS-LineSegments; or stop extracting lattice from geometry |
| D7 | 📖 | High | Every edit strips atomic metadata (labels/spin glow, constraints) and forces basis units to `"crystal"` | Delta-based edits preserving the original material's fields; carry units through |
| D8 | 📖 | High | Export downloads pre-edit data (`originalMaterial` never updated) | Export the current working `material` |
| D9 | 📖 | High | Editing while "Conventional Cell" shown silently and permanently converts the material to the conventional representation | Map conventional-scene edits back to the primitive material, or block editing in conventional view with a notice |
| D10 | 📖 | Med | No drag cancel/capture: no `setPointerCapture`, no `pointercancel`, no Esc; release outside canvas leaves a stuck drag chasing the cursor | Implement pointer capture + Esc-revert (Section 3c) |
| D11 | 📖 | Med | Drags silently re-enable orbit controls, desyncing the "Rotate/Zoom" menu checkmark and overlay state | Restore the *tracked* orbit-enabled state after drag, not `true` |
| D12 | 📖 | Med | Zero-movement gizmo click emits a junk edit (history + rebuild + D1) and can then deselect the atom (TC/mixin pointer-up ordering) | Only commit on actual transform delta; guard mixin pointer-up against TC's just-ended drag |
| D13 | 📖 | Low | (= D4 consequence) rotate mutates history with no-ops | Covered by D4 |
| D14 | 📖 | Med | Hotkey listener leak: added with `capture: true`, removed without — never removed; unmounted editors intercept document keypresses | Match the capture flag; scope listeners to container |
| D15 | 📖 | Med | "Reset View"/re-init leaks WebGL contexts + window resize listeners; mixin `dispose()` has zero call sites | Call `dispose()`/`renderer.dispose()` on teardown and before re-init |
| D16 | 📖 | High | Undo history wiped by any parent re-render (`UNSAFE_componentWillReceiveProps` resets on any truthy `material` prop) — since every edit calls `onUpdate`, normal Redux hosts get single-entry history after every edit | Identity/hash-guarded reset (Section 2.4 state model) |
| D17 | 📖 | Crit (security) | `postMessage` handler reflectively invokes any component method, no origin check, no allowlist | Allowlist actions + origin check, or delete the bridge |
| D18 | 📖 | Med | Coordinate fields: can't clear, can't type leading "-", 4th decimal visibly vanishes (display rounds to 3 while state keeps full precision), one history entry + full rebuild per keystroke/spinner click | Local draft string state, commit on blur/Enter; merge history entries |
| D19 | 📖 | Med | Three features fight over `material.emissive`: edit selection vs. spin glow vs. measurement hover; deselect hard-sets black, erasing spin glow permanently | Separate highlight channel (outline pass / overlay mesh) or save-and-restore emissive |
| D20 | 📖 | Med | Edit mode + measurement modes concurrently active: one click both measurement-selects and edit-selects, with clipboard side effects | Mutually exclude modes on toggle |
| D21 | 📖 | Low | Pointer button not checked — right/middle press starts pending drags/selection raycasts | Filter to `event.button === 0` |
| D22 | 📖 | Med | Add Atom: `(ax/2, by/2, cz/2)` diagonal-only (off-center or outside cell for hexagonal/triclinic); repeated clicks stack identical Si with no warning | Use `(a+b+c)/2` true center; element picker + click-to-place or occupied-site offset |

Supporting performance/robustness findings (same report): **every selection click triggers a full `reloadViewer` + rebuild** (with synchronous bond recompute when bonds are on) because selection setState isn't bypass-flagged — root shared with D3; fix together.

### UX rough edges (no code "bug", user is surprised)

| # | Sev | Rough edge | Fix direction |
|---|---|---|---|
| R1 | High | View re-frames after every edit (user-facing face of D1) | Fix D1 |
| R2 | Med | No hover affordance in edit mode (cursor/highlight), while measurement mode has both — edit mode feels broken by comparison | Section 3d |
| R3 | Med | Selection highlight (`0x333333` emissive) nearly invisible on dark elements / `#202020` background | Stronger highlight channel (with D19 fix) |
| R4 | Med | Tooltip advertises dead "[E]"; pressing E flashes element labels instead | Fix D2 |
| R5 | Low | Rotate gizmo looks functional, snaps back (D4) | Fix D4 |
| R6 | Med | Add Atom "does nothing" on second click (stacked duplicate, D22) | Fix D22 |
| R7 | Med | Orbit on/off state opaque and self-desyncing (D11) | Fix D11 |
| R8 | Med | Undo granularity: "1.25" = 4 undo steps; no Ctrl+Z at all, undo is mouse-only | Section 3g + hotkeys |
| R9 | Med | Units caption silently flips "cartesian, Å" → "crystal" after first edit (D7) | Fix D7 |
| R10 | Low | Atom dragged out of cell stays there; no periodic wrap or bounds hint | Section 6 #7 |
| R11 | Med | Drag released outside canvas resumes on re-entry, no Esc (D10) | Fix D10 |
| R12 | Low | Exiting edit mode drops selection; re-entering doesn't restore | Persist selection across mode toggle |
| R13 | High | Download after editing returns pre-edit structure — data-loss-shaped (D8) | Fix D8 |
| R14 | Low | Power-toggle off leaves edit toolbar clickable above the interaction-blocking cover | Gate toolbar on interactive state |
| R15 | Med | Edit + measurement double-interpret clicks, unprompted clipboard writes (D20) | Fix D20 |
| R16 | Med | Selecting a repetition-clone atom shows bogus coordinate panel (D5c) | Fix D5 |
| R17 | Med | Per-click full rebuild makes selection sluggish on large structures | Fix selection-bypass (with D3) |

---

## 5. Test-pathway matrix

Stack (verified): Jest + jsdom, headless-gl (`gl` npm) real off-screen WebGL renderer (500×1000, `preserveDrawingBuffer`), pixel snapshots via `readPixels` → `pixelmatch` (threshold 0.7, LFS-tracked `.expected.png`), CI = Mesa under Xvfb in a node:20 container. jsdom performs no layout — `getBoundingClientRect()` must be stubbed per-test.

### 5.1 What the stack can and cannot prove

**Can prove:** edit-mode/selection/drag state machine (direct mixin-handler calls with synthetic `{clientX, clientY}`); genuine raycast hit-testing against real geometry with a stubbed rect; `Made.Material` output correctness via `onStructureModified`/`onSelectionChanged` capture (elements, coordinates, unit round-trips); undo/redo state (pure state, fully in-scope); real-pixel visual regression (highlights, gizmo, moved atoms); React toolbar→wave wiring via enzyme mount; listener attach/detach via jsdom `dispatchEvent(new MouseEvent("pointerdown", …))` (jsdom lacks `PointerEvent`, but type-string matching makes this work).

**Cannot prove (structural), with cheapest mitigations:** real browser event dispatch order between TC/OrbitControls/React delegation (→ dispatch-mode helper + 1 manual item); CSS layout/canvas offset/resize/DPR (→ rerun raycast tests with non-origin, non-1:1 rect stubs + manual item); GPU/driver rendering differences (→ the 0.7 threshold already; assert presence/geometry not shading; eyeball expected PNGs in a real browser); pointer-capture semantics and drag-leaves-canvas (→ manual item; spy on `setPointerCapture` if added); focus/hotkey routing and IME (→ unit-test key handlers directly + manual items); scrolled-container coordinate drift (→ offset rect stub + manual item). **Total cost of the rejected E2E layer: one ~8-item `MANUAL_SMOKE.md` run per release / before regenerating expected PNGs.**

**Conflict note:** the test-pathways report states "no undo implementation exists in `src/` yet," while the current-editor and old-editor reports document a working `historyStack`-based undo in `ThreeDEditor.jsx` React state. The likely reconciliation is that no **wave/mixin-level** `undo()` API exists (undo lives only in the React component, exercisable via pathway 4, not pathway 1). The spec author should verify before writing undo test stories.

### 5.2 Reusable helper design — `tests/helpers/editor.js`

Formalizes patterns already hand-written in `tests/__tests__/mixins/interactive_structure_editor.js` and `tests/utils.js`:

- `stubCanvasRect(wave, {left, top, scale})` — replaces the duplicated 7-line rect stub; non-zero `left/top` implements the layout-gap mitigation.
- `projectToScreen(wave, position)` / `projectMeshToScreen(wave, mesh)` — camera-projected screen px (wraps existing `getEventObjectBy3DPosition`/`ByMatrix`).
- `dispatchPointerEvent(wave, type, coords, {mode: "direct"|"dispatch"})` — direct handler call, or real jsdom dispatch to also exercise listener registration/removal.
- `simulateClick(wave, target)` — down+up under the 5 px threshold; returns `selectedMesh_`.
- `simulateAtomDrag(wave, atomMesh, dxPx, dyPx)` — encodes the **two-move requirement** (the first ≥5 px move only establishes the drag offset via `beginAtomDrag_`; the atom visibly moves on the *second* qualifying move) with built-in assertions on `isDraggingAtom_` before/after commit; returns `{startPosition, endPosition, modifiedMaterial}`.
- `getWaveWithRecordedCallbacks(settings)` — wave + recorded `structureModified`/`selectionChanged` call arrays.
- `expectVisualMatch(wave, imagePrefix)` — sugar over `takeSnapshotAndAssertEqualityAsync`.

### 5.3 Per-story pathway template

For each user story in the spec, tick applicable rows; a story is "covered" when all ticked rows have tests or a checklist entry:

| Pathway | Proves | Use when the story involves… | Mandatory? |
|---|---|---|---|
| 1. Mixin state test | Interaction state machine: thresholds, mode flags, selection, gizmo attachment | Any pointer/keyboard interaction, mode toggle, selection rule | **Yes, every editor story** |
| 2. Material output test | Correct `Made.Material` (elements, coordinates, units) via callback capture | Any structure-changing edit (add/remove/move, undo/redo) | **Yes, every editor story** |
| 3. Visual snapshot | Renderer actually draws the result | Any story whose value is visible on canvas | Whenever visible |
| 4. Component wiring (enzyme) | Toolbar/props/state plumbing React → wave | Story triggered from UI chrome, not the canvas | Toolbar-initiated stories only |
| 5. Manual checklist | Only the six structural gaps in 5.1 | Capture ordering, pointer-capture loss, focus/hotkeys, resize/DPR, real-GPU look | Never as a substitute for 1–3 |

Worked example (drag-atom story): pathway 1 = `simulateAtomDrag` asserting `pendingDragAtom_`/`isDraggingAtom_`/gizmo attachment through the down→+2px→≥5px→visible-move→up sequence, plus a `simulateClick` negative; pathway 2 = exactly one `onStructureModified` on pointer-up, dragged coordinate matches `endPosition` in crystal units, other atoms untouched, one `onSelectionChanged`; pathway 3 = `expectVisualMatch(wave, "editorAtomDragged")`; pathway 4 = only if story includes toolbar entry; pathway 5 = two items (real-mouse drag: no start-jump, orbit frozen, gizmo wins over atom body; drag-out-and-release: no stuck state).

---

## 6. Open design decisions

Genuine decisions for the product owner. Each: options → **recommendation**.

1. **Undo/redo ownership between wave and host.** (a) Wave owns intra-session undo, host records only commits/session-ends, wave exposes `undo()/redo()/canUndo()/canRedo()` ref API; (b) host owns everything, wave is stateless and streams every micro-edit; (c) both (status quo — duplicated, conflicting stacks). → **Recommend (a)**; it matches the old modal's mental model and fixes the materials-designer history-flood (Section 2.3 #3) without host changes beyond debouncing.

2. **Multi-material editing replacement.** The deleted "Multi-Material 3D Editor" (merge whole collection, result added as new material) has no equivalent. Options: (a) `materials: Made.Material[]` prop with active-index on `ThreeDEditor`; (b) a separate composition/merge workflow component; (c) drop the capability and remove the MD menu item. → **Recommend (b) or explicit (c)** — bolting an array onto the single-material editor complicates every callback; but the decision cannot be silent because MD's import breaks either way.

3. **Transactionality: commit-per-edit vs. session commit-or-cancel.** (a) Pure incremental (status quo): every edit fires `onUpdate`; (b) session model: `onEditSessionStart/End(final | null)` with explicit Cancel restoring the pre-session material; (c) hybrid — incremental `onStructureModified` streaming plus session-end `onUpdate`. → **Recommend (c)**: preserves live-preview value while restoring the old cancel guarantee and giving hosts one history entry per session.

4. **Rubber-band multi-select vs. orbit on empty-space drag.** In edit mode, empty-space drag can mean marquee select (prior-art convention) or camera orbit (viewer convention). Options: (a) edit mode: drag = marquee, orbit requires modifier/RMB; (b) marquee only with `Shift`-drag; (c) explicit select-tool sub-mode (old editor's `M` toggle). → **Recommend (a)** — matches Avogadro/CrystalMaker/Blender expectations; (c) is the proven in-house fallback.

5. **Default snap granularity.** [flagged contested in prior-art report] Options: free movement (snap off), fractional-grid step, nearest lattice site — all toggleable regardless. → **Recommend default off (free)** with a persistent magnet toggle and `Ctrl/Cmd`-held snap, since perturbation workflows are more common than on-lattice building; expose the default as a setting.

6. **Arrow-nudge axis frame.** [flagged contested] Screen-relative (matches free-drag mental model) vs. crystal-axis a/b/c-relative (crystallographic precision). → **Recommend screen-relative default, setting to switch**; camera-dependence makes neither universally right.

7. **Periodic wrapping of dragged atoms.** Atom dragged outside the cell: (a) leave as-is (status quo, fractional coords <0/>1); (b) auto-wrap into the cell on commit; (c) leave but visually flag + one-click wrap action. → **Recommend (c)** — auto-wrap silently changes what the user placed; silence (a) surprises.

8. **Lattice/cell editing scope.** Old editor allowed implicit lattice editing by transforming the cell object; new editor has none. In scope for v1? Options: (a) out of scope (numeric lattice editing stays in the host app); (b) numeric cell panel in-viewer; (c) draggable cell handles. → **Recommend (a) for v1**, stated explicitly, since delta-based extraction (Section 1.2) removes the accidental pathway.

9. **Element selection UX for add/change.** Options: (a) toolbar element picker (periodic-table popover) setting the "active element" for add + change-selected; (b) type-to-change in the coordinate panel; (c) both. → **Recommend (c)**, with the active element also fixing D22's hardcoded "Si".

10. **Edit-mode hotkey binding.** "[E]" is advertised but dead, and `e` is taken by element labels. Options: reassign element labels and give `e` to edit; pick a new key for edit (e.g. `t`/`g`); make bindings configurable. → **Recommend a new key for edit + fix the tooltip**; a configurable-bindings system is old-editor parity but likely not v1.

11. **`postMessage` bridge fate.** (a) Remove; (b) keep with origin check + action allowlist (`handleSetMaterial`, view toggles), documented as the official iframe API. → **Recommend (b) only if an iframe consumer actually exists; otherwise (a)**. Shipping the current reflective bridge is not an option (D17).

12. **Mode exclusivity policy.** Should entering edit mode force-disable measurement modes (and vice versa), or can they coexist with disambiguated input? → **Recommend mutual exclusion** (fixes D20/R15); coexistence has no prior-art support and doubles every click's meaning.
