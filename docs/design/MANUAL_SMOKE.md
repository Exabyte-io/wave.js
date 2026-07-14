# Manual smoke checklist — interactive structure editor

Companion to [interactive-editor-spec.md §8.1](./interactive-editor-spec.md#81-what-the-stack-can-and-cannot-prove).
The Jest + jsdom + headless-gl stack proves the interaction state machine, `Made.Material`
output, and real-pixel rendering — it structurally cannot prove real browser event ordering,
CSS layout, GPU/driver rendering, pointer-capture semantics, focus/IME routing, or scrolled-
container coordinates. This is the entire cost of not having an E2E layer: run it against a
real browser before a release and before regenerating any `*.expected.png` snapshot.

**Setup:** `npm start`, open `http://localhost:3002/wave.js/`, load a structure, enter edit mode.
Budget: ~10 minutes.

- [ ] **Event ordering (TransformControls / OrbitControls / React).** Drag a gizmo handle
      slowly; confirm the orbit camera stays frozen for the whole drag and the atom moves
      smoothly with no jitter or fighting between the gizmo and a React re-render mid-drag.
- [ ] **CSS layout / canvas offset / resize / DPR.** Resize the browser window and, separately,
      toggle OS/browser zoom (non-1:1 devicePixelRatio). Click and drag atoms near each canvas
      edge after each change — the click target and the drag tracking must stay pixel-accurate,
      not just centered.
- [ ] **GPU/driver rendering.** Eyeball the current `tests/__tests__/__snapshots__/expected/*.png`
      fixtures rendered live in this browser (or open them directly) — shading/AA may differ
      slightly from CI's Mesa/Xvfb render, but atom positions, highlight rings, and gizmo
      geometry must match. Flag anything beyond a rendering-quality difference before trusting
      a snapshot regenerated here.
- [ ] **Pointer capture / drag-leaves-canvas.** Start dragging an atom, move the pointer outside
      the canvas bounds, and release the mouse button there. Re-enter the canvas and move the
      mouse without pressing anything — the drag must be over; the atom must not still be
      tracking the cursor.
- [ ] **Focus / hotkey routing / IME.** Click into a coordinate field and type a value containing
      "e" and digits, including a leading "-" — no viewer hotkey (edit-mode toggle, delete, etc.)
      should fire while the field has focus. If available, test an IME composition (e.g. accented
      character) in the same field without it leaking a stray keystroke to the viewer.
- [ ] **Scrolled-container coordinate drift.** Embed or resize the page so the viewer's container
      is scrolled (not flush with the browser viewport origin) and click/drag an atom — selection
      and drag tracking must land on the actual atom, not an offset position.
- [ ] **US-5 direct drag, real mouse.** Click-and-drag an atom directly (not the gizmo) with the
      real mouse: no start-of-drag jump to the cursor, orbit controls stay frozen for the whole
      drag, and when the gizmo and the atom body overlap under the cursor, the gizmo wins.
- [ ] **US-5 drag-out-and-release.** Drag an atom out past the canvas edge and release there, then
      move the mouse back over the canvas without pressing anything — confirm no stuck-drag state
      (the earlier pointer-capture item, isolated to this specific US-5 acceptance criterion).
