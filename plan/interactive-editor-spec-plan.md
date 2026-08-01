# Interactive editor: plan and status

## Status (as of 2026-08-01)

- ✅ **Spec written and approved**: [`docs/design/interactive-editor-spec.md`](../docs/design/interactive-editor-spec.md) — drives all further work on this feature.
- ✅ **P0 implemented, tested, committed** — `97707ba`. Six critical/confirmed defects: camera-reset-on-every-edit (the original user-reported bug), phantom-atom scene extraction, non-periodic-boundary crash, dead edit-mode hotkey, no-op Rotate button, unauthenticated `postMessage` bridge.
- ✅ **P1 implemented, tested, committed** — `03b1376` (reusable test helpers + manual smoke checklist) and `c2524a8` (architecture + polish). The core change: replaced "re-derive the whole material from the live Three.js scene on every edit" with basis-mutation deltas applied to the wave's own tracked material — the fix the D1/D5/D6/D7/D9 defect cluster hinged on. Also landed: drag pointer-capture/Esc-cancel, a dedicated selection/hover highlight channel, selection-without-reload, coordinate-field draft state, an identity-guarded material-prop reset, edit/measurement mode exclusivity, true-center add-atom placement, `dispose()`/`ResizeObserver` lifecycle cleanup, and keyboard shortcuts (Delete/Ctrl+Z/Ctrl+Shift+Z/Esc).
- ✅ **D-4 (multi-select) implemented, tested, committed** — `88398a3`. Rubber-band marquee select, Shift/Ctrl+click modifiers, group translate via gizmo pivot or direct drag on any selected atom, one commit/one history entry per group move, orbit rotate remapped to the right mouse button while editing. `onSelectionChanged` now reports an array of atomicIndices (breaking change from the P1 single-index contract; no external consumer existed yet, so this was safe).
- ✅ **Old-editor functionality parity implemented, tested** (this round, 2026-08-01): group **rotate** about the shared centroid (extends D-4's translate-only pivot), **clone selected atom(s)**, **camera focus on selection** (`F` key + button), and the **type-to-change** half of D-9 (editable Element field, periodic-table-validated). See spec §11 for the full writeup, including a real pre-existing multi-select bug found and fixed along the way (`rebuildScene()` in `wave.js` was single-atom-only, silently collapsing a group selection on any externally-triggered rebuild — e.g. the host's `onStructureModified` round-trip — which broke a second consecutive group rotate/drag).
- ⬜ **Rest of P2 not started** — intentionally. Every remaining P2 item is gated on a product decision from spec §9 that's Timur's to make, not inferable from the spec itself.

All commits through D-4 are pushed to `origin/feat/upgrade-2026-07-11-separated`; this round's parity commit is not yet pushed as of this note. Full verification each phase: Jest suite green (145 tests passing after this round, up from 127 after D-4), `tsc --noEmit` clean, lint unchanged from baseline (0 errors, only pre-existing `no-explicit-any` warnings), production build clean, live browser-tested end-to-end (rotate math verified against the real WebGL/three.js runtime via direct wave-instance driving, clone offset math, real keyboard-driven element rename, toolbar gating for 0/1/2+ selections, all confirmed against the running dev server — see spec §11 for the dev-server pre-bundling fix (`vite.config.ts`) needed to load the new toolbar icons).

## What's outstanding: P2, gated on open decisions (spec §9)

| # | Decision | Status |
|---|---|---|
| D-1 | Undo ownership (wave vs. host vs. both) | Open |
| D-2 | Multi-material editing replacement (materials-designer's deleted "Multi-Material 3D Editor") | Open — explicitly deferred 2026-07-14, not decided |
| D-3 | Transactionality (incremental vs. session commit/cancel vs. hybrid) | Open |
| D-4 | Rubber-band multi-select vs. orbit-on-empty-space-drag | **Decided and implemented 2026-07-14; group rotate added 2026-08-01.** Translate and rotate are both shipped for a 2+ group. Double-click-selects-bonded-fragment stays deferred (needs bond connectivity data). |
| D-5 | Default snap granularity (free/grid/lattice-site) | Open |
| D-6 | Arrow-nudge axis frame (screen-relative vs. crystal-axis) | Open |
| D-7 | Periodic wrapping of atoms dragged outside the cell | Open |
| D-8 | Lattice/cell editing scope (in v1 or out) | Open |
| D-9 | Element-picker UX for Add Atom / change-in-place (fixes hardcoded "Si") | **Type-to-change implemented 2026-08-01.** The Add-Atom default-element toolbar picker half is open, but now non-blocking - clone+rename already matches the old editor's own add-a-specific-element workflow. |
| D-10 | Edit-mode hotkey binding | Resolved in P0 — `t`, per the spec's own recommendation |
| D-11 | `postMessage` bridge fate | Resolved in P0 — removed entirely (no confirmed consumer) |
| D-12 | Mode exclusivity (edit vs. measurement) | Resolved in P1 — mutually exclusive, per the spec's recommendation |

Shipped so far: rubber-band multi-select + group translate/rotate about a centroid (D-4 — this is what restores the old editor's `MultipleSelectionControls` capability), type-to-change element rename + clone atom (D-9's type-to-change half), and camera focus-on-selection. Once the remaining open decisions are made, the rest becomes buildable: an Add-Atom element-picker (D-9's toolbar-picker half), lattice/fractional snapping (D-5/D-6), keyboard nudge (D-6), and the multi-material story (D-2).

Two things explicitly stay out of scope regardless of these decisions (spec §11): the old editor's generic 3D-authoring features (primitives, lights, materials editor, scripting) and its outliner/scene-tree panel — the new editor's structure state *is* the outliner, there's no separate group hierarchy to browse.

---

## Original plan (historical — superseded now that the spec is written; kept for context on how it was produced)

### Context

Wave's 3D structure editor was moved from the standalone `@mat3ra/threejs-editor` modal into Wave itself (commit 751a7e3, then hardened over this session: crash fixes, coordinate-units fix, selection persistence, click-and-drag, MUI toolbar). The user's verdict: the current implementation is a working prototype ("a hack") and needs a comprehensive design spec — user stories, test pathways, mockups — before further implementation.

Decisions confirmed with the user:
- **Spec format**: Markdown in the repo (`docs/`), versioned and PR-reviewable, mockups as embedded SVG.
- **Scope**: rigorously spec the current capabilities as v1, plus a designed-but-deferred roadmap.
- **Code freeze**: no code changes until the spec is approved. The two confirmed bugs (below) are folded into the spec's implementation plan, not fixed now.
- **Host-app API**: in scope — materials-designer is the real consumer.

A research workflow (5 read-only researchers + synthesis; 6 agents, all completed) produced a dossier covering: old-editor feature archaeology from git history, current-implementation inventory, the materials-designer integration contract, prior-art interaction models (Avogadro, VESTA, Blender, three.js editor, Unity/Unreal/Figma), and Jest test-pathway analysis. Full dossier: [interactive-editor-research-dossier.md](./interactive-editor-research-dossier.md). Headline findings that fed the spec:

- **The old editor's one substantial custom feature was rubber-band multi-select with centroid group transforms** (`MultipleSelectionControls`: `M`-key marquee, pivot group, submit/cancel with exit guard) — entirely absent from the new editor; likely what the user's earlier "click-and-drag selection is not there" report meant. Also lost: element choice (add is hardcoded `"Si"`), clone atom, camera focus-on-selection, keyboard delete, Ctrl+Z, multi-material editing.
- **Materials-designer (the real consumer) hard-breaks**: it imports the deleted `ThreejsEditorModal` for its "Multi-Material 3D Editor" menu item; and because every edit now fires `onUpdate` and any parent re-render resets wave's history/selection (`UNSAFE_componentWillReceiveProps`), a normal Redux host floods its own undo history and wipes wave's after every edit. The spec's host-app API section must define an *uncontrolled-with-controlled-reset* state model, a tiered callback contract, and undo ownership.
- **Defect register: 22 defects + 17 UX rough edges**, including 3 critical: phantom "Si" atoms extracted from bond/boundary-plane meshes (`extractBasisFromScene` treats every Mesh as an atom), a crash editing under non-periodic boundary conditions, and an unauthenticated reflective `postMessage` bridge that can invoke any component method. The two originally-confirmed bugs (camera view reset from the lossy lattice round-trip + exact `JSON.stringify` cell compare; dead "[E]" hotkey) are D1 and D2 of that register.
- **Architectural recommendation**: replace "re-derive the whole material from scene meshes on every edit" with "apply the known delta to the known material" — dissolving the worst defect cluster (D1, D5, D6, D7, D9) as a class.
- **12 open design decisions** enumerated with options + recommendations (undo ownership, multi-material replacement, commit-per-edit vs session transactionality, marquee-vs-orbit on empty-space drag, snap defaults, nudge axis frame, periodic wrapping, lattice-editing scope, element-picker UX, hotkey binding, postMessage fate, mode exclusivity) — these went into the spec's "Open decisions" section.

### Deliverable

`docs/design/interactive-editor-spec.md`, with SVG mockups in `docs/design/assets/`. Outline:

1. **Overview & goals** — why in-viewer editing replaced the modal editor; design principles (edit in place, never lose the user's view, every edit undoable).
2. **Personas & user stories** — (a) materials scientist using standalone wave.js demo; (b) mat3ra platform user editing via materials-designer. Stories: select an atom, move via gizmo, move via direct drag, edit exact coordinates, add/remove atoms, undo/redo, cancel an in-progress drag, keyboard workflows.
3. **Interaction model** — the full state machine (idle → hover → selected → pending-drag → dragging → dropped/cancelled), gizmo vs direct-drag coexistence, click/drag disambiguation threshold, drag-plane choice, cancel semantics, hotkeys. Grounded in the prior-art research; contested choices called out explicitly.
4. **UI spec with mockups** — toolbar layout, coordinate panel, units display, cursors/affordances, selection visuals. SVG mockups for each interaction state.
5. **Data flow & architecture** — pointer event → mixin → callbacks → React state → material rebuild → scene rebuild loop; `bypassReloadViewer`; undo/redo history model; where the current architecture stays vs changes.
6. **Host-app embedding API** — props/callbacks contract (material in, `onStructureModified`/`onSelectionChanged` out, controlled vs uncontrolled state), migration notes for materials-designer from the old `ThreejsEditorModal` contract.
7. **Defect register** — all 22 defects and 17 rough edges from the dossier, each with severity, status (live-confirmed vs code-read), and fix direction; the critical three (phantom-atom extraction, non-periodic crash, postMessage bridge) called out.
8. **Test pathways** — per-story mapping onto the existing Jest + jsdom + headless-gl stack (kept deliberately lightweight per earlier decision, no Cypress): state-level pointer-sequence tests, material-output tests, readPixels visual snapshots, and a short manual smoke checklist for what the stack can't prove. Includes the reusable helper design (`simulateAtomDrag`, `stubCanvasRect`, etc.) formalizing patterns the existing tests do by hand.
9. **Open design decisions** — the dossier's 12 decisions, each with options and a recommendation, for the user to resolve during spec review; the spec's implementation plan stays conditional on these where they bite.
10. **Implementation plan** — phased: **P0** critical + live-confirmed defects with regression tests (camera reset, phantom-atom extraction, non-periodic crash, dead hotkey, postMessage bridge); **P1** the delta-based-edit architecture change plus bringing current scope up to spec (affordances, drag-cancel, Ctrl+Z, hotkey wiring, remaining defect-register items); **P2** roadmap items.
11. **Roadmap (designed, deferred)** — rubber-band multi-select + group transforms (old-editor parity), element picker, clone atom, camera focus-on-selection, lattice/fractional snapping, keyboard nudge, multi-material story per decision #2.

### Process after approval

1. Write the spec using the research dossier (it will have completed by then; if any researcher failed, re-run just that agent via workflow resume).
2. User reviews the spec — no code changes until that review.
3. Implement per the spec's phased plan (P0 bug fixes first), each phase verified by the spec's own test matrix.

### Verification

- The spec renders correctly on GitHub (markdown + embedded SVGs).
- Every user story has: acceptance criteria, at least one mapped test pathway, and a mockup or state-diagram reference.
- Defect register is checked against the dossier — nothing the research surfaced is dropped silently.
- The two known bugs appear in P0 with concrete fix directions and named regression tests.
- `npm test` and `npm run lint` untouched by the spec itself (docs-only change).
