# CLAUDE.md — Oubaid Edits Portfolio Site

## Project description

A client-facing portfolio website for Oubaid Beldi ("Oubaid Edits"), a freelance video editor. Sent to prospective clients so they can see work organized by niche and decide to hire him. Niches: Cosmetic Dentistry, Meta Ads, Talking Heads, Podcast, Testimonials.

Sections: Hero (photo + bio, no reel yet), Work (video grid filterable by niche, unlisted YouTube embeds), How I Work / process, Numbers/stats, Client testimonials, FAQ, Contact form (Formspree).

## Hard constraints

- 100% free deployment, no ongoing costs.
- Do not use Netlify.
- No third-party SaaS holding the site's content — content lives as files in this repo, not in an external database.
- Every content type (bio, stats, testimonials, process steps, FAQ, work items, niches) must be fully CRUD-editable without touching code, via the Sveltia CMS dashboard at /admin.
- Each content type has exactly one required field (the minimum needed to function) — every other field optional. Enforced natively by Sveltia CMS's `required: true/false` config (it blocks saving an entry missing its required field) — not a build-time workaround. See "Data model" below for which field is required per collection.
- Single content editor (Oubaid himself) — no multi-user auth needed.
- Build locally first. No deploy until the end of Session 5 — Oubaid wants to confirm the UI and content look right before anything goes live. Sessions 1–4 are verified via `npm run dev` only.

## Confirmed design direction

Mockup 1 — "Cinematic Light." Light paper background, blue accents, clean/trustworthy first, cinematic second.

### Design tokens

| Token | Value | Use |
|---|---|---|
| --paper | #f7f8fb | Page background |
| --ink | #0d1526 | Primary text |
| --ink-soft | #4b5568 | Secondary text |
| --blue-600 | #1a56db | Primary accent, CTAs, links |
| --blue-700 | #12409e | Darker accent (icons, hover) |
| --blue-900 | #0b1a33 | Stats band background, gradients |
| --blue-100 | #e8f0fe | Chip/badge backgrounds |
| --blue-50 | #f4f8ff | Form input backgrounds |
| --line | #e3e7ef | Borders |

Radius: 16px cards / 10px buttons+inputs / 999px pills. Font: system sans stack. H1 ~52px/800/-0.03em. H2 ~36px/800. Eyebrow labels: 12.5px/700/uppercase/0.08em tracking. Section spacing: 88px vertical, 1180px max content width.

Component patterns: sticky blurred nav, hero split (headline+CTA left, photo card + floating stat badge right), pill niche-filter buttons, 3-col work grid with play-button overlay, 4-card process strip with watermark numerals, dark navy stats band, 3-col testimonial cards with star ratings, single-open FAQ accordion, 2-col contact panel.

Canonical visual reference: `mockup-1-cinematic-light.html` (attached in Session 1).

## Chosen stack

- **Astro** (static output) — zero JS by default, native Content Collections for local, schema-validated content.
- **Content storage:** Markdown/frontmatter files in `src/content/` — no external database. This is your source of truth.
- **Sveltia CMS** (free, open source) as the CMS dashboard at `/admin` — reads/writes those same content files via the GitHub API. Every save = a real git commit.
- **Auth:** a self-hosted Cloudflare Worker (`sveltia-cms-auth`, official open-source project) relays the GitHub OAuth login handshake. Stores no content. Runs on Cloudflare Workers' free tier.
- **Cloudflare** (free) for hosting — chosen over Vercel because Vercel's free Hobby plan restricts to non-commercial use only (this is a commercial site); chosen over Netlify per explicit constraint. Connected directly to the GitHub repo starting Session 5, for auto-deploy on every push — including CMS saves, since those are git commits too. No separate rebuild step needed. **Deployed as a Workers project serving static assets** (`wrangler.jsonc`, no `main` entry point — Cloudflare's current direct equivalent of the classic separate "Pages" product; see session-05 log for why), not the legacy distinct Cloudflare Pages product — same free tier, same zero-JS static hosting, just Cloudflare's current dashboard path for it.
- **Formspree** (free) for the contact form.
- **Unlisted YouTube embeds** for video samples.
- **GitHub** for source control and content storage.

Full reasoning: see the "Build Plan" page in this same Notion project.

## Data model

Content lives in `src/content/`. Sveltia CMS's `admin/config.yml` defines the same seven collections with matching fields — keep both in sync (see Conventions below).

| Collection | Type | Required field | Optional fields |
|---|---|---|---|
| Site | Singleton (one file) | Name | Headline, Subheadline, Bio, Photo, Email, Instagram Handle, Response Time Note |
| Niches | Folder | Name | Slug, Sort Order |
| Work | Folder | YouTube URL | Title, Niche (relation to Niches), Sort Order, Featured |
| Process | Folder | Title | Description, Sort Order |
| Stats | Folder | Value | Label, Sort Order |
| Testimonials | Folder | Quote | Name, Role/Company, Rating, Sort Order |
| FAQ | Folder | Question | Answer, Sort Order |

## Conventions

### Environment variables / secrets

- `PUBLIC_FORMSPREE_ENDPOINT` — the Formspree form endpoint URL. Set as a Cloudflare Pages build environment variable from Session 5 onward. Safe to expose client-side (Astro's `PUBLIC_` prefix convention) since it's already visible in the rendered HTML form action.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — credentials for the GitHub OAuth App used by the CMS login (corrected from this file's original placeholder names `GITHUB_OAUTH_CLIENT_ID`/`SECRET` — these are the exact names the `sveltia-cms-auth` Worker's source reads from `env`; see session-06 log). Set as **Secret**-type (encrypted) bindings on the `sveltia-cms-auth` Cloudflare Worker, under its Production environment specifically — never in the Astro project, never committed.
- A `.env.example` at the repo root documents the `PUBLIC_FORMSPREE_ENDPOINT` name with a placeholder value only.

### File structure

- src/content.config.ts (Astro Content Collections schema — Zod, mirrors the data model; not `src/content/config.ts` — Astro 7 requires this project-root-relative path, see session-02 log)
- src/content/site/ (singleton)
- src/content/niches/
- src/content/work/
- src/content/process/
- src/content/stats/
- src/content/testimonials/
- src/content/faq/
- src/pages/index.astro
- src/components/ (Nav, Hero, WorkGrid, Process, Stats, Testimonials, FAQ, Contact, Footer)
- src/styles/tokens.css (design tokens above)
- public/admin/index.html + public/admin/config.yml (Sveltia CMS dashboard, added Session 6; not a repo-root `admin/` — Astro's static build only copies `public/` verbatim into `dist/`, so anything outside it never reaches the live site. See session-06 log.)
- session-logs/session-NN-slug.md
- CLAUDE.md
- PUBLISHING.md (non-technical cheat sheet for Oubaid: logging into `/admin`, editing each of the seven content types, required-field quick reference — added Session 7)
- .env.example
- .nvmrc (pins Node for Cloudflare's build environment, added Session 5)
- wrangler.jsonc (static-assets-only Cloudflare deploy config, added Session 5 — see session-05 log)

### Commit message format

Conventional Commits: `type(scope): summary` — types: feat, fix, chore, docs, style, refactor. Example: `feat(work): wire video grid to Work content collection`.

### End-of-session protocol

Every session ends by:

1. Overwriting the "Current status" section below with: what's working now, what was completed this session, what's next.
2. Writing `/session-logs/session-NN-short-slug.md` covering: goal, what was built, decisions/tradeoffs made, any deviation from the Build Plan, open issues, exact starting point for next session.
3. Committing with a Conventional Commits message and pushing to GitHub.
4. Confirming the site still works: via the local dev server (`npm run dev`) for Sessions 1–4, or via the live Cloudflare Pages URL from Session 5 onward.

### Keeping config in sync

`src/content.config.ts` (Astro's schema) and `admin/config.yml` (Sveltia CMS's form definition) describe the same seven collections. Any time a field is added/renamed/removed in one, update the other in the same session — never leave them out of sync.

## Session logs

See `/session-logs/` in the repo, one file per session, newest = current state. Read all of them (not just this file) before starting any session.

## Current status

(Overwrite this section at the end of every session — this is the only part of this file expected to change often.)

**Session 7 complete — the site is fully built and polished.** All hard
constraints from CLAUDE.md are met, the site has a real responsive pass
(not just the mockup's single tablet breakpoint), SEO/social meta tags,
and a non-technical publishing guide for Oubaid. Nothing structurally
blocking remains; the only explicitly out-of-scope item is a custom
domain (optional Session 8, only if Oubaid acquires one).

**Live site:** https://oubaid-edits.oubaidbeldi.workers.dev
**CMS dashboard:** https://oubaid-edits.oubaidbeldi.workers.dev/admin/
**Publishing guide:** `PUBLISHING.md` at the repo root (non-technical,
written for Oubaid — how to log in, edit each content type, and the
required field per collection).

**What was built this session:**
- **Real mobile breakpoints, not just the mockup's one tablet cutoff.**
  Every component already had the mockup's single `@media(max-width:900px)`
  breakpoint (ported verbatim in Session 1), which turns 3/4-col grids
  into 2-col but was never actually checked at phone widths — this
  session added narrower breakpoints (mostly 560–600px and 420–480px)
  across Hero, WorkGrid, Process, Stats, Testimonials, and Contact so
  grids drop to 1-col, padding tightens, and text sizes step down on an
  actual phone screen. Verified visually at 375px, 320px (the narrowest
  common phone width), and the 768–900px tablet zone via Playwright
  screenshots against the running dev server — no horizontal overflow at
  any width tested.
- **Fixed a real mobile bug: the nav's hamburger button did nothing.**
  Since Session 1, `.mobile-toggle` existed with an `aria-label` but no
  click handler — on any screen under 900px wide, the nav links
  (`nav ul`) were hidden by CSS and there was no way to reach them except
  the "Get in touch" CTA. Added a functional mobile menu: a full-viewport
  takeover panel (not a small dropdown — see gotcha below) that opens on
  tap, closes when a link is clicked, and keeps `aria-expanded` in sync.
- **Gotcha: `backdrop-filter` on an ancestor breaks `position: fixed`
  children.** First implementation nested the mobile menu inside
  `<header>` and gave it `position: fixed; inset: 0`, expecting it to
  cover the full viewport. It didn't — it collapsed to `header`'s own
  ~74px shrink-wrapped height instead. Root cause: per spec, an element
  with `backdrop-filter` (or `transform`, `filter`, `will-change`, etc.)
  set to anything other than `none` becomes the **containing block** for
  its `position: fixed` descendants, same as `transform` does — and
  `header` already has `backdrop-filter: blur(10px)` for its translucent
  sticky-nav look (Session 1). Confirmed via `getBoundingClientRect()` in
  a live Playwright session (the panel's rect was `{top:0, bottom:120}`,
  not `{top:0, bottom:812}`) before understanding why. Fixed by moving the
  mobile menu to a sibling `<div id="mobileNavPanel">` outside `<header>`
  entirely, so its `position: fixed` containing block is the viewport as
  expected. Worth remembering if `backdrop-filter` or similar is ever
  added to another ancestor of a fixed-position element.
- **SEO + social meta tags** (`src/layouts/Layout.astro`, now takes
  `title`/`description`/`image` props instead of just `title`): meta
  description, canonical URL, Open Graph (`og:type`, `og:site_name`,
  `og:title`, `og:description`, `og:url`, `og:image`), Twitter Card tags,
  `theme-color`, and favicon `<link>` tags (the `favicon.ico`/`.svg`
  files already existed in `public/` since Session 1's Astro scaffold but
  were never actually linked from `<head>` — first time they're used).
  Added `site: 'https://oubaid-edits.oubaidbeldi.workers.dev'` to
  `astro.config.mjs` so `Astro.site` resolves for canonical/OG absolute
  URLs. `og:image`/`twitter:image` are generated from the Site entry's
  Photo via `getImage()` in `index.astro` — confirmed via `astro build`
  that the static output resolves to a real hashed `/_astro/....jpg` path,
  not the dev-only `/_image` transform endpoint (the same distinction
  Session 5 hit with the hero photo).
- **Accessibility fixes**, mostly found via a Lighthouse pass against the
  static build (see below): added a `<main>` landmark around the page's
  primary sections (Nav and Footer stay outside it); `aria-expanded` +
  `aria-controls` on the FAQ accordion buttons; `aria-pressed` on the
  Work niche filter buttons; `aria-label` on Contact's form fields (they
  only had `placeholder`, which isn't a real accessible name); `aria-hidden`
  on purely decorative elements (Contact's icon glyphs, Testimonials'
  avatar circle, Process's watermark numerals); `role="img"` +
  `aria-label` on Testimonials' star rating (a plain `div` can't take
  `aria-label` without a role — first attempt failed Lighthouse's
  `aria-prohibited-attr` audit); a more descriptive Hero photo alt text
  (`Photo of {name}` instead of just `{name}`).
- **YouTube embeds switched to `youtube-nocookie.com`** (privacy-enhanced
  mode) instead of `youtube.com` — reduces third-party cookie-setting on
  page load. Flagged by Lighthouse's Best Practices audit
  (`inspector-issues`); a same-origin cookie notice from YouTube itself
  still appears even on the nocookie domain (inherent to embedding any
  YouTube content, not fixable from this repo) but this is still a real
  improvement over the default domain.
- **`PUBLISHING.md`** added at the repo root — a non-technical cheat
  sheet for Oubaid: how to log into `/admin`, how editing/creating/
  deleting entries works per collection, a one-line required-field
  reference table for all seven collections, and an explicit note that
  saves go live automatically within a minute or two (no separate
  rebuild step) since every CMS save is a real GitHub commit that
  Cloudflare's connected build auto-deploys.

**Lighthouse pass** (mobile config, run via `npx lighthouse` against the
static `astro build` output served by `astro preview`, not the dev
server — the dev server's unbundled/unminified output wouldn't reflect
what's actually deployed):
- Before fixes: Performance 98, Accessibility 90, Best Practices 96, SEO 100.
- After fixes: Performance 98, **Accessibility 96**, **Best Practices 96**
  (same score, but the underlying YouTube-cookie note changed from
  default-domain to nocookie-domain), SEO 100.
- **Two audits deliberately left failing, both reviewed and judged not
  worth "fixing" at the cost of correctness or design intent:**
  - `color-contrast` on Process's watermark numerals (`#e8f0fe` on white,
    ~1.14:1). This is CLAUDE.md's own confirmed design language — "4-card
    process strip with **watermark numerals**" — a deliberately faint
    decorative background number, now also marked `aria-hidden="true"`
    this session to formalize that it's non-content. WCAG 1.4.3 itself
    exempts "text that is purely decorative and not intended to be read
    (e.g., watermark text)" from the contrast requirement — this is a
    named example in the spec, not a workaround. Cranking up the color to
    satisfy automated tooling would fight the confirmed mockup rather
    than fix a real accessibility problem.
  - `inspector-issues` (Cookie) on the two YouTube embeds — see above;
    inherent to embedding YouTube content at all, and Work section video
    embeds are an explicit, non-negotiable part of CLAUDE.md's chosen
    stack ("Unlisted YouTube embeds for video samples").
- Followed the instruction to fix real issues without chasing a perfect
  score: the two `aria-prohibited-attr` and `landmark-one-main` findings
  (both real, both cheap, both fixed above) were addressed; these two
  were reviewed and consciously left as-is instead.

**`/admin` on a phone-width viewport:** Sveltia CMS's own login screen
renders responsively out of the box (single-column, full-width tappable
buttons, verified via Playwright at 375px) — this is Sveltia's own UI,
not something this repo's code controls beyond `config.yml`'s field
definitions, which don't affect layout. Full editing-UI verification
(post-login) on a real phone is still worth Oubaid double-checking
firsthand next time he's editing content from his phone, since GitHub
OAuth login can't be completed non-interactively in this environment.

**Gotcha carried forward for future sessions:** `astro dev`'s dev server
404s on `/admin/` (needs the explicit `/admin/index.html` path) — this is
a dev-server-only quirk in how it resolves directory-index requests for
`public/`-copied static files; `astro preview` (serving the real
`dist/` build) and the live Cloudflare deployment both correctly resolve
`/admin/` to `/admin/index.html` with a `200`, matching Session 6's
confirmed live behavior. Not a bug, just don't be alarmed by a 404 on
`localhost:4321/admin/` specifically during `npm run dev`.

**Not yet started:** custom domain (optional Session 8, only if Oubaid
has acquired one by then). No other explicitly-deferred items remain.

**Auth Worker:** https://sveltia-cms-auth.oubaidbeldi.workers.dev (Oubaid's
fork of github.com/sveltia/sveltia-cms-auth)

**Optional cleanup, not blocking, carried forward from Sessions 5–6:**
the main site's Worker may still list unused `env.SESSION`/`env.IMAGES`
bindings from Session 5's broken first deploy attempt, and the
`sveltia-cms-auth` fork has a handful of throwaway troubleshooting
commits from Session 6. Both harmless, no cost, purely cosmetic
tidiness if Oubaid ever wants to clean them up.
