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
- [~] **A2** ~~Untrack `dist/`~~ — **reverted on request (batch E).** `dist/` is consumed
      directly from the repository by other packages, so it has to stay tracked; the
      pre-commit hook keeps it in sync with `src/` as before. The observation stands that it
      accounts for two of PR #212's four merge conflicts and 43% of commit churn (74 of 174
      commits), but that is the accepted cost of git-installable consumption. `prepack` is
      kept so a published tarball always carries a freshly-built `dist/` regardless.
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

- [~] **C1** Remove declared dependencies with zero import sites. `underscore.string` and
      `sprintf-js` are gone. **`moment`, `classnames`, `@mui/styles` and `@mui/lab` were
      wrongly removed and have been restored (batch E):** wave.js does not import them, but
      they are `@mat3ra/cove`'s `peerDependencies`, and this project installs with
      `--legacy-peer-deps` (the publish action passes it explicitly), which does not
      auto-install peers. `dev` declares all four for the same reason. The original analysis
      checked wave.js's imports and not its peer's requirements.
- [~] **C2** Drop `underscore` — one import site, `SquareIconButton.tsx`. The rewrite stands
      (one fewer direct import), but the **declaration was restored (batch E)**: it is also a
      cove peer. It never cleared the advisory anyway, for the separate reason below.
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
      ⚠️ **Baselines outstanding — see "One step left" below.**
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
      470 of 496 lines of `#threejs-editor` CSS, `materialsToThreeDSceneData`,
      `handleSetMaterial`, and rename `renderWaveOrThreejsEditorModal`.
- [x] **Docs** Rewrite `AGENTS.md` for this repo (keep the OOP/mixin section verbatim,
      translate naming rules to JS/TS, add the missing "how to run the tests" section)
      and correct the stale README and `package.json` URLs.

## Batch E — `@mat3ra` scope migration, and two corrections

- [x] **E1** Migrate off the `@exabyte-io` scope, matching `dev` (`#205`/`#206`): package
      renamed `@mat3ra/wave.js`, `@exabyte-io/cove.js` → `@mat3ra/cove@2026.7.18-4` in peer
      and dev dependencies, `prestart`'s `npm-link-shared` path, all 8 source import sites,
      `jest.config.js`'s `transformIgnorePatterns`, and the README badge/install/linking
      instructions. Every import path and export shape was verified against the new package
      before migrating; all were compatible.
- [x] **E2** Drop the untranspiled-source import. `AlertProvider` was imported from
      `@exabyte-io/cove.js/src/theme/provider` because it was not in that version's `dist/`.
      In `@mat3ra/cove` it ships from `dist/theme/provider` alongside the default
      `ThemeProvider` export, so the two collapse into one `dist/` import. This was the sole
      reason wave.js forced a bundler exception on its consumers.
- [x] **E3** Restore `dist/` tracking (see A2) — other packages consume it from the repo.
- [x] **E4** Restore the four `@mat3ra/cove` peer packages wrongly pruned in C1, plus
      `underscore` from C2 (see those entries).

## Deliberately not in this branch

- **S-5 — scope hotkey listeners to the container.** `document`-level `keypress`/`keydown`
  per instance collides with our own D-2 resolution (materials-designer composing several
  `ThreeDEditor`s). But scoping to the container changes focus semantics — the container
  needs to become focusable, and today's hotkeys fire regardless of focus. That is a
  behavior change needing its own design pass and its own review, not a drive-by.
- **`ThreeDEditor.jsx` → `.tsx` and the 1,519-line split.** `src/components/ThreeDEditor.jsx`
  is already one of PR #212's four conflicting files. Rewriting it now would turn a
  tractable conflict into an intractable one. This must land *after* the stack merges.
- **Landing the stack / sequencing PR #202.** These are release decisions across five open
  PRs plus another team's branch, not fixes. (The `@mat3ra` scope migration was originally
  listed here too; it has since been done on request — see batch E.)
- **Merging the 13 open Dependabot PRs.** Actions on existing PRs, not code changes here.
- **Clearing the transitive `underscore` critical.** Requires `@mat3ra/periodic-table` to stop
  depending on `underscore@1.8.3`, and its current release does not install standalone (see
  above). Work for that repo.
- **React 18 / enzyme → `@testing-library/react`.** The largest single item in the report
  and its own project.

## Verification gate

Every batch must leave all four green, checked before commit:

```
npm run lint                  # 0 errors
npx tsc --noEmit              # exit 0
xvfb-run -s "-ac -screen 0 1024x768x24" npx jest    # all suites
npm run build
```

## One step left: regenerate the visual baselines

**17 snapshot tests fail on this branch, expectedly.** Atoms legitimately render larger after
the vdW fix, and the baselines were generated with the bug in place, so they encode it as
correct. The regeneration was done and visually verified locally — only sphere radii changed,
with cell wireframes, positions and colors pixel-identical — but the baselines are LFS-tracked
and **this environment cannot write LFS objects**: `lfs.github.com` returns a 403 organization
policy denial. They were dropped from the commit rather than half-landed.

Un-LFSing them was considered and rejected: 1.2 MB across 18 images against a 1.43 MB pack, and
every future refresh would add another ~1.2 MB to history permanently. LFS is correct for these.

To finish, from an environment with LFS write access:

```bash
docker-compose build && docker-compose run test   # writes the .actual.png files
./move-actual-expected.sh forward
# diff each image: atoms larger, everything else identical
git add tests/__tests__/__snapshots__/expected && git commit
```

The four unit tests in `tests/__tests__/mixins/atoms.js` prove the fix independently of the
images, which is why they were written that way.

## Outcome

| | before | after |
|---|---|---|
| `npm run lint` errors | 19 | **0** (and now `--report-unused-disable-directives`) |
| `tsc --noEmit` | clean, against types 33 minors ahead of runtime | clean, against matching types |
| tests | 183 (181 passing, 2 skipped) | **187 (185 passing, 2 skipped)** |
| coverage reported | ~9% (JS-only glob) | **82.9% stmts / 69.4% branch**, with a floor |
| CI gates | containerized tests only | + lint, typecheck, build on every push |
| tracked build output | 129 files in `dist/` | 129 files (kept, by design — E3) |
| runtime dependencies | 19 | **15** (3 genuinely unused dropped, `typescript`/`pixelmatch` moved to dev) |
| prod-tree vulnerabilities | 13 (2 critical, 7 high) | **13 — unchanged, see below** |
| `main.css` | 496 lines, 470 of them dead | **26 lines** |
| package scope | `@exabyte-io/wave.js` + `cove.js@2025.2.22-0` | **`@mat3ra/wave.js` + `cove@2026.7.18-4`** |
| imports from a dependency's `src/` | 1 (forced a bundler exception downstream) | **0** |

**The vulnerability count did not move, and the status report was over-optimistic about why it
would.** Dropping the direct `underscore` dependency removed wave.js's own use of it, but the
critical advisory (GHSA-cf4h-3jhx-xvhq) comes from `@mat3ra/periodic-table@2025.1.18-1`, which
pulls `underscore@1.8.3` transitively — and periodic-table is a production dependency, so the
critical is still in the prod tree. `npm audit`'s suggested remedy is
`@mat3ra/periodic-table@2026.2.6-0`, which **does not install**: its own prepare step fails with

```
src/js/index.ts(3,33): error TS2732: Cannot find module '../../periodic-table.json'.
                       Consider using '--resolveJsonModule'
tsconfig-transpile.json(2,16): error TS6053: File
                       '@mat3ra/tsconfig/tsconfig-js-py-transpile.json' not found
```

So clearing this critical is work in the `periodic-table` repo — fixing that package's publish
— not a bump here. Added to the not-in-this-branch list. The remaining highs are all in
transitive dev tooling (babel, eslint's ajv, brace-expansion, minimatch, picomatch, js-yaml)
and are what the open Dependabot PRs address.

Notes worth carrying forward:

- The status report undercounted the dead CSS as "99 of 496 lines". 99 was the number of
  `#threejs-editor` string occurrences; the actual dead block was 470 lines. Corrected in
  `docs/codebase-status-2026-08.md`.
- The vdW fix needed no `atomRadiiScale` retune after all: at the default 0.2 the largest
  sphere pair spans 0.84 A against a 2.368 A nearest-neighbour distance.
- Aligning `@types/three` to the runtime surfaced two latent type errors the drifted types had
  been masking (`THREE.Object3DEventMap`, an unchecked `raycaster.params.Line` dereference).
  Both fixed rather than suppressed.
- `move-actual-expected.sh` was silently a no-op — it looked for baselines one directory above
  where they live. Fixed; it had presumably not worked since the baselines moved into
  `expected/`.
- The `@mat3ra` scope migration is done (batch E), so this branch no longer conflicts with
  `dev` on package naming. It still differs from `dev` on `three`: this branch uses stock
  `^0.140.2` where `dev` still pins the `npm:@exabyte-io/three@2023.8.23-0` fork. That swap was
  analysed as safe for this codebase's usage during the PR #204 review and is deliberately kept.
