# Wave.js — status of the tip and what to do about it

**Date:** 2026-08-12 · **Tip analyzed:** `1eefe20` (`docs/resolve-d2-multi-material-decision`, PR [#212](https://github.com/mat3ra/wave.js/pull/212)) · **Baseline:** `origin/dev` @ `0ee31b6`

Everything below was verified by running it, not read off a plan. Commands and outputs are quoted where the claim depends on them.

---

## 0. Verdict

The editor work is good. 183 tests, 82.3% real statement coverage, `tsc --noEmit` clean, a maintained defect register, decisions logged with dates and rationale, and a delta-based edit architecture that was the right call over re-deriving the material from scene meshes.

The problem isn't the work — it's that **none of it can land**. PR #212 is `mergeable_state: dirty`, 9,657 additions across 61 files and 17 commits, sitting behind a `dev` that has since renamed the package scope. Every additional feature round has made the merge harder, and two of the four conflicting files are generated build output we commit for no reason.

So the priority order is: **unblock the merge, make CI tell the truth, then fix the real bug I found.**

---

## 1. Verified status of the tip

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (exit 0) |
| `xvfb-run npx jest` | **13/13 suites, 181 passed, 2 skipped** |
| Coverage (`src/**/*.{js,jsx,ts,tsx}`) | **82.33% stmts / 69.39% branch / 77.33% funcs** |
| `npx eslint src tests` | **19 errors, 72 warnings** ← the plan says 0 errors; it's stale |
| `npm run transpile` | clean; committed `dist/` matches source |
| `npm audit` (prod tree) | **13 vulns — 2 critical, 7 high** |
| `npm audit` (all) | **65 vulns — 5 critical, 27 high** |

Two environment traps stand between a fresh clone and a green suite, and both hit before a single test runs:

1. **`tests/fixtures/**` is in Git LFS.** Without `git-lfs` installed, `material.json` — a **769-byte** JSON file — is a pointer stub, and **all 13 suites fail to parse** with `SyntaxError: Unexpected token 'v', "version ht"...`. LFS is right for the `.expected.png` baselines. It is wrong for a sub-1KB fixture.
2. **The entire suite needs a real GL context** (`headless-gl` + mesa + `xvfb`). Basis math, selection state, undo history, URL settings parsing — all of it is coupled to a GPU because every test goes through a constructed `Wave`.

Neither is a code defect. Both are why "does it work?" costs 20 minutes instead of 20 seconds, for a human or an agent.

---

## 2. The merge problem (this is the actual blocker)

### 2.1 The stack

```
dev ← #204 (feat/upgrade-2026-07-11-separated, open since 2026-07-12)
      ← #207 (onEditCommit)
        ← #208 (basis unit conversion)
          ← #209 (mixin split)
            ← #210 (D-2 docs)
#212: same head as #210, but based on dev — the "land it all" PR. 61 files, +9,657/-1,151, 17 commits.
```

`#212` is **`dirty`** — it does not merge. Conflicts, from `git merge-tree`:

```
dist/components/ThreeDEditor.js      ← generated
package-lock.json                    ← generated
package.json
src/components/ThreeDEditor.jsx      ← the only one a human should be resolving
```

**Half the conflict surface is build output we chose to track.**

### 2.2 `dev` moved underneath us

`dev` gained three commits: `840e482` (consume cove from `@mat3ra` scope) and `89d9068` (migrate package to `@mat3ra` scope), merged as `#206`.

| | this branch | `origin/dev` |
|---|---|---|
| package name | `@exabyte-io/wave.js` | `@mat3ra/wave.js` |
| cove | `@exabyte-io/cove.js@2025.2.22-0` | `@mat3ra/cove@2026.7.18-4` |
| three | `^0.140.2` (stock) | `npm:@exabyte-io/three@2023.8.23-0` (fork) |

That is a rename **plus ~17 months of cove drift**, across **9 import sites** in `src/`. One of them reaches into a dependency's untranspiled source:

```js
// src/components/ThreeDEditor.jsx:7
import { AlertProvider } from "@exabyte-io/cove.js/src/theme/provider";
```

Every other cove import uses `dist/`. That single `src/` import is why `jest.config.js` has to special-case `@exabyte-io/cove.js` in `transformIgnorePatterns`, and it will force the same exception on every downstream bundler.

The `three` fork→stock swap is separately worth pulling out. The review concluded it's safe for this codebase's actual usage, and I believe that analysis — but it is a runtime-behavior change to the transform gizmo landing invisibly inside a 9.6k-line diff. It deserves its own commit with its own message.

### 2.3 PR #202 is aimed at the same target

[#202 (SOF-7926)](https://github.com/mat3ra/wave.js/pull/202) adapts wave.js to Made's `getBasis`/`getLattice` API — the exact accessors the entire editor stack is built on (`material.Basis`, `material.Lattice`, `basis.cell.convertPointToCrystal`). Open since 2026-06-22, touched 2026-08-04. Two long-lived branches, one surface. **Whoever lands second pays for both.** Pick the order now and write it on both PRs.

---

## 3. A real bug: van der Waals radii have never been applied

**Every atom renders at the same size regardless of element.** In an atomic viewer, sphere size is the primary visual cue for element identity — this is a scientific-correctness defect, not cosmetics.

`src/settings.ts:12` builds a **positional array**:

```ts
const vdwRadiiMapAngstrom = Object.keys(PERIODIC_TABLE).map(
    (key) => PERIODIC_TABLE[key].van_der_Waals_radius_pm / 100,
);   // → [1.2, 1.4, 1.82, ...] indexed 0..117
```

`src/mixins/atoms.ts:143` indexes it **by element symbol**:

```ts
return (radiimap[element] || this.settings.sphereRadius) * scale;
//      radiimap["Si"] === undefined, always → falls back to sphereRadius (1.5)
```

Verified against a live `Wave` instance:

```
RADII: {"Si":1.5,"H":1.5,"U":1.5,"sphereRadius":1.5,"vdwIsArray":true,"vdwLen":118}
```

Hydrogen and uranium are the same size. The 118-entry table is computed correctly and then thrown away on every lookup.

The snapshot tests cannot catch this — the `.expected.png` baselines were generated with the bug in place, so they encode it as correct.

**Fix:**

```ts
const vdwRadiiMapAngstrom = Object.fromEntries(
    Object.keys(PERIODIC_TABLE).map((symbol) => [
        symbol,
        PERIODIC_TABLE[symbol].van_der_Waals_radius_pm / 100,
    ]),
);
```

Two things to handle deliberately alongside it, which is why this is P2 and not a drive-by: **(a)** every visual snapshot baseline will legitimately change and needs regenerating with eyes on the diff; **(b)** current effective radius is `1.5 × atomRadiiScale(0.2) = 0.30`, real vdW is ~1.2–3.0 Å, so `atomRadiiScale` needs retuning or atoms will overlap. Add a unit test asserting `getAtomRadiusByElement("H") < getAtomRadiusByElement("U")` so this can't silently regress again.

---

## 4. Other defects found

Numbered `S-n` to avoid colliding with the spec's own D-register.

| # | Where | Issue |
|---|---|---|
| **S-1** | `WaveComponent.jsx:105` | `reloadViewer` wraps everything in `try/catch → console.warn`, justified by a comment about headless tests having no WebGL. Tests now use real `headless-gl`. In production this silently swallows genuine render failures and leaves the viewer stale. Narrow it or delete it. |
| **S-2** | `WaveComponent.jsx:99` | `_handleResizeTransition` fires `setTimeout(…, 500)` and never stores or clears the handle. Unmount within 500ms → `handleResize()` runs on a disposed renderer. |
| **S-3** | `image.js:47-77` | `createRotatingGifData` mutates `orbitControls.autoRotate`/`autoRotateSpeed` with no `try/finally`. A throw mid-capture leaves the viewer permanently auto-rotating at a modified speed. Coverage here is **4.4%**. |
| **S-4** | `image.js:18`, `:41` | `canvas.getContext("2d", …)` on a canvas that already holds a WebGL context returns `null` — a no-op. `canvas.willReadFrequently = true` sets a meaningless property (`willReadFrequently` is a `getContext` attribute). Both are cargo cult. |
| **S-5** | `ThreeDEditor.jsx:185`, `:336` | Hotkey listeners are attached to `document` per instance (`keydown` + capture-phase `keypress`). Two mounted editors both handle Delete/Ctrl+Z. This collides head-on with our own D-2 resolution, which puts multi-material editing in materials-designer **composing multiple single-material `ThreeDEditor`s**. Scope them to the container. |
| **S-6** | `ThreeDEditor.jsx:195` | `_applyInitialToggleSettings` returns early if `this.WaveComponent?.wave` isn't ready, with no retry — URL-shared view settings are then silently dropped forever. |
| **S-7** | `ThreeDEditor.jsx` | `historyStack` grows without bound; each entry is a full `Material.clone()`. A long session on a few-thousand-atom structure is a memory problem. Cap it (50 is generous) and drop the oldest. |
| **S-8** | `jest.config.js:14` | `collectCoverageFrom: ["src/**/*.js"]` measures **only the JS half** of a codebase that is now 4,424 lines TS vs 3,265 JS. Reported coverage is ~9%; **real coverage is 82.3%**. The config is both hiding good news and hiding the actual gaps: `image.js` 4.4%, `MeasurementSettingsHandler.ts` 42.9%, `as_points.ts` 0%, `ParametersMenu.tsx` 0%. |
| **S-9** | multiple | Dead surface left from the removed modal editor: `.cm-editor` guards ×2 (CodeMirror is gone — deps and CSS were already removed), `renderWaveOrThreejsEditorModal()` (there is no modal), **99 of 496 lines** of `#threejs-editor` CSS in `main.css`, `handleSetMaterial`, and `materialsToThreeDSceneData` in `src/utils.js` — which constructs a whole WebGL `Wave` just to serialize scene JSON, is not in `exports.js`, and has no remaining caller. |

---

## 5. Toolchain and supply chain

**CI verifies almost nothing.** `cicd.yml` runs exactly one thing: `docker run wave:latest test`. No `lint`, no `tsc --noEmit`, no `npm run build`, no audit. The `js/validate` step that would have covered it is commented out — *"Failing due to Node-Gyp"*. That's why the 19 lint errors are on the tip with nobody noticing:

- **13 × `class-methods-use-this`** across `labels/`, `lines/LinesManager.ts`, `listeners/mixins.ts`, `measurements/base.ts` — these are mixin-factory methods, so either add the rule override for that pattern or make them static. Pick one and be consistent.
- **5 in `viewSettingsUrl.ts`** — `no-restricted-syntax` ×2, `no-continue` ×3.
- **1 prettier** formatting error, auto-fixable.

**CI doesn't use the lockfile.** `Dockerfile` runs `npm install --legacy-peer-deps`, not `npm ci`. The committed `package-lock.json` — 960KB of it, and a conflict source — is never exercised. Every CI run resolves fresh versions. Builds aren't reproducible.

**Dependency debt:**

- **13 open Dependabot PRs**, oldest from **2025-03-10** (~17 months). Several are security bumps: `form-data`, `tar-fs`, `brace-expansion`, `sha.js`, `pbkdf2`, `js-yaml`, `qs`.
- `underscore` carries a **critical** advisory (arbitrary code execution) and has **exactly one import site** — `SquareIconButton.tsx`. Cheapest critical-severity fix on the board.
- `typescript` is in **`dependencies`**, not `devDependencies`. Every consumer of this package installs the TypeScript compiler.
- **`@types/three@0.173` against `three@0.140`** — 33 minors of drift. Already leaking: `atoms.ts:147` uses `THREE.Object3DEventMap`, a type that doesn't exist in 0.140. `tsc` is validating against an API generation the runtime doesn't have.
- Declared but with **zero import sites**: `moment`, `underscore.string`, `sprintf-js`, `classnames`, `@mui/styles`, `@mui/lab`.
- `jquery` has 3 call sites, all `parseFloat($(e.target).val())` → `e.target.value`. Delete the dependency.
- `pixelmatch` is a test tool sitting in `dependencies`.
- `files` ships **both** `/dist` and `/src` — doubling package size and enabling exactly the `cove.js/src/...` deep-import pattern we're now paying for.

**Frozen frontend stack:** React 17, enzyme, jest 27, eslint 7, prettier 2. **Enzyme is the single blocker on React 18/19** — it's unmaintained and has no React 18 adapter. This gets more expensive every month the platform stays on 17.

---

## 6. Process and conventions

**`AGENTS.md` is the other project's file, verbatim.** It's a C++/DFT engine document: MPI rank-0 logging, GTest under `tests/unit/`, pseudopotentials, ESSE JSON schema rules, `snake_case` for variables *and file names*, trailing-underscore members, `Vector3D`/`Matrix3x3` naming.

In a TypeScript/React repo this doesn't just fail to help — it actively misdirects, and the drift is already visible in the tree:

- **File naming is three-way split:** `interactive_structure_editor.ts` (snake) · `LinesManager.ts` (Pascal) · `viewSettingsUrl.ts` (camel).
- **Private markers are two-way split within one class hierarchy:** `wave.js` uses `_structure`, `_cell`, `_resizeObserver` (leading); the editor mixins use `isEditModeEnabled_`, `selectedMeshes_`, `transformDragStartPosition_` (trailing, the C++ rule).

The OOP section is the part worth keeping — polymorphism over type-checking chains, single responsibility, composition via mixins. That's exactly right for this codebase and the mixin split (TB-ARCH-2) already followed it. The rest needs translating to JS/TS, and the doc needs the one section it's missing: **how to actually run the tests here** (`git-lfs install && git lfs pull`, then `xvfb-run`).

**`dist/` is tracked in git.** `.husky/pre-commit` runs `npm run transpile && git add dist`. **74 of 174 commits touch `dist/`.** That's how the stale `dist/exports.d.ts` shipped (caught in the PR #204 review), and it's producing half the conflicts on #212 right now.

**`.gitignore` has a bare `plan` entry** — already-tracked files are fine, but any *new* file under `plan/` is silently ignored.

**README is stale:** clone URL points at `Exabyte-io/wave`, `package.json` `repository`/`bugs` still say `Exabyte-io`, the mixin list doesn't match `src/`, `WaveComponent` is documented as an export though `exports.js` exports only `ThreeDEditor` and the two URL helpers, and the TODO list still reads "React Three Fiber, scripting console" — the scripting console was deliberately removed.

---

## 7. What to do, in order

### P0 — unblock the merge (this week)

1. **Untrack `dist/`.** `git rm -r --cached dist`, add to `.gitignore`, drop `git add dist` from `.husky/pre-commit`, build in the publish job. This removes 2 of the 4 conflicts on #212 immediately and 43% of historical commit churn. Do this first — it makes step 2 smaller.
2. **Land the stack.** Merge `dev` in, do the `@mat3ra/cove` migration as its own first commit (9 import sites, plus dropping the `cove.js/src/...` deep import in favour of `dist/`), pull the `three` fork→stock swap into its own commit with its own message, then squash-land #212. Close #204/#207/#208/#209/#210 as superseded so the queue stops lying about what's in flight.
3. **Sequence #202.** Decide whether the Made `getBasis`/`getLattice` migration lands before or after the editor stack, and comment the decision on both PRs.

### P1 — make CI tell the truth (a day)

4. **Add a `verify` job** to `cicd.yml` on plain `ubuntu-latest` + node — `npm ci && npm run lint && npx tsc --noEmit && npm run build`. No Docker, no GL needed, ~2 minutes. Fix the 19 lint errors first.
5. **`npm ci` in the Dockerfile**, not `npm install --legacy-peer-deps`.
6. **Fix `collectCoverageFrom`** to `src/**/*.{js,jsx,ts,tsx}` and set a floor at the measured 80%/65%, ratcheting up.
7. **Un-LFS `tests/fixtures/**`.** Scope `.gitattributes` to binaries only (`*.png`, `*.snap`). A fresh clone should run the suite.
8. **Merge the security Dependabot PRs**; drop `underscore` (1 site), `jquery` (3 calls), and the six zero-site dependencies; move `typescript` and `pixelmatch` to `devDependencies`; align `@types/three` to `three@0.140`.

### P2 — the bug and the debt (next sprint)

9. **Fix the vdW radii bug** (§3), regenerate snapshot baselines deliberately, retune `atomRadiiScale`, add the ordering test.
10. **Split the test suite in two.** `jest.config.logic.js` — no GL, no xvfb: mixin math, history, selection state, URL settings. `jest.config.visual.js` — headless-gl snapshots, Docker only. Run the first on every push. This is what makes the feedback loop usable for humans and agents alike.
11. **`ThreeDEditor.jsx` → `.tsx`, and split it.** 1,519 lines, 62 methods, `UNSAFE_componentWillReceiveProps`. It's the largest untyped surface in the package and the only real obstacle to React 18. Per `AGENTS.md`'s own single-responsibility rule: `EditorHistory` (undo/redo/stack, also where S-7's cap lives), `ViewSettingsController`, `EditToolbar` (the ~250-line render block), `useEditorHotkeys` scoped to the container (fixes S-5), leaving a thin shell.
12. **Clear S-1 through S-9** — most are single-digit-line fixes.
13. **Type `settings.ts`.** It's a bare untyped object literal that every consumer overrides blind. An exported `WaveSettings` interface would have caught the vdW bug at compile time.

### P3 — strategic

14. **React 18.** Enzyme → `@testing-library/react` is the prerequisite and the bulk of the work. Every month costs more.
15. **Rewrite `AGENTS.md` for this repo.** Keep the OOP/mixin section, translate naming to JS/TS, replace GTest/MPI with jest/eslint/husky, and add the missing "how to run the tests" section.
16. **Close out D-1, D-3, D-5, D-6, D-7, D-8.** Six open decisions, all mine to make. Every remaining P2 editor item is gated on them — and "one more feature round before merge" is precisely what produced a 9.6k-line unmergeable PR. Decide, then ship in slices that fit in one review.

---

## 8. What's working — keep doing it

- The delta-based edit architecture (apply the known delta to the known material) was the correct call and dissolved the D1/D5/D6/D7/D9 defect cluster as a class, exactly as the dossier predicted.
- Every review finding got a regression test **proven to fail pre-fix**. That's the standard.
- Independently re-verifying review findings rather than trusting them — and finding that one of them broke an existing test — is the right instinct, and worth writing down as policy.
- The decision register with dates, rationale, and explicit out-of-scope calls (D-2, D-11) is genuinely good practice. It should outlive this feature.
- Choosing *not* to split `beginAtomDrag_`/`endAtomDrag_`/`cancelAtomDrag_` because they're one real state machine — refusing a refactor that trades correctness for tidiness — is the right judgment.
