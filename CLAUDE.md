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

Mockup 7 — "Refined Slate/Blue Palette" (final, Aug 21 2026 — supersedes Mockup 1). Same structure/layout as the originally confirmed Mockup 1, plus two additions: a global scroll-driven timeline scrubber bar, and a warm near-black dark mode — layered on top of a refined light-mode color system (slate grays + vivid blue instead of the original blue/navy set). Sessions 1–7's layout needed no rework; Session 8 added the scrubber, the light/dark theme toggle, and updated the light-mode token values.

**Hero copy (updated Aug 21, 2026, live since Session 8):** Headline "Probably **your last video editor.**" / Subheadline "I'm Oubaid — I edit video for dentists, agencies, podcasters, and founders who need content that actually gets clients to say yes." Site collection's existing Headline/Subheadline fields — editable via `/admin`.

### Design tokens

| Token      | Value   | Use                              |
| ---------- | ------- | -------------------------------- |
| --paper    | #f8fafc | Page background                  |
| --ink      | #0f172a | Primary text                     |
| --ink-soft | #64748b | Secondary text                   |
| --blue-600 | #2563eb | Primary accent, CTAs, links      |
| --blue-700 | #1d4ed8 | Darker accent (icons, hover)     |
| --blue-900 | #0f172a | Stats band background, gradients |
| --blue-100 | #dbeafe | Chip/badge backgrounds           |
| --blue-50  | #eff6ff | Form input backgrounds           |
| --line     | #e2e8f0 | Borders                          |

### Dark mode tokens

Applied under a `data-theme="dark"` attribute on `<html>` (added Session 8). Warm near-black palette; blue accent values shift lighter for contrast against the dark background. `--header-bg`/`--scrubber-bg` are new tokens (translucent blurred backgrounds for the nav and scrubber bar) with no light/dark-shared name — they're defined directly per theme.

| Token                | Light value          | Dark value           |
| --------------------- | -------------------- | --------------------- |
| --paper                | #f8fafc               | #0c0b0a                |
| --white (cards/panels) | #ffffff                | #17140f                |
| --blue-50 (inputs)     | #eff6ff                | #151b2b                |
| --ink                  | #0f172a                | #eee7db                |
| --ink-soft              | #64748b                | #8c8375                |
| --blue-600              | #2563eb                | #3b82f6                |
| --blue-700              | #1d4ed8                | #2f6fe0                |
| --blue-900              | #0f172a                | #0b1a33                |
| --blue-100              | #dbeafe                | #1b2740                |
| --line                  | #e2e8f0                | #35301f                |
| --header-bg             | rgba(248,250,252,.85) | rgba(12,11,10,.85)     |
| --scrubber-bg           | rgba(248,250,252,.92) | rgba(12,11,10,.92)     |

Theme resolution: a manually-saved choice in `localStorage` (`theme` key) takes precedence; otherwise falls back to `prefers-color-scheme`. Set via a small inline `<script>` early in `Layout.astro`'s `<head>`, before first paint, to avoid a flash of the wrong theme. Toggle button lives in `Nav.astro` (inline SVG sun/moon icons, no new dependency).

Radius: 16px cards / 10px buttons+inputs / 999px pills. Font: system sans stack. H1 ~52px/800/-0.03em. H2 ~36px/800. Eyebrow labels: 12.5px/700/uppercase/0.08em tracking. Section spacing: 88px vertical, 1180px max content width. JetBrains Mono (Google Fonts) is scoped narrowly to the scrubber's label/timecode, eyebrow labels, the hero kicker pill, and process-step numerals — never used for headings or body copy.

Component patterns: a global scroll-driven timeline scrubber bar (pulsing dot + mono label + progress fill + live mm:ss counter), fixed 34px tall, pinned above the nav in both themes, added Session 8 (`src/components/Scrubber.astro`); sticky blurred nav (top offset 34px, sitting below the scrubber, added Session 8 — was `top: 0` through Session 7), hero split (headline+CTA left, photo card + floating stat badge right), pill niche-filter buttons, 3-col work grid (real YouTube embeds, not the mockup's play-button-overlay placeholder — see session-03 log), 4-card process strip with watermark numerals, dark navy stats band, 3-col testimonial cards with star ratings, single-open FAQ accordion, 2-col contact panel.

Canonical visual reference: `mockup-7-refined-palette.html` (attached Session 8) — final layout, palette, scrubber, and dark mode all in one file. `mockup-1-cinematic-light.html` (attached Session 1, since removed from the repo) documented the original Sessions 1–7 layout only.

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

- `PUBLIC_FORMSPREE_ENDPOINT` — the Formspree form endpoint URL. Set as a Cloudflare Workers build environment variable from Session 5 onward. Safe to expose client-side (Astro's `PUBLIC_` prefix convention) since it's already visible in the rendered HTML form action.
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
- src/components/ (Scrubber, Nav, Hero, WorkGrid, Process, Stats, Testimonials, FAQ, Contact, Footer — Scrubber added Session 8)
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
4. Confirming the site still works: via the local dev server (`npm run dev`) for Sessions 1–4, or via the live Cloudflare Workers URL from Session 5 onward.

### Keeping config in sync

`src/content.config.ts` (Astro's schema) and `admin/config.yml` (Sveltia CMS's form definition) describe the same seven collections. Any time a field is added/renamed/removed in one, update the other in the same session — never leave them out of sync.

## Session logs

See `/session-logs/` in the repo, one file per session, newest = current state. Read all of them (not just this file) before starting any session.

## Current status

(Overwrite this section at the end of every session — this is the only part of this file expected to change often.)

**Session 8 complete — the live site now fully matches Mockup 7 ("Refined
Slate/Blue Palette").** Refined light-mode tokens, the new hero copy, the
scroll-driven scrubber bar, and a full light/dark theme toggle are all
live. All hard constraints remain met; nothing structurally blocking
remains. The only explicitly out-of-scope item is a custom domain
(optional, only if Oubaid acquires one).

**Live site:** https://oubaid-edits.oubaidbeldi.workers.dev
**CMS dashboard:** https://oubaid-edits.oubaidbeldi.workers.dev/admin/
**Publishing guide:** `PUBLISHING.md` at the repo root (non-technical,
written for Oubaid — how to log in, edit each content type, and the
required field per collection).

**What was built in Session 8** (see `session-logs/session-08-full-mockup7-style.md`
for full detail):
- Light-mode design tokens updated to the refined slate/blue values;
  fixed two spots (`Hero.astro`'s kicker pill, `Contact.astro`'s
  `.ci-icon`) that hardcoded the old `--blue-700` as text color on a
  `--blue-100` background instead of using `--blue-600`.
- Hero headline/subheadline updated to the new copy via
  `src/content/site/site.md` ("Probably **your last video editor.**").
- New `src/components/Scrubber.astro` — fixed 34px scroll-progress bar
  pinned above the nav, present on every page in both themes. Nav's
  sticky offset moved from `top: 0` to `top: 34px` to sit below it.
- Full light/dark theme toggle: `data-theme="dark"` overrides in
  `tokens.css` covering every token used site-wide, an inline SVG
  sun/moon toggle button in `Nav.astro`, `prefers-color-scheme` default
  with a `localStorage`-persisted manual override, and a synchronous
  inline `<head>` script in `Layout.astro` to avoid a flash of the wrong
  theme.
- JetBrains Mono (Google Fonts) scoped to exactly four places: the
  scrubber's label/timecode, `.eyebrow` labels, the hero `.kicker`, and
  `.process-num` numerals.
- Dark-mode audit caught two real hardcoded-color bugs (not present
  before dark mode existed): Contact's `input`/`textarea`/`select` had no
  explicit `color`, so it fell back to the browser default black — nearly
  invisible on the dark-mode input background; and the contact form's
  error-message red (`#c0362c`) failed WCAG AA contrast (3.3:1) against
  the dark background. Fixed with an explicit `color: var(--ink)` on form
  fields and a new `--error` token (light `#c0362c` / dark `#f87171`,
  the latter re-verified at 4.5:1+).
- **CLAUDE.md itself was corrupted going into this session** — the
  working copy had the entire file duplicated and had reverted several
  accuracy fixes from Sessions 2–7 (stale `src/content/config.ts` path,
  repo-root `admin/` instead of `public/admin/`, wrong OAuth env var
  names, "Cloudflare Pages" instead of the corrected Workers-static-assets
  wording). Restored from the last commit (which had all of Sessions
  1–7's real fixes intact) and re-applied only the intended Aug 21
  design-direction updates on top, rather than trusting the corrupted
  draft. Also deleted `mockup-1-cinematic-light.html` (already removed
  from the working tree before this session started, now committed) since
  Mockup 7 fully supersedes it.

**Established in earlier sessions (see session logs for full detail):**
full responsive pass down to 320px including a working mobile nav
(Session 7); SEO/OG/Twitter meta tags and favicon (Session 7); a11y
fixes — `<main>` landmark, FAQ/filter ARIA state, form field labels,
`youtube-nocookie.com` embeds (Session 7); `PUBLISHING.md` non-technical
CMS cheat sheet at the repo root (Session 7); Sveltia CMS live at
`/admin` with GitHub OAuth via the `sveltia-cms-auth` Worker (Session 6);
Formspree contact form + first Cloudflare Workers deploy (Session 5).
Lighthouse (mobile, Session 7): Performance 98 / Accessibility 96 / Best
Practices 96 / SEO 100 — two findings deliberately left as-is and
reviewed (Process's watermark-numeral contrast is WCAG-exempt decorative
text; the YouTube cookie notice is inherent to embedding YouTube at all).

**Known gotchas, not bugs:** `astro dev` 404s on `/admin/` (needs the
explicit `/admin/index.html` path) — `astro preview` and the live
deployment both correctly resolve `/admin/` to a `200`. `backdrop-filter`
on an ancestor becomes the containing block for `position: fixed`
descendants (bit the mobile nav panel in Session 7; relevant again if any
future fixed-position element gets nested under `header` or `#scrubber`).

**Not yet started:** custom domain (optional, only if Oubaid acquires
one). No other explicitly-deferred items remain.

**Auth Worker:** https://sveltia-cms-auth.oubaidbeldi.workers.dev (Oubaid's
fork of github.com/sveltia/sveltia-cms-auth)

**Optional cleanup, not blocking:** the main site's Worker may still list
unused `env.SESSION`/`env.IMAGES` bindings from Session 5's broken first
deploy attempt, and the `sveltia-cms-auth` fork has a handful of
throwaway troubleshooting commits from Session 6. Both harmless.
