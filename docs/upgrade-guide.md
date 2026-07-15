# Releasing a New Version

::: warning Maintainer documentation
This page is for whoever maintains this repository and publishes its packages to npm. It isn't linked from the public docs nav — it's here for reference, not for library consumers.
:::

This repo publishes **6 independent npm packages** from one monorepo, and the entire release process is automated end to end. You almost never run a publish command yourself — you describe *what changed*, and the automation figures out version numbers, changelogs, and the actual `npm publish` calls.

## The packages

| Package | What it is |
|---|---|
| `@anil-labs/lightbox-gallery-core` | The engine. Every other package depends on it. |
| `@anil-labs/lightbox-gallery-react` | React bindings |
| `@anil-labs/lightbox-gallery-vue` | Vue 3 bindings |
| `@anil-labs/lightbox-gallery-svelte` | Svelte bindings |
| `@anil-labs/lightbox-gallery-solid` | Solid bindings |
| `@anil-labs/lightbox-gallery-element` | Framework-agnostic Web Component |

They version **independently** — a `core`-only bugfix doesn't have to bump `react`, unless `react`'s own code changed too. The one exception: when `core` bumps, every binding that depends on it (via `workspace:^`) automatically gets a patch bump too, just to keep its declared dependency on `core` in sync — see [`updateInternalDependencies`](#how-versions-are-decided) below.

## The tools involved

- **[Changesets](https://github.com/changesets/changesets)** (`@changesets/cli`) — decides version numbers and writes changelogs. Config lives in `.changeset/config.json`.
- **GitHub Actions** (`.github/workflows/release.yml`) — runs Changesets in CI so nothing has to happen on your laptop.
- **npm** — the actual registry packages get published to, authenticated via the `NPM_TOKEN` repository secret.

## The two-phase flow

Releasing always happens in two steps, spread across two separate merges to `main`:

### Phase 1 — Queue the release (you do this per change)

1. Make your code change as normal (new feature, bug fix, etc.) on a branch/PR.
2. Before merging, run:

   ```bash
   pnpm changeset
   ```

   This asks two things, interactively:
   - **Which package(s) changed?** (space to select, enter to confirm)
   - **Is this a patch, minor, or major?** — following normal semver: `patch` for fixes, `minor` for new backwards-compatible features, `major` for breaking changes.

   It then writes a small file into `.changeset/`, e.g.:

   ```md
   ---
   '@anil-labs/lightbox-gallery-core': minor
   ---

   Add a `theme` option (`'dark' | 'light' | 'auto'`).
   ```

   Note there's **no version number in this file** — just intent. The actual number gets computed later.

3. Commit that generated `.changeset/*.md` file along with your code change, and merge to `main` as usual.

::: tip Skip this step for non-user-facing changes
Pure internal housekeeping — bumping a devDependency, tweaking CI, fixing a typo in a comment — doesn't need a changeset. Only add one when something actually ships to consumers of the npm package.
:::

### Phase 2 — Actually release (happens automatically, you just merge one PR)

Once anything with a pending changeset lands on `main`, `release.yml` notices and opens (or updates) a pull request titled **"Version Packages"**. This PR is created by `github-actions[bot]`, and it contains:

- Every affected package's `package.json` bumped to its new, computed version
- A new entry in each affected package's `CHANGELOG.md`
- The `.changeset/*.md` file(s) deleted (their intent has now been "spent")

You can keep merging other feature PRs to `main` in the meantime — every new changeset just gets folded into this same PR, updating it in place. **Nothing gets published yet.** This PR is a preview/staging area you review before committing to a release.

When you're ready to actually ship a release:

**Merge the "Version Packages" PR.**

That's the entire release command. There is no CLI step. Merging it triggers `release.yml` one more time — but this time there are no pending changesets left, so it takes the *other* branch of the workflow: it runs `pnpm build` (in correct dependency order — `core` first, then everything that imports its types) followed by `changeset publish`, which pushes every bumped package to npm and creates a git tag per package.

## How versions are decided

- The bump type you pick (`patch`/`minor`/`major`) is applied on top of whatever version is *currently* in that package's `package.json` — Changesets does the semver math, you never hand-edit a `version` field.
- `.changeset/config.json` has `"updateInternalDependencies": "patch"` — this is why bumping `core` automatically patch-bumps `react`/`vue`/`svelte`/`solid`/`element` too, even with no changeset of their own targeting them: their dependency on `core` changed, so they need a new version to reflect it.
- `"access": "public"` in the same config is required because these are scoped packages (`@anil-labs/...`) — without it, npm would try to publish them as private (which fails for a scope on a free plan).

## Verifying a release actually worked

Don't only trust a green checkmark on the Actions run — this repo has hit two cases where the workflow *reported* success without a real, complete publish (an OIDC auth path silently not completing, and a `prepack` race that let 2 of 6 packages fail mid-publish while the run still went green). Always cross-check the registry directly:

```bash
npm view @anil-labs/lightbox-gallery-core version
npm view @anil-labs/lightbox-gallery-react version
# ...repeat for each package touched by the release
```

If a version is missing or stale, check the run's log for the `changesets/cli` publish step — it prints an explicit `packages failed to publish:` list when something goes wrong partway through. Re-pushing to `main` after fixing the underlying issue is safe: Changesets checks each package's version against what's *actually* on npm and only retries the ones that are genuinely missing.

## Known gotchas (already fixed here, documented in case they resurface)

| Symptom | Cause | Fix |
|---|---|---|
| `GitHub Actions is not permitted to create or approve pull requests` | Repo setting blocks Actions from opening PRs, regardless of the workflow's own `permissions:` block | Settings → Actions → General → Workflow permissions → enable "Allow GitHub Actions to create and approve pull requests" |
| `No NPM_TOKEN found, but OIDC is available — using npm trusted publishing` | `changesets/action` checks its own `NPM_TOKEN` env var (distinct from the `NODE_AUTH_TOKEN` npm itself reads); without it, it silently tries OIDC trusted publishing, which can't work until each package has a Trusted Publisher registered on npm (impossible before a package's first publish) | Set both `NODE_AUTH_TOKEN` and `NPM_TOKEN` env vars on the `changesets/action` step to the same `secrets.NPM_TOKEN` |
| `Cannot find module '@anil-labs/lightbox-gallery-core' or its corresponding type declarations` during lint or publish | A package that imports `core`'s types couldn't resolve them because `core` hadn't been built yet at that point in the workflow | Keep `Build` before `Lint`/`Typecheck` in CI; don't add per-package `prepack: pnpm run build` hooks — the top-level `pnpm build` (part of `pnpm release`) already builds everything, in the correct order, exactly once |
| `Get Pages site failed... Not Found` on the Docs workflow | GitHub Pages was never enabled for the repo | Enable Pages with source set to "GitHub Actions" (Settings → Pages, or `POST /repos/{owner}/{repo}/pages` with `build_type: workflow`) |

## Quick reference

```bash
# 1. Describe what changed (per PR that needs a release)
pnpm changeset

# 2. Merge that PR to main as usual — nothing publishes yet

# 3. When ready to ship: merge the "Version Packages" PR on GitHub
#    (no local command — this is a PR merge, not a CLI step)

# 4. Verify
npm view @anil-labs/lightbox-gallery-core version
```
