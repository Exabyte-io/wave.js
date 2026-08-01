# Interactive Structure Editor — Design Specification

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-07-13 |
| **Branch** | `feat/upgrade-2026-07-11-separated` |
| **Scope** | v1 = current editor capabilities, done rigorously; v2+ = designed-but-deferred roadmap (§11) |
| **Basis** | Research dossier: old-editor archaeology, current-implementation inventory, materials-designer contract, prior-art survey (Avogadro 2, VESTA, CrystalMaker, Materials Studio, Jmol, three.js editor, Blender, Unity, Unreal, Figma), Jest test-pathway analysis |

**Contents:** [1. Overview](#1-overview--goals) · [2. User stories](#2-personas--user-stories) · [3. Interaction model](#3-interaction-model) · [4. UI spec](#4-ui-specification) · [5. Architecture](#5-data-flow--architecture) · [6. Host-app API](#6-host-app-embedding-api) · [7. Defect register](#7-defect--rough-edge-register) · [8. Test pathways](#8-test-pathways) · [9. Open decisions](#9-open-design-decisions) · [10. Implementation plan](#10-implementation-plan) · [11. Roadmap](#11-roadmap-designed-deferred)

---

## 1. Overview & goals

Wave's 3D structure editor used to be a separate application: a fork of the three.js editor (`@mat3ra/threejs-editor`) opened via a fullscreen `ThreejsEditorModal`, with the edited material re-derived from the scene once, on exit. Commit `751a7e3` replaced it with an **in-viewer editor**: an edit mode inside the Wave viewer itself, where each edit is applied incrementally and streamed to the host.

The in-viewer model is the right shape — no context switch, live preview, per-edit host notification, crystal-unit coordinate editing (which the old editor never had). The current implementation, however, is a prototype: it inherited the old editor's exit-time *scene-to-material extraction* and runs it per-edit against a scene it no longer controls (bonds, boundaries, repetition clones), producing the defect cluster in §7. This spec defines what the editor should be, so implementation can proceed deliberately.

**Design principles**

1. **Edit in place.** No modal, no mode-switch cost beyond one toggle. The viewer's own camera, settings, and visual context stay live while editing.
2. **Never lose the user's view.** No edit, undo, redo, or selection may move the camera. Only a *genuine* cell change (different material, edited lattice) re-frames the view (US-12).
3. **Every edit is one undoable step.** A completed drag, a committed coordinate edit, an add, a remove — each is exactly one history entry and one host notification. Cancelled interactions leave no trace.
4. **The material is the source of truth.** Edits are deltas applied to the known `Made.Material` — never re-derived by scraping the scene graph (§5).
5. **Hosts are first-class.** The editor is a component with a documented state model and callback contract; materials-designer must be able to embed it without workarounds (§6).

## 2. Personas & user stories

**Persona A — materials scientist (standalone wave.js).** Uses the demo/deployed viewer directly. Wants to perturb a structure — nudge an atom, add a defect atom, delete one — and download or copy the result. Cares about crystallographic correctness (units, lattice untouched) and not fighting the camera.

**Persona B — mat3ra platform user (via materials-designer).** Edits inside a larger app with its own undo history, material collection, and metadata. Wave's editor is one pane; edits must integrate with the host's state without flooding or clobbering it.

### Story index

| ID | Story | Acceptance criteria | Test pathways (§8.3) | Mockup |
|---|---|---|---|---|
| US-1 | Toggle edit mode | §2.1 | 1, 4 | [layout](./assets/editor-layout.svg) |
| US-2 | Select an atom | §2.2 | 1, 2, 3 | [atom states](./assets/atom-visual-states.svg), [state machine](./assets/interaction-state-machine.svg) |
| US-3 | Edit exact coordinates | §2.3 | 2, 3, 4 | [toolbar states](./assets/edit-toolbar-states.svg) |
| US-4 | Move an atom with the gizmo | §2.4 | 1, 2, 3 | [layout](./assets/editor-layout.svg), [state machine](./assets/interaction-state-machine.svg) |
| US-5 | Move an atom by direct drag | §2.5 | 1, 2, 3, 5 | [state machine](./assets/interaction-state-machine.svg), [atom states](./assets/atom-visual-states.svg) |
| US-6 | Cancel an in-progress drag | §2.6 | 1, 2 | [state machine](./assets/interaction-state-machine.svg), [atom states](./assets/atom-visual-states.svg) |
| US-7 | Add an atom | §2.7 | 1, 2, 3, 4 | [layout](./assets/editor-layout.svg) |
| US-8 | Remove an atom | §2.8 | 1, 2, 4 | [toolbar states](./assets/edit-toolbar-states.svg) |
| US-9 | Undo / redo | §2.9 | 2, 4 | [toolbar states](./assets/edit-toolbar-states.svg) |
| US-10 | Keyboard editing | §2.10 | 1, 4, 5 | [state machine](./assets/interaction-state-machine.svg) |
| US-11 | Embed in a host app | §2.11 | 2, 4 | [data flow](./assets/data-flow.svg) |
| US-12 | View stability (cross-cutting) | §2.12 | 1, 2, 3, 4 | [data flow](./assets/data-flow.svg) |

### 2.1 US-1 — Toggle edit mode

*As a user, I toggle edit mode from the viewer toolbar or a hotkey, so that editing tools appear without leaving the viewer.*

**Acceptance criteria**
- The toolbar "Edit" toggle enables/disables edit mode; the edit panel (§4) appears/disappears.
- A working, documented hotkey toggles edit mode (binding per decision D-10; the current "[E]" tooltip is false advertising — defect D2).
- Entering edit mode force-disables measurement/angle modes and vice versa (decision D-12; defect D20).
- Exiting edit mode detaches the gizmo but **preserves the selection**; re-entering restores it (rough edge R12).
- Toggling never changes the camera or the material.
- When the viewer's interaction cover ("power" toggle) is off, the edit toolbar is inert too (R14).

**Test pathways:** mixin state test (mode flags, listener add/remove with matching capture flags — D14); component wiring test (toolbar click, hotkey dispatch, measurement-mode exclusion).

### 2.2 US-2 — Select an atom

*As a user, I click an atom to select it, so that I can inspect and edit it.*

**Acceptance criteria**
- Left-click (< 5 px pointer travel) on an atom selects it: visible highlight ring (§4.3), gizmo attaches, coordinate panel populates in the material's own units.
- Hovering an atom before clicking shows a hover ring and a *move* cursor (R2).
- Click on empty space deselects (highlight, gizmo, panel clear).
- Right/middle button presses neither select nor start drags (D21).
- Selection is preserved across scene rebuilds (existing behavior — regression-guarded) and across edit-mode toggles (R12).
- Selecting must **not** trigger a full viewer reload/bond recompute (performance finding, §7 footnote) and must not move the camera.
- Repetition-clone meshes are either not selectable or map to their base atom — never a bogus out-of-range `atomicIndex` (D5c, R16).

**Test pathways:** mixin state test (`simulateClick` → `selectedMesh_`, threshold boundary at 4/5 px, button filtering); material/callback test (one `onSelectionChanged([index])`, no `onStructureModified`); visual snapshot (highlight ring visible).

### 2.3 US-3 — Edit exact coordinates

*As a user, I type exact coordinates for the selected atom, so that I can place it precisely in crystal or cartesian units.*

**Acceptance criteria**
- The panel shows X/Y/Z in the material's basis units, with the units caption ("crystal" or "cartesian, Å") always matching `material.basis.units` — and never silently flipping after an edit (D7, R9).
- Fields hold a **local draft while focused**: they can be cleared, accept a leading minus sign, and keep full precision (display rounds to 3 decimals only when not focused) (D18).
- Commit on Enter or blur: exactly **one** history entry and one host notification per committed field edit — not per keystroke (D18, R8).
- A committed edit updates the scene without moving the camera (US-12) and without rebuilding bonds synchronously on every keystroke.

**Test pathways:** component wiring test (draft state, commit-on-blur/Enter, single history entry); material test (edited coordinate correct in the material's units, other atoms bit-identical); visual snapshot (atom rendered at new position).

### 2.4 US-4 — Move an atom with the gizmo

*As a user, I drag a gizmo handle to move the selected atom along one axis or plane, so that I can move it in a constrained, predictable way.*

**Acceptance criteria**
- TransformControls translate mode with axis and plane handles; handle hover-highlight active.
- Orbit controls are disabled during a gizmo drag and restored to their **tracked** prior state after (D11, R7).
- Pointer-up commits **only if the transform delta is non-zero**; a zero-movement gizmo click produces no history entry, no host notification, and does not deselect the atom (D12).
- One completed gizmo drag = one history entry = one `onStructureModified` (§3g).
- "Rotate" mode is removed from the v1 toolbar: rotating a sphere about its own center never changes the structure, so the current button is a no-op that still pollutes history (D4, R5). It returns with group transforms (§11).
- The gizmo tracks the same atom across scene rebuilds and camera-projection changes (orthographic toggle).

**Test pathways:** mixin state test (gizmo attach, orbit-state restore, zero-delta suppression); material test (moved coordinate correct, one callback); visual snapshot (gizmo rendered on selected atom).

### 2.5 US-5 — Move an atom by direct drag

*As a user, I click-and-drag an atom itself (not the gizmo), so that I can reposition it as directly as dragging an icon.*

**Acceptance criteria**
- Drag threshold 5 px (§3b): below it, pointer-up is a click (US-2); at/above it, the drag commits to a **camera-parallel plane through the atom's position** — depth stays constant (§3a).
- The cursor–atom offset is captured when the drag starts, so the atom never jumps to the cursor.
- The atom tracks the cursor smoothly for the rest of the drag; orbit is frozen and restored after (D11).
- Pointer capture is taken on drag start; releasing outside the canvas ends the drag normally — no stuck-drag on re-entry (D10, R11).
- Starting a drag must not orphan the dragged mesh via a mid-drag React rebuild (D3): selection-change side effects during a drag are deferred or bypass-flagged.
- One completed drag = one history entry = one `onStructureModified`; the material's other atoms, lattice, units, and metadata are unchanged (D7).
- A dragged atom left outside the cell is handled per decision D-7 (recommend: keep position, flag visually, offer one-click wrap — R10).

**Test pathways:** mixin state test (`simulateAtomDrag` — down → +2 px (no drag) → ≥ 5 px (drag begins, offset captured, no visible jump) → second move (atom visibly moves) → up); material test (exactly one callback, dragged coordinate matches final position in crystal units); visual snapshot; manual checklist items (real-mouse drag: no start-jump, orbit frozen, gizmo wins over atom body when both are under the cursor; drag out of canvas and release).

### 2.6 US-6 — Cancel an in-progress drag

*As a user, I press Esc mid-drag to abandon the move, so that a bad drag costs nothing.*

**Acceptance criteria**
- Esc during a direct or gizmo drag reverts the atom to its pre-drag position (snapshot taken at pointer-down).
- A cancelled drag pushes **no** history entry and fires **no** `onStructureModified` (§3c).
- Selection and gizmo remain on the atom after cancel.
- `pointercancel` (tab switch, touch interruption) behaves like Esc.
- TransformControls provides none of this natively — the cancel layer is custom (§3, cross-cutting note).

**Test pathways:** mixin state test (Esc mid-drag → position restored, flags cleared); callback test (zero `onStructureModified`, history length unchanged).

### 2.7 US-7 — Add an atom

*As a user, I add an atom of the active element, so that I can build up the structure.*

**Acceptance criteria**
- The Add button inserts an atom of the **active element** (v1 default: `editSessionOptions.defaultElement`, falling back to `"Si"`; element picker is roadmap — decision D-9).
- Placement: the true cell center `(a⃗ + b⃗ + c⃗) / 2` — not the component-wise `(ax/2, by/2, cz/2)` diagonal, which lands off-center or outside non-orthogonal cells (D22).
- If the target site is already occupied, the new atom is offset to a free position — repeated clicks never silently stack coincident atoms (D22, R6).
- The new atom is auto-selected; one history entry; one `onStructureModified`; **all pre-existing atoms keep their exact coordinates and units** (the units-relabeling bug class is regression-guarded by existing tests).

**Test pathways:** mixin state test (atom count, auto-selection); material test (element, position at true center for a triclinic fixture, pre-existing atoms bit-identical); visual snapshot; component wiring (button, disabled states).

### 2.8 US-8 — Remove an atom

*As a user, I delete the selected atom via the toolbar or keyboard, so that I can remove defects quickly.*

**Acceptance criteria**
- Toolbar Remove button and `Delete`/`Backspace` both remove the selected atom (keyboard path is new — the old editor had it, v0 lost it).
- Selection clears; gizmo detaches; panel empties; one history entry; one `onStructureModified`.
- Remove is disabled (button) / inert (key) when nothing is selected.

**Test pathways:** mixin state test; material test (element list and coordinates shrink consistently); component wiring (disabled state, key handler).

### 2.9 US-9 — Undo / redo

*As a user, I undo and redo edits with buttons or Ctrl/Cmd+Z, so that experimentation is safe.*

**Acceptance criteria**
- Toolbar Undo/Redo plus `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` (hotkeys are new in v1 — R8).
- Granularity: one step per completed drag / committed field edit / add / remove (§3g). Never per-pointermove or per-keystroke.
- Undo/redo restores the material exactly (coordinates, elements, units) and **does not move the camera** (US-12).
- The history stack survives host re-renders: it resets only when the host supplies a genuinely different material, not when wave's own edit echoes back (D16; state model §6.1).
- Buttons reflect `canUndo`/`canRedo`; hosts can drive the same operations via the ref API (§6.3).

**Test pathways:** material test (undo→redo round-trip bit-exact); component wiring test (button/hotkey dispatch, disabled states, identity-guarded reset — simulate the host echo loop).

### 2.10 US-10 — Keyboard editing

*As a user, I keep my hands on the keyboard for common edit operations.*

**Acceptance criteria (v1)**
- Edit-mode toggle hotkey (D-10), `Delete`/`Backspace` (US-8), `Ctrl/Cmd+Z(+Shift)` (US-9), `Esc` (deselect; cancel drag — US-6).
- Key handling is scoped to the component container (or focus-gated): two editor instances on one page must not double-handle keys, and unmounted instances must not intercept anything (D14 — the current capture-phase listener leak).
- Hotkeys never fire while a coordinate field has focus (typing "e", digits, or Backspace in a field must not trigger viewer actions).
- Arrow-key nudging is roadmap (§11), with axis-frame per decision D-6.

**Test pathways:** mixin/unit test on key handlers (direct dispatch, focus guards); component wiring (listener add/remove symmetry across mount/unmount); manual checklist (focus routing in a real browser).

### 2.11 US-11 — Embed in a host app

*As a materials-designer developer, I embed the editor and consume edits, so that platform users edit structures in place.*

**Acceptance criteria**
- The full contract in §6 holds: uncontrolled-with-controlled-reset state model, tiered callbacks, undo ownership, ref API.
- A Redux-style host that stores every `onUpdate` and re-renders does **not** wipe wave's history/selection (D16) and does not receive per-keystroke floods (§6.2).
- Export/download from the viewer returns the **current edited** material, not the pre-edit snapshot (D8, R13).
- The `postMessage` bridge is removed or allowlisted with an origin check per decision D-11 — the current reflective invoke-any-method handler (D17) does not ship.
- Resize is handled via `ResizeObserver` on the container, not `window` resize events.

**Test pathways:** component wiring tests (prop-echo simulation, reset-on-new-identity, callback cadence counting); material test (export path returns edited material).

### 2.12 US-12 — View stability (cross-cutting)

*As a user, my camera never moves unless I move it.*

**Acceptance criteria**
- No structure edit, selection, undo, or redo re-frames the camera. This is the user-reported bug that motivated this spec (D1, R1): the v0 per-edit lattice re-derivation differs from the original by ~1e-7 and defeats `WaveComponent.shouldViewerAdjust()`'s exact `JSON.stringify` cell comparison, snapping the camera to default framing after **every** edit.
- Camera re-framing happens only on a genuine cell change: a different material, or a lattice edited by orders of magnitude more than float noise. Tactically: an ε-tolerant cell comparison (~1e-5 Å). Strategically: the delta-based edit path (§5.2) never perturbs the cell at all.

**Test pathways:** component test on `shouldViewerAdjust` (noise-level differences → no adjust; genuine change → adjust); mixin+material test (camera position identical before/after a simulated drag commit); visual snapshot (framing unchanged after edit).

## 3. Interaction model

The full pointer state machine: **[interaction-state-machine.svg](./assets/interaction-state-machine.svg)**. Per-question rules, grounded in the prior-art survey; contested items are cross-referenced to §9.

**(a) Drag plane.** Free drag moves the atom in the **camera-parallel plane through the atom's pre-drag position** — depth constant. This is the unanimous prior-art convention (Avogadro, Blender `G`, three.js free handle); depth is never inferred from a 2D drag. Precise 3D placement uses the gizmo's axis/plane handles or the coordinate panel; orthographic views make screen-parallel drags exact 2-axis moves. *(Current implementation already correct.)*

**(b) Click vs. drag.** Threshold **5 px** of pointer travel (Windows default is 4, Blender configurable; current code uses 5 — keep). Under threshold at pointer-up = click (select); at/over = drag. No dwell timers. Exposing the threshold as an advanced preference (trackpad users) is deferred, not rejected.

**(c) Cancel/revert.** Blender semantics: `Esc` mid-drag reverts to the pointer-down snapshot and pushes nothing; pointer-up commits. `pointercancel` = Esc. TransformControls has no cancel — this is custom (snapshot on `dragging-changed(true)`, restore on Esc, suppress the commit).

**(d) Hover affordances.** Hover ring + *move* cursor over atoms in edit mode; TransformControls' native handle hover-highlight; *crosshair* cursor if/when click-to-place lands (roadmap). Highlights live in a dedicated channel (outline pass or overlay mesh), **not** `material.emissive`, which selection, spin glow, and measurement hover currently fight over (D19, R3). See [atom-visual-states.svg](./assets/atom-visual-states.svg).

**(e) Snapping & modifiers.** Convention: **held `Ctrl`/`Cmd` = increment snap** during a transform, `Ctrl/Cmd+Shift` = fine snap (Blender/Unity); three.js's default `Shift`-snap is the outlier and is overridden so `Shift` stays reserved for additive selection (roadmap). Persistent magnet toggle in the toolbar when snapping ships. Domain targets: fractional-grid, lattice sites, snap-to-atom. Default granularity: decision D-5. All snapping is P2.

**(f) Multi-select — implemented 2026-07-14 (decision D-4: drag-on-empty-space = marquee; orbit rotate moved to the right mouse button while edit mode is active, restored on exit).** `Click` replace · `Shift+click` add · `Ctrl/Cmd+click` toggle · drag-on-empty-space = rubber-band marquee (screen-space hit-testing, same modifiers apply to the marquee's release) · `double-click` = bonded fragment (**not implemented** - needs bond connectivity data, deferred). Group transforms act rigidly about the selection centroid via a pivot object (`selectionPivot_`) the gizmo attaches to for 2+ selected atoms; dragging any selected atom directly (not just the gizmo) moves the whole group. Committed as a single delta/one history entry, directly (no two-phase submit/cancel, unlike the old editor's pivot group). Group **rotate** stays deferred along with single-atom Rotate mode (§4.1, D4) - only translate exists for now.

**(g) Undo granularity.** One entry per completed drag (snapshot at pointer-down, single commit at pointer-up), per committed field edit, per add, per remove. Confirmed as the firm norm across three.js editor (mergeable commands), Blender, Unity, Unreal.

**(h) Keyboard nudging (roadmap).** Arrows nudge in the screen plane, `Shift+arrows` for the large step (Figma-style, step size configurable); axis frame contested (D-6). Blender-style axis-then-number entry is a further optional layer, deferred. Complements, never replaces, the coordinate panel.

**What TransformControls gives vs. what is custom:** provided — gizmo, per-handle drag planes, `translationSnap`, world/local space, handle hover-highlight, `dragging-changed`/`objectChange` events. Custom — Esc-cancel, undo integration, zero-delta suppression, snap-to-atom/lattice, rubber-band select, keyboard nudging, hover ring on atoms.

## 4. UI specification

Overall layout: **[editor-layout.svg](./assets/editor-layout.svg)** · panel detail and enable-states: **[edit-toolbar-states.svg](./assets/edit-toolbar-states.svg)**.

### 4.1 Edit panel (MUI `Paper`, right side of viewport)

| Row | Contents | v1 behavior |
|---|---|---|
| Mode group | Translate (Rotate removed until group transforms — D4) | `ButtonGroup` of `SquareIconButton`s; active mode highlighted |
| Actions | Add · Remove · Undo · Redo | Remove disabled without selection; Undo/Redo follow `canUndo`/`canRedo`; disabled buttons keep the `<span>` Tooltip wrapper |
| Divider | — | — |
| Captions | Element symbol · units | Units string mirrors `material.basis.units`: `"crystal"` or `"cartesian, Å"` |
| Coordinates | X / Y / Z `TextField`s | Draft-while-focused; commit on Enter/blur; disabled without selection |

### 4.2 Viewer toolbar

The existing icons toolbar gains nothing new in v1; the Edit toggle's tooltip shows the *real* hotkey (D2). Edit mode and measurement modes are mutually exclusive (D-12): toggling one force-disables the other, with the toolbar reflecting it.

### 4.3 Selection & drag visuals

Per [atom-visual-states.svg](./assets/atom-visual-states.svg): hover ring (light blue), selected ring (strong blue) + gizmo, drag ghost marking the origin position, Esc returning the atom to the ghost. Rings are rendered via a dedicated highlight channel (§3d). The current near-invisible `0x333333` emissive nudge (R3) is replaced.

### 4.4 Cursors

`default` in view mode · `move` over atoms in edit mode · TransformControls' own cursors on handles · `grabbing` while dragging.

## 5. Data flow & architecture

Diagram: **[data-flow.svg](./assets/data-flow.svg)**.

### 5.1 Event flow (kept from v0)

Canvas pointer events → `InteractiveStructureEditorMixin` (raycast selection, gizmo, free drag) → callbacks (`onSelectionChanged`, structure-modified) → `ThreeDEditor` React state (`material`, `historyStack`/`historyPointer`) → `WaveComponent` props → `Wave.setStructure`/`setCell`/`rebuildScene`. Self-inflicted updates set `bypassReloadViewer` so the editor's own echo doesn't trigger a full reload. This shape stays.

### 5.2 The one architectural change: delta-based edit commits

v0 commits an edit by running `ThreeDSceneDataToMaterial(scene)` — re-deriving the lattice from `LineSegments` vertices and the basis from **every** `Mesh` in the scene. That function was designed for the old modal's exit-time conversion of a clean, dedicated scene. Run per-edit against the live viewer scene it produces, by construction:

- a lossy lattice float round-trip (~1e-7) → camera resets (D1);
- phantom "Si" atoms from bond `InstancedMesh`es and boundary planes (D5a/b);
- repetition clones baked into the material (D5c);
- a crash under non-periodic boundary conditions (16-vertex cell object, `vertices[17]` → TypeError) (D6);
- loss of atomic metadata/constraints and forced `"crystal"` units (D7);
- silent conversion to the conventional cell representation when edited in that view (D9).

**v1 replaces extraction with deltas.** The mixin reports *what happened* — `{moved: {index, cartesianPosition}}`, `{added: {element, cartesianPosition}}`, `{removed: {index}}` — and the editor applies it to the **previous material** to produce the next one. Lattice, units, metadata, constraints, and untouched atoms are preserved bit-for-bit because they are never re-derived. `ThreeDSceneDataToMaterial` remains only for legacy scene-import uses, out of the edit loop. This dissolves D1/D5/D6/D7/D9 as a class; the ε-tolerant cell comparison (US-12) stays as defense-in-depth.

**Refinement (2026-08-01):** the delta commits (`commitMovedAtoms_`, `addAtom`, `cloneSelectedAtoms`) initially placed a touched atom's coordinate by flipping the *whole* basis to Cartesian and back (`basis.toCartesian()`/`toCrystal()`) around the mutation, so the "never re-derived" claim above didn't fully hold — `Basis.toCartesian`/`toCrystal` round-trip every atom's coordinate via `mapArrayInPlace`, not just the touched one. In practice this was invisible for well-conditioned lattices, since `Basis` rounds every value to `Cell.roundPrecision` (9 decimals) on serialize, which absorbs a single round-trip's float noise (~1e-15) — but it relied on that rounding as an accidental safety net rather than being correct by construction, and did O(n) matrix work per edit regardless of how many atoms actually moved. Fixed to convert only the touched point(s) directly via `basis.cell.convertPointToCrystal`/`convertPointToCartesian`; untouched atoms' coordinate entries are now genuinely never read or rewritten, not merely unchanged after rounding.

### 5.3 Selection without reload

Selection changes are visual-only: they must not set React material state or trigger `reloadViewer`/bond recompute (currently every click does — §7 footnote, and mid-drag rebuilds orphan the dragged mesh, D3). Selection state flows through the bypass-flagged path or stays inside the wave instance entirely.

### 5.4 Lifecycle

`dispose()` actually gets called: unmount and re-init tear down the renderer, listeners (with matching capture flags), and the WebGL context (D14, D15). Resize via `ResizeObserver` on the container.

## 6. Host-app embedding API

Diagram: **[data-flow.svg](./assets/data-flow.svg)**. The old modal contract (`materials` in → single `onHide(material)` out) was transactional; v0 silently replaced it with per-edit streaming and broke its main consumer. v1 documents both layers.

### 6.1 State model: uncontrolled with controlled reset

`ThreeDEditor` owns edit/undo state internally, keyed by material identity. A new `material` prop resets internal state **only if** its identity (id/hash) differs from the last material the editor itself emitted. A host that echoes every `onUpdate` back as a prop (any normal Redux host) therefore does not wipe history or selection (D16, migration gap #4).

### 6.2 Props & callbacks

| Prop | Type | Notes |
|---|---|---|
| `material` | `Made.Material` (required) | Singular. Multi-material: decision D-2 |
| `editable` | `bool` | Shows the Edit toggle |
| `editSessionOptions` | `object` | `{ defaultElement, snap… }` — optional |
| `boundaryConditions`, `isConventionalCellShown`, `initialViewSettings`, `isStandalone` | as today | Editing in conventional view: blocked or mapped back per D9 fix |

| Callback | Cadence | Purpose |
|---|---|---|
| `onUpdate(material′)` | Once per committed edit | Back-compat channel (existing MD wiring) |
| `onEditCommit(material′, {source})` | Once per committed edit | **Shipped 2026-08-01.** `source ∈ drag · gizmo · coordinate-input · element-input · add · remove · clone · undo · redo` (`element-input` and `clone` added to the original 7-value enum for this round's type-to-change and clone-atom features) — lets hosts record history without double-counting |
| `onSelectionChanged(atomicIndices)` | On selection change | Promoted to a public prop (MD's selection footer needs it — gap #6). **Signature updated 2026-07-14 for D-4 (multi-select): reports an array, not a single index-or-null** — `[]` for none, one entry for the common single-atom case, 2+ for a group. This is a breaking change from the single-index contract this section originally specified; no external consumer existed yet (materials-designer is pinned to the pre-P0 export, unaffected) |
| `onEditModeChanged(isActive)` | On toggle | Hosts disable conflicting UI |
| `onEditSessionStart(material)` / `onEditSessionEnd(finalOrNull)` | Session bounds | Optional transactional layer (decision D-3): `null` = cancelled; restores the modal's commit-or-discard guarantee |

### 6.3 Undo ownership & ref API

Per decision D-1 (recommended): **wave owns intra-session undo/redo**; hosts record only commits/session-ends. Imperative ref API: `undo()`, `redo()`, `canUndo()`, `canRedo()` so a host toolbar (MD's header Undo) can drive the same stack instead of competing with it (gap #3).

### 6.4 Migration notes for materials-designer

| # | v0 → v1 gap | Resolution |
|---|---|---|
| 1 | `ThreejsEditorModal` export deleted; "Multi-Material 3D Editor" menu breaks | Decision D-2: replacement workflow or explicit removal — cannot be silent |
| 2 | Multi-material merge editing lost | Same decision D-2 |
| 3 | `onUpdate` once-per-session → per-edit floods MD's redux history | `onEditCommit`/session events + undo ownership (§6.3) |
| 4 | Prop echo wipes wave history/selection | State model §6.1 |
| 5 | No cancel semantics | Session layer (D-3) |
| 6 | No public selection callback | `onSelectionChanged` prop |

**Environment:** `ResizeObserver` replaces the `window.dispatchEvent(new Event("resize"))` workaround MD uses today; hotkeys are container-scoped (multiple instances — D14); the `postMessage` bridge is allowlisted+origin-checked or removed (D17, decision D-11); metadata is not round-tripped (hosts re-wrap, as MD already does) — now documented.

## 7. Defect & rough-edge register

From the research dossier; nothing dropped. **Severity:** Crit = corruption/crash/security · High = core workflow broken · Med = friction · Low = polish. **Status:** ✅ live-confirmed · 📖 code-read (plausible-to-near-certain). Spec sections that retire each defect are noted.

### Defects

| # | St | Sev | Defect | Fix direction (spec §) |
|---|---|---|---|---|
| D1 | ✅ | High | Camera snaps to default after **every** edit/undo/redo: lossy lattice round-trip defeats exact `JSON.stringify` cell compare in `shouldViewerAdjust`; not gated by `bypassReloadViewer` | ε-compare (US-12) + delta path (§5.2) |
| D2 | ✅ | Med | Edit hotkey dead: `hotKeysConfig.toggleThreejsEditorModal` doesn't exist; binds literal `"undefined"`; `e` taken by element labels | Real hotkey entry + honest tooltip (D-10) |
| D3 | 📖 | High | Mid-drag React rebuild orphans the dragged mesh (selection setState → full `reloadViewer` → `clearView()`); direct drag becomes a no-op with a junk history entry in the composed app. Mixin-only unit tests cannot catch this (no React around the mixin) — the regression test must be pathway 4 | Selection without reload (§5.3) |
| D4 | ✅ | Med | Rotate mode is a structural no-op that still commits junk edits | Remove until group transforms (US-4, §11) |
| D5 | 📖 | Crit | `extractBasisFromScene` treats every `Mesh` as an atom: phantom "Si" from bond `InstancedMesh` (a) and boundary planes (b); repetition clones baked in with out-of-range `atomicIndex`, and drags on clones write world coordinates into shifted-group local positions (c) | Delta path (§5.2); clone picking mapped/excluded (US-2) |
| D6 | 📖 | Crit | Edits **crash** under non-periodic boundary conditions (16-vertex cell object, `vertices[17]` TypeError) | Delta path (§5.2); cell located by reference not DFS |
| D7 | 📖 | High | Every edit strips atomic metadata/constraints and forces basis units to `"crystal"` | Delta path (§5.2); units mirrored (US-3) |
| D8 | 📖 | High | Export/download returns pre-edit material (`originalMaterial` is never updated by the edit/undo/redo path) | Export current material (US-11) |
| D9 | 📖 | High | Editing in "Conventional Cell" view silently, permanently converts the material | Block or map back (§6.2 props row) |
| D10 | 📖 | Med | No pointer capture, no `pointercancel`, no Esc; release outside canvas leaves a stuck drag | Capture + cancel (US-5, US-6) |
| D11 | 📖 | Med | Drags re-enable orbit unconditionally, desyncing menu state | Restore tracked state (US-4/5) |
| D12 | 📖 | Med | Zero-movement gizmo click emits a junk edit and can deselect | Δ≠0 commit guard (US-4) |
| D13 | 📖 | Low | Rotate no-ops pollute history (consequence of D4) | With D4 |
| D14 | 📖 | Med | Hotkey listener leak: added `capture: true`, removed without — never removed; unmounted editors intercept keys | Matching flags, container scoping (US-10) |
| D15 | 📖 | Med | Reset/re-init leaks WebGL contexts + resize listeners; `dispose()` has zero call sites | Lifecycle (§5.4) |
| D16 | 📖 | High | Any parent re-render wipes undo history (`UNSAFE_componentWillReceiveProps` resets on any truthy material) — every Redux host gets single-entry history | Identity-guarded reset (§6.1) |
| D17 | 📖 | Crit | `postMessage` handler reflectively invokes **any** component method; no origin check | Allowlist+origin or remove (§6.4, D-11) |
| D18 | 📖 | Med | Coordinate fields: can't clear, no leading minus, display/precision mismatch, one history entry + full rebuild per keystroke | Draft-state fields (US-3) |
| D19 | 📖 | Med | Selection, spin glow, and measurement hover all fight over `material.emissive`; deselect erases spin glow permanently | Dedicated highlight channel (§3d) |
| D20 | 📖 | Med | Edit + measurement modes concurrently active; one click double-interpreted, with clipboard side effects | Mutual exclusion (US-1, D-12) |
| D21 | 📖 | Low | Pointer button unchecked — right/middle press starts drags/selection | LMB filter (US-2) |
| D22 | 📖 | Med | Add Atom: diagonal-only "center" wrong for non-orthogonal cells; repeated clicks stack coincident duplicates | True center + occupied-site offset (US-7) |

*Performance finding (same source):* every selection click triggers a full `reloadViewer` + rebuild, with synchronous bond recompute when bonds are shown — root shared with D3; fixed together (§5.3).

### UX rough edges

| # | Sev | Rough edge | Resolution |
|---|---|---|---|
| R1 | High | View re-frames after every edit (user-facing face of D1) | US-12 |
| R2 | Med | No hover affordance in edit mode (measurement mode has one — edit feels broken by comparison) | §3d |
| R3 | Med | Selection highlight nearly invisible on dark elements/background | §4.3 |
| R4 | Med | Tooltip advertises dead "[E]"; pressing E flashes element labels | D2 fix |
| R5 | Low | Rotate gizmo looks functional, does nothing | D4 fix |
| R6 | Med | Add Atom "does nothing" on second click (stacked duplicate) | D22 fix |
| R7 | Med | Orbit on/off state opaque and self-desyncing | D11 fix |
| R8 | Med | "1.25" typed = 4 undo steps; no Ctrl+Z anywhere | US-3, US-9 |
| R9 | Med | Units caption silently flips after first edit | D7 fix |
| R10 | Low | Atom dragged out of cell: no wrap, no hint | Decision D-7 |
| R11 | Med | Drag released outside canvas resumes on re-entry | D10 fix |
| R12 | Low | Exiting edit mode drops selection; re-entering doesn't restore | US-1 |
| R13 | High | Download after editing returns pre-edit structure — data-loss-shaped | D8 fix |
| R14 | Low | Power-toggle off leaves edit toolbar clickable | US-1 |
| R15 | Med | Edit + measurement double-interpret clicks; unprompted clipboard writes | D20 fix |
| R16 | Med | Selecting a repetition-clone shows bogus coordinates | D5c fix |
| R17 | Med | Per-click full rebuild makes selection sluggish on large structures | §5.3 |

## 8. Test pathways

The project deliberately keeps its **lightweight Jest stack** (decision made earlier in this effort; Cypress/E2E evaluated and rejected). Verified stack facts: Jest + jsdom; headless-gl provides a *real* off-screen WebGL context (500×1000, `preserveDrawingBuffer`), so actual rendering and `readPixels`-based visual regression work (`pixelmatch`, threshold 0.7, LFS-tracked `.expected.png`); jsdom performs no layout, so `getBoundingClientRect()` is stubbed per test; CI runs Mesa under Xvfb in a node:20 container.

### 8.1 What the stack can and cannot prove

**Can prove:** the full interaction state machine (direct mixin-handler calls with synthetic `{clientX, clientY}`); genuine raycast hit-testing against real geometry; `Made.Material` output correctness via callback capture; undo/redo state (React-component level — note: the wave/mixin layer has no undo API; undo tests are component-wiring tests, pathway 4); real-pixel visual regression (highlights, gizmo, moved atoms); React toolbar→wave plumbing via enzyme mount; listener add/remove symmetry via jsdom `dispatchEvent(new MouseEvent("pointerdown", …))` (jsdom lacks `PointerEvent`; type-string matching makes `MouseEvent` work).

**Cannot prove (structural), with the cheapest mitigation each:** real browser event ordering between TransformControls/OrbitControls/React (→ dispatch-mode helper + manual item); CSS layout/canvas offset/resize/DPR (→ rerun raycast tests with non-origin, non-1:1 rect stubs + manual item); GPU/driver rendering differences (→ existing 0.7 pixelmatch threshold; assert geometry not shading; eyeball expected PNGs in a real browser); pointer-capture semantics and drag-leaves-canvas (→ manual item; spy on `setPointerCapture`); focus/hotkey routing and IME (→ unit-test handlers directly + manual item); scrolled-container coordinate drift (→ offset rect stub + manual item). **The entire cost of the rejected E2E layer is one ~8-item `MANUAL_SMOKE.md` checklist**, run per release and before regenerating expected PNGs.

### 8.2 Reusable helpers — `tests/helpers/editor.js`

Formalizes what `tests/__tests__/mixins/interactive_structure_editor.js` already does by hand:

```js
stubCanvasRect(wave, { left = 0, top = 0, scale = 1 } = {})
// replaces the duplicated getBoundingClientRect stub; non-zero left/top
// exercises the layout-offset gap from §8.1

projectToScreen(wave, position)        // world position -> screen px via camera
projectMeshToScreen(wave, mesh)

dispatchPointerEvent(wave, type, coords, { mode: "direct" | "dispatch" })
// "direct" calls the mixin handler; "dispatch" fires a real jsdom event to
// also exercise listener registration/removal

simulateClick(wave, target)            // down+up under the 5 px threshold -> selectedMesh_

simulateAtomDrag(wave, atomMesh, dxPx, dyPx)
// encodes the two-move requirement: the first >= 5 px move only establishes
// the cursor-atom offset (no visible motion); the atom moves on the SECOND
// qualifying move. Asserts isDraggingAtom_ before/after commit.
// returns { startPosition, endPosition, modifiedMaterial }

getWaveWithRecordedCallbacks(settings) // wave + recorded callback arrays
expectVisualMatch(wave, imagePrefix)   // sugar over takeSnapshotAndAssertEqualityAsync
```

### 8.3 Per-story pathway matrix

A story is covered when every ticked pathway has a test (or checklist entry — pathway 5 only for §8.1's structural gaps, never as a substitute):

| Pathway | Proves | Mandatory for |
|---|---|---|
| 1. Mixin state test | Interaction state machine: thresholds, flags, selection, gizmo attachment | Every pointer/keyboard story |
| 2. Material output test | Correct `Made.Material` via callback capture (elements, coordinates, units) | Every structure-changing story |
| 3. Visual snapshot | The renderer actually draws it | Every visibly-rendered story |
| 4. Component wiring (enzyme) | Toolbar/props/state plumbing React → wave | Toolbar/hotkey/host stories |
| 5. Manual checklist | Only the six structural gaps | Real-browser-only behavior |

*Note:* the research dossier marked pathways 1–2 mandatory for *every* editor story; this matrix deliberately resolves that to applicability. Stories that must **not** modify the material (US-1 toggle, US-2 select, US-6 cancel) still carry a negative material assertion — zero `onStructureModified`, history length unchanged — inside their callback tests, so the "prove nothing changed" intent survives.

**Worked example — US-5 (direct drag):** pathway 1 = `simulateAtomDrag` through down → +2 px (no drag) → ≥ 5 px (drag begins, offset captured) → second move (visible motion) → up, plus a `simulateClick` negative control; pathway 2 = exactly one `onStructureModified`, dragged coordinate equals `endPosition` in crystal units, other atoms untouched, one `onSelectionChanged`; pathway 3 = `expectVisualMatch(wave, "editorAtomDragged")`; pathway 5 = two items (real-mouse drag: no start-jump, orbit frozen, gizmo wins over atom body; drag-out-and-release: no stuck state).

## 9. Open design decisions

For resolution during this spec's review. Each: options → **recommendation**.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D-1 | Undo/redo ownership | (a) wave owns intra-session, host records commits, ref API · (b) host owns all, wave stateless · (c) both (status quo) | **(a)** — matches the old modal's mental model; fixes MD's history flood with no host changes |
| D-2 | Multi-material replacement | (a) `materials[]` prop + active index · (b) separate merge-workflow component · (c) drop capability, remove MD menu item | **(b) or explicit (c)** — an array complicates every callback; the decision can't be silent because MD's import breaks either way |
| D-3 | Transactionality | (a) pure incremental (status quo) · (b) session commit-or-cancel · (c) hybrid: streaming + session-end commit | **(c)** — keeps live preview, restores the cancel guarantee, one host history entry per session |
| D-4 | Rubber-band vs. orbit on empty-space drag (edit mode) | (a) drag = marquee, orbit needs modifier/RMB · (b) marquee needs `Shift`-drag · (c) explicit select-tool sub-mode (old `M` toggle) | **Decided and implemented 2026-07-14: (a)** — drag-on-empty-space is marquee select; orbit rotate moved to the right mouse button (`OrbitControls.mouseButtons` remapped while edit mode is active, restored on exit) |
| D-5 | Default snap granularity | free (off) · fractional grid · nearest lattice site — all toggleable | **Off by default**, magnet toggle + `Ctrl/Cmd`-held snap; perturbation workflows dominate; the default exposed as a setting |
| D-6 | Arrow-nudge axis frame | screen-relative · crystal a/b/c-relative | **Screen-relative default, setting to switch** — camera-dependence makes neither universally right |
| D-7 | Atom dragged outside cell | (a) leave as-is · (b) auto-wrap on commit · (c) leave + visual flag + one-click wrap | **(c)** — auto-wrap silently changes what the user placed; silence surprises |
| D-8 | Lattice/cell editing in v1 | (a) out of scope · (b) numeric cell panel · (c) draggable cell handles | **(a), stated explicitly** — the delta path removes the old accidental pathway |
| D-9 | Element selection UX | (a) toolbar periodic-table picker (active element) · (b) type-to-change in panel · (c) both | **(c)** — the active element also fixes hardcoded-"Si" adds (D22). **(b) implemented 2026-08-01**; (a) (the Add-Atom default-element picker) remains open — see §11 |
| D-10 | Edit-mode hotkey | reassign `e` from element labels · new key (e.g. `t`/`g`) · configurable bindings | **New key + honest tooltip**; configurable bindings are old-editor parity but not v1 |
| D-11 | `postMessage` bridge | (a) remove · (b) origin-check + action allowlist as the official iframe API | **(b) only if an iframe consumer actually exists; else (a)** — the current reflective bridge (D17) does not ship either way |
| D-12 | Mode exclusivity | force-disable measurement in edit mode (and vice versa) · coexist with disambiguated input | **Mutual exclusion** — coexistence has no prior-art support and doubles every click's meaning |

## 10. Implementation plan

Phased; each phase lands with its regression tests. No code changes before this spec is approved.

### P0 — critical & live-confirmed defects

| Defect | Fix | Named regression test |
|---|---|---|
| D1 camera reset | ε-tolerant cell comparison in `WaveComponent.shouldViewerAdjust` (per-component, ~1e-5 Å); keep as defense-in-depth after §5.2 | `WaveComponent: "does not re-adjust the camera for sub-tolerance cell noise"` + `"re-adjusts on a genuine cell change"` |
| D2 dead hotkey | Real `hotKeysConfig` entry (key per D-10) + tooltip | `ThreeDEditor: "edit-mode hotkey from settings toggles edit mode"` |
| D4 rotate no-op | Remove Rotate from v1 toolbar; suppress no-op commits | `interactive_structure_editor: "no structure-modified event without a transform delta"` |
| D5 phantom atoms | Scope extraction/picking to the atoms group; exclude/map repetition clones | `utils: "extractBasisFromScene ignores bond, boundary, and repetition meshes"` (fixture with bonds + boundaries + repetition > 1; the fixture asserts bond `InstancedMesh.type === "Mesh"` — true in three 0.140.x by inheritance — so a three.js upgrade can't silently invalidate it) |
| D6 non-periodic crash | Locate the cell object by reference, not first-DFS `LineSegments` | `utils: "editing under non-periodic boundary conditions does not throw and preserves the lattice"` |
| D17 postMessage | Origin check + action allowlist, or removal (D-11) | `ThreeDEditor: "postMessage ignores foreign origins and unlisted actions"` |

### P1 — architecture + bring v1 scope to spec

1. **Delta-based edit commits** (§5.2) — retires the D1/D5/D6/D7/D9 cluster by construction; D8 export fix rides along (export current material).
2. **State model & host API** (§6) — identity-guarded reset (D16), `onEditCommit`/`onSelectionChanged`/`onEditModeChanged`, ref undo API, `ResizeObserver`.
3. **Selection without reload** (§5.3) — fixes D3 and the per-click rebuild (R17). D3's regression test is necessarily pathway 4 (enzyme-mounted `ThreeDEditor`, drag started, assert the dragged mesh survives the render cycle) — mixin-only tests cannot see it.
4. **Drag robustness** — pointer capture, `pointercancel`, Esc-revert (D10, US-6); orbit-state restore (D11); zero-delta guard (D12); LMB filter (D21).
5. **Affordances** — hover/selected rings via dedicated highlight channel (D19, R2, R3); cursors (§4.4).
6. **Coordinate panel** — draft-state fields, commit-on-blur/Enter, merged history (D18).
7. **Keyboard** — Delete/Backspace, Ctrl/Cmd+Z(+Shift), Esc; container-scoped listeners with matching capture flags (D14); lifecycle disposal (D15).
8. **Mode exclusivity** (D20), add-atom placement (D22), selection persistence across mode toggles (R12), power-toggle gating (R14).
9. **Test helpers** (`tests/helpers/editor.js`, §8.2) + `MANUAL_SMOKE.md`.

### P2 — roadmap items

Per §11, gated on decisions D-2/D-5/D-6/D-7/D-9. (D-4 was resolved and implemented 2026-07-14 — see below; it no longer gates anything.)

## 11. Roadmap (designed, deferred)

**Shipped 2026-07-14 (decision D-4):** rubber-band multi-select + group **translate** about a centroid pivot — `MultipleSelectionControls`-equivalent parity with the old editor's marquee/pivot behavior, committing directly with normal undo instead of its two-phase submit/cancel. `Click`/`Shift+click`/`Ctrl+click` selection modifiers, and dragging any selected atom (not just the gizmo) moves the whole group.

**Shipped 2026-08-01:** group **rotate** about the shared centroid — extends D-4's translate-only pivot to the old editor's full pivot-group behavior (same gizmo, same one-commit-per-drag semantics), gated in the UI to a 2+ atom selection. Also shipped: **clone selected atom(s)** (single or group, small fixed Cartesian offset, clones become the new selection — old-editor parity, US-7 extension); **camera focus on selection** (`F` key + toolbar button; re-targets and re-distances without resetting the viewing angle, deliberately unlike the whole-cell "fit" reset); and the **type-to-change** half of decision D-9 (an editable Element field in the single-atom panel, validated against the periodic table, case-insensitive). Between clone and rename, the old editor's actual add-a-specific-element workflow ("clone existing, then rename") now has parity without needing decision D-9(a)'s toolbar picker — see the updated roadmap table below. **Double-click-selects-bonded-fragment remains deferred** (needs bond connectivity data neither implementation touches yet).

While wiring group rotate, found and fixed a latent defect in `rebuildScene()` (`wave.js`, pre-existing since D-4): it only ever restored a *single*-atom selection after a scene rebuild, so a host's `onStructureModified` round-trip (which independently calls `setStructure`+`rebuildScene` again after the mixin's own commit) silently collapsed any 2+ group selection down to one atom — breaking a second consecutive group rotate or drag. Fixed to preserve the full multi-selection across a rebuild regardless of who triggers it; this also retroactively hardens D-4's group translate, which shared the same gap. Regression tests: `interactive_structure_editor: "A multi-selection survives a rebuild triggered independently of the mixin's own commit"` and `"A second consecutive group rotate still works after a host round-trip rebuild"`.

| Item | Design anchor | Old-editor parity? |
|---|---|---|
| Double-click selects the bonded fragment | §3f | Beyond old editor |
| Toolbar periodic-table picker for the Add-Atom default element (decision D-9(a)) | Decision D-9; toolbar ghost row in [edit-toolbar-states.svg](./assets/edit-toolbar-states.svg) | Beyond old editor — clone+rename (shipped above) already matches the old editor's own add-a-specific-element workflow |
| Snapping: fractional grid, lattice sites, snap-to-atom; magnet toggle + `Ctrl/Cmd` held | §3e, decision D-5 | Beyond old editor |
| Keyboard nudge (arrows / `Shift`+arrows) | §3h, decision D-6 | Beyond old editor |
| Periodic-wrap flag + one-click wrap for out-of-cell atoms | Decision D-7 | Beyond old editor |
| Multi-material story | Decision D-2 | Yes — modal's merge workflow |
| Configurable key bindings | Decision D-10 | Yes |

Explicitly **out of scope** (dropped with the old editor, deliberately):

- Generic 3D authoring — primitives, lights, materials editor, scripting, player/VR/publish, outliner/scene tree.
- File import/export (25+ formats, including `xyz` structure import and OBJ/STL/GLTF/PLY/USDZ mesh exports). The viewer's own material download covers the export need once D8 is fixed; structure import stays a host-app concern.
- The History **panel** (click-to-jump list) and optional history persistence — v1 keeps linear undo/redo only.
- Group **scale** mode and the local/world transform-space toggle — only group translate/rotate is roadmapped; scaling atom positions has no crystallographic meaning at the selection level, and space toggling only matters once rotations exist.
