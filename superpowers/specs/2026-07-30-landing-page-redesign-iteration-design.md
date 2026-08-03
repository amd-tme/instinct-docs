# Landing page redesign iteration (MAT-49 follow-on)

**Branch:** `melliott/mat-49-adopt-upstream-instinct-theme-flavor-from-rocm-docs-core`
**Scope:** `docs/index.md` (the landing page) only. Every interior content page keeps the stock `instinct-design` flavor rendering as-is — no changes to `html_theme_options`, other page templates, or the sidebar behavior on any page but the landing page.

## Background

MAT-49's core scope (swap vendored CSS/JS for the upstream `instinct-design` flavor) is implementation-complete and already reviewed as low-risk. Follow-on commits (`46c7e43`, `1739620`) redesigned the landing page into a card-grid layout. This spec covers the next iteration on that landing page, converging on a "modern, well-designed" result per direct feedback from Matt.

Decisions below came out of a brainstorming session comparing the live site (instinct.docs.amd.com) against local builds of this branch in Playwright, plus review of `docs/sphinx/_toc.yml` and `docs/conf.py`.

## Decisions

### 1. Eyebrow copy (small-caps labels above section headings)

- Cut the `REFERENCE` eyebrow above "Common Reference" entirely — it's a verbatim restatement of the heading, adds no information.
- Trim `START HERE · MAINTAINED CONTINUOUSLY` (above "System Administrators") to `START HERE` — "MAINTAINED CONTINUOUSLY" duplicates the subhead's own claim ("...the most frequently updated content on this site") one line below.
- Keep the hero eyebrow (`AMD INSTINCT™ · DATA CENTER GPU`) and the bottom-banner label (`INDUSTRY SOLUTIONS`) unchanged — both convey information nothing else on the page states as directly.

### 2. Industries/Verticals: demote from featured section to a single external nav link

Industries/Verticals (Computer Vision, Data Science, Finance, Life Science, Simulation & Modeling apps) is the only non-infrastructure content in this repo. It has no assigned owner today and is slated to move to its own repo, assumed for planning purposes to be `github.com/ROCm/gsid-verticals-docs` (placeholder — this repo does not exist yet; update the link once a real destination is confirmed).

- In `docs/sphinx/_toc.yml`, replace the entire `Industries/Verticals` caption block (currently five nested subtrees under `vision/`, `data-science/`, `life-science/`, `finance/`, `isv-apps/`) with a single external-link entry, following the existing pattern used for "HIP C++" / "AMD-SMI":

  ```yaml
  - caption: Industries/Verticals
    entries:
      - url: https://github.com/ROCm/gsid-verticals-docs
        title: Industries & Verticals
  ```

- Do **not** delete the local `docs/vision/`, `docs/data-science/`, `docs/life-science/`, `docs/finance/`, `docs/isv-apps/` content — it stays in the repo, just drops out of the sidebar/nav. Real content migration is separate future work once an owner exists.
- On the landing page itself, remove the dedicated Industries/Verticals card section and bottom banner; it now gets the same plain-link treatment as any other subpage, not a featured landing element.

### 3. Landing-page layout: reclaim the sidebar's width with a functional sticky rail, not a wider stretch

Sidebar-visibility scope, confirmed via testing: the theme's collapse toggle does not persist across page loads, so removing the sidebar via `html_sidebars = {"index": []}` in `conf.py` is safely scoped to the landing page only — interior pages are unaffected.

Tested finding: removing the sidebar alone does **not** reflow the content wider — it leaves a large dead strip of unused background on the right and doesn't reduce page height. The removal must be paired with an explicit width/layout change to be worth doing.

**Approach chosen (recommended "C + A" from the options presented):**

- Widen the landing page's main content container to use the space freed by the removed sidebar.
- Add a sticky right-hand "On this page" rail to the landing hero, jumping to the page's own sections (System Administrators, Common Reference, Industries/Verticals link, etc.) — reusing the same pattern already used for the "Contents" rail on interior content pages, rather than inventing new hero content.
- Widen the card grid from 3 columns to 4 columns per row in the body sections, directly cutting vertical scroll length.

Explicitly deferred (not in this pass): a two-column hero with an invented stat/visual panel (the "B" option) — held in reserve as a phase-2 idea if the rail+grid approach still feels flat once built, since it requires inventing new content (stat numbers, a diagram) that doesn't exist today.

### 4. Collapsed-by-default subgroups (carried from the earlier review, still valid)

The three System Administrators subgroups (Bare Metal / Containers & Orchestration / Cluster, Cloud & Virtualization) are already built as accordions (`46c7e43`). Default them to collapsed — measured ~350px of page height saved per group in Playwright testing, directly addressing the "quite a bit of scroll" complaint independent of the sidebar/width changes above.

## Out of scope for this pass

- Any change to interior/content-page templates, sidebar behavior, or theme options.
- Actually migrating Industries/Verticals content to a new repo (blocked on an owner being assigned).
- The two-column hero with a stat/visual panel (deferred, see above).
- Fixing the pre-existing jQuery `ReferenceError` console errors from `rocm_docs_theme`'s static JS (tracked separately per the 2026-07-23 Linear review comment on MAT-49).

## Verification plan

Rebuild locally (`SSL_CERT_FILE=/home/matt/corp-certs.crt REQUESTS_CA_BUNDLE=/home/matt/corp-certs.crt .venv/bin/python -m sphinx -b html docs docs/_build/html`) and compare against the pre-change snapshot at `docs/_build/html_before_landing_redesign/` (served on port 8130) via Playwright screenshots — desktop (1440×900), mobile (390×844), and dark mode. Confirm interior pages (e.g. `gpu-arch/mi300-mi200-performance-counters.html`) are visually unchanged from the pre-existing build.
