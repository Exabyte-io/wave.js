# Workplan: acting on the 2026-08 codebase status analysis

Source of findings: [`docs/codebase-status-2026-08.md`](../docs/codebase-status-2026-08.md).
Branch: `claude/codebase-fixes-msgl9u`, chained off `claude/codebase-status-analysis-msgl9u`
(which is chained off the editor stack tip `1eefe20` / PR #212), following the repo's
existing chained-PR convention.

## Ordering principle

Hygiene and CI first, dependencies second, defects third. Rationale: the CI job added
in batch B is what proves every later batch. Doing the defects first would mean fixing
code with no gate to keep it fixed.

## Batch A — repo hygiene (no behavior change)

- [x] **A1** `.gitignore`: drop the bare `plan` entry. It silently swallowed every new
      file under `plan/`, including this workplan.
- [x] **A2** Untrack `dist/`. `git rm -r --cached dist`, add to `.gitignore`, drop
      `npm run transpile && git add dist` from `.husky/pre-commit`, and build in the
      publish job instead. Removes 2 of PR #212's 4 conflicting files and 43% of
      historical commit churn (74 of 174 commits touched `dist/`).
- [x] **A3** Un-LFS `tests/fixtures/**`. `.gitattributes` scoped to binaries only
      (`*.png`, `*.snap`); the 769-byte `material.json` and `FeO.json` become normal
      blobs. Without this, a clone with no `git-lfs` fails all 13 suites at parse time.

## Batch B — make CI tell the truth

- [x] **B1** Fix the 19 eslint errors. 13 are `class-methods-use-this` on mixin-factory
      methods (`labels/`, `lines/`, `listeners/`, `measurements/base.ts`), 5 are
      `no-restricted-syntax`/`no-continue` in `viewSettingsUrl.ts`, 1 is prettier.
- [x] **B2** Add a `verify` job to `.github/workflows/cicd.yml`: `npm ci && npm run lint
      && npx tsc --noEmit && npm run build` on plain `ubuntu-latest`. No Docker, no GL.
      This is the gate that was missing — the `js/validate` step it replaces has been
      commented out ("Failing due to Node-Gyp") long enough for 19 errors to accumulate.
- [x] **B3** `Dockerfile`: `npm ci` instead of `npm install --legacy-peer-deps`, so the
      committed lockfile is actually exercised and CI builds are reproducible.
- [x] **B4** `jest.config.js`: `collectCoverageFrom` → `src/**/*.{js,jsx,ts,tsx}` and a
      `coverageThreshold` floor at the measured baseline, to ratchet up. The current
      JS-only glob reports ~9% for a codebase measuring 82.3%.

## Batch C — dependency and packaging cleanup

- [x] **C1** Remove six declared dependencies with zero import sites: `moment`,
      `underscore.string`, `sprintf-js`, `classnames`, `@mui/styles`, `@mui/lab`.
- [x] **C2** Drop `underscore` (critical advisory GHSA-cf4h-3jhx-xvhq, arbitrary code
      execution) — one import site, `SquareIconButton.tsx`.
- [x] **C3** Drop `jquery` — three call sites in `ThreeDEditor.jsx`, all
      `parseFloat($(e.target).val())` → `e.target.value`.
- [x] **C4** Move `typescript` and `pixelmatch` from `dependencies` to `devDependencies`.
      Consumers currently install the TypeScript compiler.
- [x] **C5** Align `@types/three` with `three`. Types are at `0.173`, runtime at `0.140`
      — 33 minors of drift, already leaking (`THREE.Object3DEventMap` in `atoms.ts:147`
      does not exist in 0.140).

## Batch D — defects

- [x] **D-vdw** Van der Waals radii have never been applied: `settings.ts` builds a
      positional array, `atoms.ts` indexes it by element symbol, so every atom renders
      at `sphereRadius` (1.5) regardless of element. Fix the map shape, add a unit test
      asserting radius ordering across elements, and regenerate the visual baselines
      (which encode the bug as correct). **Visual change — flagged for review.**
- [x] **S-1** `WaveComponent.reloadViewer` swallows every exception into `console.warn`,
      justified by a stale comment about headless tests having no WebGL. Tests now use
      real `headless-gl`. Remove the catch so render failures surface.
- [x] **S-2** `_handleResizeTransition`'s 500ms `setTimeout` is never cleared; unmount
      inside the window runs `handleResize()` on a disposed renderer.
- [x] **S-3** `createRotatingGifData` mutates `orbitControls.autoRotate`/`autoRotateSpeed`
      with no `try/finally`; a throw mid-capture leaves the viewer permanently rotating.
- [x] **S-4** Remove cargo-cult canvas calls in `image.js`: `getContext("2d")` on a
      WebGL canvas returns `null`, and `canvas.willReadFrequently = true` sets a
      meaningless property.
- [x] **S-6** `_applyInitialToggleSettings` silently drops URL view settings forever if
      the `Wave` instance is not ready; give it one retry once the instance exists.
- [x] **S-7** Cap the unbounded `historyStack` (full `Material` clones per edit).
- [x] **S-9** Delete dead surface from the removed modal editor: `.cm-editor` guards ×2,
      99 of 496 lines of `#threejs-editor` CSS, `materialsToThreeDSceneData`,
      `handleSetMaterial`, and rename `renderWaveOrThreejsEditorModal`.
- [x] **Docs** Rewrite `AGENTS.md` for this repo (keep the OOP/mixin section verbatim,
      translate naming rules to JS/TS, add the missing "how to run the tests" section)
      and correct the stale README and `package.json` URLs.

## Deliberately not in this branch

- **S-5 — scope hotkey listeners to the container.** `document`-level `keypress`/`keydown`
  per instance collides with our own D-2 resolution (materials-designer composing several
  `ThreeDEditor`s). But scoping to the container changes focus semantics — the container
  needs to become focusable, and today's hotkeys fire regardless of focus. That is a
  behavior change needing its own design pass and its own review, not a drive-by.
- **`ThreeDEditor.jsx` → `.tsx` and the 1,519-line split.** `src/components/ThreeDEditor.jsx`
  is already one of PR #212's four conflicting files. Rewriting it now would turn a
  tractable conflict into an intractable one. This must land *after* the stack merges.
- **Landing the stack / the `@mat3ra/cove` migration / sequencing PR #202.** These are
  release decisions across five open PRs plus another team's branch, not fixes. The cove
  jump is `@exabyte-io/cove.js@2025.2.22-0` → `@mat3ra/cove@2026.7.18-4` — ~17 months of
  drift across 9 import sites, needing its own branch and its own verification.
- **Merging the 13 open Dependabot PRs.** Actions on existing PRs, not code changes here.
- **React 18 / enzyme → `@testing-library/react`.** The largest single item in the report
  and its own project.

## Verification gate

Every batch must leave all four green, checked before commit:

```
npx eslint src tests          # 0 errors
npx tsc --noEmit              # exit 0
xvfb-run -s "-ac -screen 0 1024x768x24" npx jest    # 13/13 suites
npm run build
```
