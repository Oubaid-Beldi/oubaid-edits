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
- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` — credentials for the GitHub OAuth App used by the CMS login. Set as secrets on the `sveltia-cms-auth` Cloudflare Worker (a separate deployable from the main site) — never in the Astro project, never committed.
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
- admin/index.html + admin/config.yml (Sveltia CMS dashboard, added in Session 6)
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

**Session 5 complete — the site is live for the first time, and content
is now complete** (every section reads from its collection; only Sveltia
CMS remains before Oubaid can edit content without touching code).

**Live URL:** https://oubaid-edits.oubaidbeldi.workers.dev

**Part 1 — FAQ and Contact wired up:**
- `src/components/FAQ.astro` reads `getCollection("faq")`, filters out any
  entry with a blank `answer` (a build-time convention — Answer is
  optional by design in the schema, not a Sveltia-enforced required
  field, so an unanswered drafted question simply doesn't render), then
  sorts by the same `sortOrder ?? Infinity` pattern as every other
  section. The first visible item opens by default, matching the
  mockup's single-open accordion.
- `src/components/Contact.astro` now really submits: `action` points at
  `import.meta.env.PUBLIC_FORMSPREE_ENDPOINT` (plain HTML POST as a
  no-JS fallback), with a JS `fetch` handler intercepting submit for an
  AJAX-style experience — real success/error messages, submit button
  disabled mid-request, form reset only on success. A hidden `_gotcha`
  field (Formspree's own documented honeypot convention) is checked
  client-side too: if it's filled in, the submission is dropped before
  ever reaching Formspree. Field layout, options list, and info panel are
  all untouched from the mockup.
- `PUBLIC_FORMSPREE_ENDPOINT` set locally in a git-ignored `.env` (not
  committed — `.env.example` still documents the name/placeholder only)
  and, later in the session, as a Cloudflare environment variable.
- Sample content: `faq/long-form-youtube.md` added with a question and no
  answer, specifically to verify the skip behavior — confirmed via
  Playwright not to render. FAQ accordion, contact success state, contact
  error state, and honeypot-drop were all verified locally against mocked
  Formspree responses before touching the real endpoint.

**Part 2 — first deploy, with a real detour:** Connecting the repo
through Cloudflare's current "Create Application" flow did **not** produce
a classic static Pages deployment. Its Deploy command (`npx wrangler
deploy`) found no committed Wrangler config, so Wrangler's zero-config
Astro bootstrapper silently ran `astro add cloudflare` on the first build
— installing the `@astrojs/cloudflare` **adapter**, switching Astro to SSR
output, and auto-provisioning an `env.SESSION` KV binding and an
`env.IMAGES` Cloudflare Images binding this static site has no use for.
The live symptom was a fully broken hero photo (the on-demand `/_image`
transform endpoint 404'd). Root-caused by diffing our own `npx astro
build` output (plain static `/_astro/*.webp`, `output: "static"`, no
adapter) against the actual Cloudflare build log, which showed the
adapter being installed mid-build. **Fix:** added `wrangler.jsonc` at the
repo root — `{ "name": "oubaid-edits", "assets": { "directory": "./dist"
} }`, deliberately no `main` entry point — so Wrangler serves `dist/` as
plain static assets with no Worker script and no bindings at all, matching
this project's actual zero-JS-by-default architecture. Once committed and
auto-redeployed, the hero photo, FAQ, work embeds, niche filters, stats,
testimonials, and contact form action were all re-verified byte-for-byte
against the local build. Also added `.nvmrc` (pinned to `22.12.0`,
matching `package.json`'s `engines` field) proactively before the first
deploy, to avoid a plausible Node-version build mismatch.

Also confirmed clean: no stray branch or pull request was left behind by
Wrangler's earlier "Workers Builds connected builds will attempt to open a
pull request to resolve this config name mismatch" warning — `git
ls-remote` shows only `main`.

**Live end-to-end test:** submitted the real contact form against the
live URL (Playwright, not a mock) — Formspree responded `200 {"ok":true}`
and the on-page success message displayed. Formspree may send a one-time
"confirm this submission" email to Oubaid's registered address for the
very first submission from a new domain; worth checking that inbox if
later real submissions don't show up as expected.

**Not yet started:** Sveltia CMS (`admin/`), SEO meta tags,
responsive/accessibility polish beyond the mockup.

**Optional cleanup, not blocking:** the Cloudflare dashboard's Bindings
tab may still list the now-unused `env.SESSION` KV namespace and
`env.IMAGES` binding from the first broken deploy — safe to delete
manually since nothing in the current `wrangler.jsonc` declares or uses
them, but they don't cost anything sitting idle either.

**Next session (Session 6, per the Build Plan):** Sveltia CMS
(`admin/index.html` + `admin/config.yml`), the self-hosted
`sveltia-cms-auth` Cloudflare Worker for the GitHub OAuth handshake, and
the `GITHUB_OAUTH_CLIENT_ID`/`SECRET` setup — this is what finally lets
Oubaid edit every content type from `/admin` without touching code, the
last unmet piece of CLAUDE.md's hard constraints.
