# AGENTS.md

Architecture and conventions for AI coding agents working in **wave.js** — a TypeScript/React
library for 3D atomic visualization and editing, built on THREE.js and Made.js.

> This file previously carried the conventions of a C++/DFT engine project verbatim (MPI
> rank-0 logging, GTest layouts, pseudopotential naming, `snake_case` variables and file
> names). The OOP guidance below transferred well and is kept. The rest has been replaced with
> what this codebase actually is and does.

## Running the code

Two environment prerequisites bite before anything else, and neither is optional:

```bash
# 1. The visual baselines in tests/__tests__/__snapshots__/expected/ are in Git LFS.
git lfs install && git lfs pull

# 2. The test suite renders through headless-gl, which needs a real GL context.
#    On Linux: mesa + xvfb (see Dockerfile for the exact package list).
xvfb-run -s "-ac -screen 0 1024x768x24" npm test
```

Both matter, and they fail differently. Without `git-lfs` the baselines stay 130-byte pointer
stubs, `PNG.sync.read` cannot parse them, and all 17 visual tests fail — but every other suite
passes, so a green-looking partial run is the signal to check LFS first. (Fixtures under
`tests/fixtures/` are plain JSON and no longer LFS-tracked; the older "fails at parse time on a
fixture" symptom is gone.) Without a GL context every `Wave`-constructing test fails in
`initRenderer`. `docker-compose run test` wraps both.

The four checks that must be green before any commit — the same four CI runs:

```bash
npm run lint        # 0 errors; warnings are tolerated (mostly no-explicit-any)
npx tsc --noEmit
xvfb-run -s "-ac -screen 0 1024x768x24" npm test
npm run build
```

## Architecture

`Wave` (`src/wave.js`) is a `WaveBase` — renderer, scene, cameras, lights — composed with
domain mixins via `mixwith`. Each mixin owns one concern: `AtomsMixin`, `BondsMixin`,
`CellMixin`, `ControlsMixin`, `BoundaryMixin`, `RepetitionMixin`, labels, measurements, and the
interactive editor (`InteractiveStructureEditorMixin` plus `MarqueeSelectionMixin` and
`GroupTransformMixin`). Mixin construction order matters: the editor mixin's constructor runs
last and calls `initializeEditor()`, by which point the others have set their own state.

React wrappers live in `src/components/`. `WaveComponent` owns the `Wave` instance lifecycle;
`ThreeDEditor` is the toolbar, coordinate panel, undo/redo history and host-app API surface.
`src/exports.js` is the package entry point — anything a host needs must be exported there.

Editing is **delta-based**: apply the known change to the known material. Do not reintroduce
"re-derive the whole material from the THREE.js scene on every edit" — that pattern was the
root of a whole cluster of defects and was deliberately removed. See
`docs/design/interactive-editor-spec.md`, which is the authority for editor behavior.

## Design patterns

- **Factory**: when multiple implementations are possible.
- **Object-oriented design**: define abstract interfaces for components with multiple
  implementations.
- **Composition over inheritance** for combining behaviors: use mixins, as the whole `Wave`
  class does, rather than deep inheritance hierarchies.

### OOP guidelines and antipatterns

**Prefer polymorphism over type-checking chains.** Instead of:

```ts
// ❌ ANTIPATTERN: long if-chain checking object type
if (label.isElementLabel()) {
    text = formatElement(object);
} else if (label.isDistanceLabel()) {
    text = formatDistance(object);
}
```

Use:

```ts
// ✅ CORRECT: polymorphic dispatch via an overridden method
const text = label.getLabelTextFromLabeledObject(object);
```

That is exactly how `src/mixins/labels/` works: `base.ts` declares
`getLabelTextFromLabeledObject` abstract and each label type overrides it. `class-methods-use-this`
is switched off for `src/mixins/**` in `.eslintrc.json` because a base or hook implementation
legitimately ignoring `this` is the point of that design.

**Key principles:**

- **Single Responsibility**: each class does one thing. If a class reads, computes and writes,
  split it.
- **Open/Closed**: add behavior by adding classes, not `if` branches to existing ones.
- **Interface Segregation**: keep interfaces small.
- **No `is_xxx()` type queries**: if you need `isElementLabel()`, you probably need a virtual
  method.
- **Use factories** to build the right subclass from runtime configuration.

**But do not split a unified state machine for tidiness.** `beginAtomDrag_`/`endAtomDrag_`/
`cancelAtomDrag_` deliberately handle all four drag shapes (single/group × direct/gizmo)
together, because they genuinely are one state machine and the Esc-cancel correctness surface
lives there. Readability is not worth trading correctness for.

## Naming

**camelCase** for variables, functions, methods, and fields. **PascalCase** for classes, types,
and interfaces.

**Full, descriptive names — no abbreviations.** This matters as much in a physics codebase as
in an engine:

- ❌ `nkp`, `ib`, `ia`, `et`, `radiimap`, `vdw`
- ✅ `numberOfKpoints`, `bandIndex`, `atomIndex`, `eigenvalues`, `radiiMap`,
  `vanDerWaalsRadius`
- ❌ `Vec3`, `Mat3`
- ✅ `Vector3D`, `Matrix3x3` (`THREE.Vector3` etc. are the library's own names — leave those)

Exceptions are permitted for widely-known physical or mathematical notation, but spell it out
where you can, and make the meaning obvious from context.

**Private members use a trailing underscore**: `selectedMeshes_`, `isEditModeEnabled_`,
`transformDragStartPosition_`. Note that `WaveBase` predates this rule and uses a leading
underscore (`_structure`, `_cell`); do not add new leading-underscore fields, and prefer
trailing when touching existing code near them.

**File naming is currently inconsistent** — `interactive_structure_editor.ts` (snake),
`LinesManager.ts` (Pascal), `viewSettingsUrl.ts` (camel). For new files: **PascalCase for
files whose default export is a class or React component**, **camelCase otherwise**. Do not
rename existing files opportunistically; they are load-bearing in an open PR stack.

## Comments

Explain **why**, not what. The valuable comments in this codebase record the invariant a
reader would otherwise break — why `collectSelectableAtoms()` takes only the first
`ATOM_GROUP_NAME` group, why `vdwRadii` must stay symbol-keyed, why a `finally` is there.
Prefer those over restating the code.

- Multiline docblocks put `/**` on its own line:

```ts
// ✅ CORRECT
/**
 * Compute the centroid of the current selection.
 */

// ❌ INCORRECT
/** Compute the centroid of the current selection.
 */
```

- Use `//` for inline implementation comments. Never use bare `/* ... */` for documentation.

## Testing

- Tests live in `tests/__tests__/`, mirroring `src/`. Every module in `src/` should have a
  corresponding test module.
- Fixtures go in `tests/fixtures/` (plain JSON — not LFS). Visual baselines go in
  `tests/__tests__/__snapshots__/expected/` (PNG — LFS).
- Jest setup: `tests/setupFiles.js` (environment, headless-gl renderer override) is the only
  setup file — `jest.config.js` declares no `setupFilesAfterEnv`. Reusable editor helpers are in
  `tests/helpers/editor.js`.
- Wave-class tests are asynchronous — use `async`.
- **A bug fix ships with a regression test proven to fail before the fix.** Stash the source
  change and watch the test go red; that is the house standard, not a suggestion.
- Visual snapshot tests compare rendered PNGs with a pixelmatch tolerance (`threshold: 0.7`),
  because line rendering varies across platforms — the same cell edges draw solid on one mesa
  and dashed on another, worth thousands of pixels. Regenerate baselines with
  `./move-actual-expected.sh forward` — but only when the committed baselines passed unmodified
  in the same environment immediately beforehand, and always diff the new images visually.
  Prove the first part rather than assuming it: revert only the source change under test, run
  the suite, and confirm the committed baselines pass. Note that `0.7` is loose enough to hide
  a real change (a 37.7% increase in painted geometry once passed unflagged), so a passing
  visual test does not by itself mean the render is unchanged.
- Prefer tests that do not need a GL context where the logic does not need one; they are far
  faster and run anywhere.

## Linting and formatting

ESLint (`@exabyte-io/eslint-config`, airbnb-derived) plus Prettier. `npm run lint` runs with
`--report-unused-disable-directives`, so a stale `eslint-disable` is an error — remove it
rather than leaving it. `npm run lint:fix` autofixes. Husky runs `lint-staged` pre-commit.

## Hard rules

### 1. Never commit without an explicit ask

Leave changes in the working directory for the user to review.

### 2. All scratch files go in `agents/workdir/tmp/`

The repository root stays clean and contains only tracked project files. Debug helpers, patch
scripts, one-off analysis scripts, throwaway test snippets — all of it goes in
`agents/workdir/tmp/` (create it if missing). Reusable agent artifacts go in
`agents/workdir/reusable/`; cross-project ones in `agents/plan/`. `agents/` is gitignored.
Project plans and workplans belong in `plan/`, which **is** tracked.

### 3. Never commit generated output

`dist/` is gitignored and built at publish time via `prepack`. Do not re-add it: committing it
produced spurious merge conflicts, shipped stale type declarations, and touched 74 of the
repository's first 174 commits.

### 4. Respect the open PR stack

Large refactors of files with unmerged changes — `src/components/ThreeDEditor.jsx` above all —
turn tractable merge conflicts into intractable ones. Check what is in flight before
restructuring a file.
