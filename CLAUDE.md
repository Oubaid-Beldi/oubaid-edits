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

**Session 6 complete — the CMS dashboard is live and the last unmet hard
constraint (fully CRUD-editable content, no code required) is now met.**
Every content type can be created, edited, and deleted from `/admin` by
Oubaid alone, with each save landing as a real GitHub commit that
auto-redeploys — verified end-to-end this session, not just configured.

**Live site:** https://oubaid-edits.oubaidbeldi.workers.dev
**CMS dashboard:** https://oubaid-edits.oubaidbeldi.workers.dev/admin/
**Auth Worker:** https://sveltia-cms-auth.oubaidbeldi.workers.dev (Oubaid's
fork of github.com/sveltia/sveltia-cms-auth)
**GitHub OAuth App callback URL:** `https://sveltia-cms-auth.oubaidbeldi.workers.dev/callback`

**What was built:**
- `public/admin/index.html` + `public/admin/config.yml` — **not** a
  repo-root `admin/` folder (CLAUDE.md's File structure section said that;
  corrected this session, same class of doc-vs-reality gap as the
  `content.config.ts` path in Session 2). Astro's static build only
  copies `public/` verbatim into `dist/`; anything outside it is invisible
  to the live site.
- `config.yml` defines all seven collections from the Data model table,
  each field's `required` matching exactly, widget types chosen per field
  (`string`/`text`/`number`/`boolean`/`image`/`markdown`/`relation`). Bio
  maps to the special `body` field (markdown widget) since it's the
  entry's Markdown body, not frontmatter, per Session 2's schema decision.
  Site's Photo field uses `media_folder: ""` / `public_folder: "./"` to
  keep uploads co-located with `site.md` (matching the existing
  `./oubaid-profile.jpg` convention) rather than a generic uploads folder.
- **Work's Niche relation is keyed on `value_field: "slug"`**, not
  filename — matching the Session 2 gotcha that Astro's `glob()` loader
  uses a Niche's `slug` frontmatter field as its ID when present, not its
  filename. Added a `hint` on Niches' Slug field warning that a new niche
  needs a Slug filled in before Work items can be assigned to it, since
  this is the one place the CMS's UI can't self-enforce something the
  underlying data model actually requires for correctness.
- A few other `hint`s surface code-level conventions the CMS UI has no
  other way to reveal: Headline's `**word**` accent-marker syntax (Hero.astro
  parses it), and Answer's blank-means-hidden convention (FAQ.astro
  filters it out).
- `email` (Site) and `youtubeUrl` (Work, the required field) both get
  `pattern` validation in the CMS — catching a malformed value at save
  time instead of letting it through to break the next Astro build
  (`z.string().email()` / `z.string().url()` in the schema would fail at
  build time, not CMS-save time, without this).

**GitHub OAuth App + `sveltia-cms-auth` Worker setup** (Oubaid did the
actual clicking in both GitHub and Cloudflare dashboards):
- OAuth App homepage URL = the live site; callback URL predicted in
  advance as `https://sveltia-cms-auth.oubaidbeldi.workers.dev/callback`,
  which only works because the Worker was deliberately named
  `sveltia-cms-auth` on deploy (Cloudflare's account subdomain,
  `oubaidbeldi`, was already known from Session 5's live URL).
- Deploying the Worker itself was uneventful (unlike Session 5's Astro
  detour) — it's a plain committed Worker script with its own minimal
  `wrangler.toml`, no framework to auto-detect.
- **Getting the secrets to actually bind took several attempts** — see
  session-06 log for the full sequence. Short version: Cloudflare's
  dashboard silently splits **Production** vs **Preview** environment
  variables (same trap as Session 5's Formspree var), and the two secrets
  were initially saved under the wrong scope. Confirmed by reading the
  Worker's actual source (`src/index.js` on GitHub) to verify it does
  nothing more exotic than `const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env`
  — once correctly scoped to Production, `/auth?provider=github` went
  from a `MISCONFIGURED_CLIENT` error straight to a proper `302` redirect
  to GitHub's OAuth authorize endpoint with the right `client_id`.

**End-to-end test, both required behaviors confirmed live:**
- **Required field blocks a bad save**: cleared an FAQ entry's Question
  (the collection's required field) and attempted to save — Sveltia
  refused with a validation error; entry discarded unsaved, untouched.
- **A real save round-trips**: edited the Site entry's Bio via `/admin`,
  saved, and it landed as a real commit (`a1fd8a1 Update Site "site"`) on
  GitHub within seconds, with the live site auto-redeploying and showing
  the change — no manual rebuild step, confirmed by polling the live URL
  until the new text appeared. The test edit was then reverted via a
  normal git commit (`cd7ddfd`) since it wasn't meant to be permanent
  copy.
- Noted for future sessions: Sveltia rewrites the *entire* frontmatter
  block on every save (e.g. `name: "Oubaid Beldi"` → `name: Oubaid Beldi`,
  dropping quotes it doesn't need) — cosmetic YAML-serialization style,
  not a content change, but future diffs on CMS-edited files will look
  noisier than a single-field change actually was.

**Not yet started:** SEO meta tags, responsive/accessibility polish
beyond the mockup, custom domain.

**Optional cleanup, not blocking:** same as noted in Session 5 — the
`env.SESSION`/`env.IMAGES` bindings from that session's broken first
deploy attempt may still be listed on the main site's Worker (harmless,
unused, no cost). New this session: the `sveltia-cms-auth` fork
accumulated a few throwaway "Empty commit message" / "test" commits while
troubleshooting the Production/Preview secret scoping — harmless, but
Oubaid may want to squash or ignore them if he ever looks at that fork's
history.

**Next session, per the Build Plan:** SEO meta tags and a
responsive/accessibility polish pass are the two explicitly-deferred
items with no session assigned yet — either is a reasonable next pick.
No further hard constraints from CLAUDE.md remain unmet.
