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
- **Cloudflare Pages** (free) for hosting — chosen over Vercel because Vercel's free Hobby plan restricts to non-commercial use only (this is a commercial site); chosen over Netlify per explicit constraint. Connected directly to the GitHub repo starting Session 5, for auto-deploy on every push — including CMS saves, since those are git commits too. No separate rebuild step needed.
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

- src/content/config.ts (Astro Content Collections schema — Zod, mirrors the data model)
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

### Commit message format

Conventional Commits: `type(scope): summary` — types: feat, fix, chore, docs, style, refactor. Example: `feat(work): wire video grid to Work content collection`.

### End-of-session protocol

Every session ends by:

1. Overwriting the "Current status" section below with: what's working now, what was completed this session, what's next.
2. Writing `/session-logs/session-NN-short-slug.md` covering: goal, what was built, decisions/tradeoffs made, any deviation from the Build Plan, open issues, exact starting point for next session.
3. Committing with a Conventional Commits message and pushing to GitHub.
4. Confirming the site still works: via the local dev server (`npm run dev`) for Sessions 1–4, or via the live Cloudflare Pages URL from Session 5 onward.

### Keeping config in sync

`src/content/config.ts` (Astro's schema) and `admin/config.yml` (Sveltia CMS's form definition) describe the same seven collections. Any time a field is added/renamed/removed in one, update the other in the same session — never leave them out of sync.

## Session logs

See `/session-logs/` in the repo, one file per session, newest = current state. Read all of them (not just this file) before starting any session.

## Current status

(Overwrite this section at the end of every session — this is the only part of this file expected to change often.)

**Session 2 complete.** Astro Content Collections wired up. Schema lives
in `src/content.config.ts` (see "Deviation" note below on the path) and
defines all seven collections from the Data model — Site, Niches, Work,
Process, Stats, Testimonials, FAQ — each using Astro's `glob()` loader
pointed at its own `src/content/<name>/` folder, with a Zod schema whose
required field matches the Data model table exactly (`.optional()` on
everything else). Every collection has real sample content: one Site
singleton entry, 5 Niches, 4 Work items, 4 Process steps, 4 Stats, 3
Testimonials, 4 FAQ entries — mostly ported from the Session 1 mockup
placeholders so the copy stays consistent.

Only the Hero section (`src/components/Hero.astro`) is wired to read from
content: headline, bio (rendered from the Site entry's Markdown body),
photo (via `astro:assets` + the schema's `image()` field), and the niche
chips (from the Niches collection, sorted by `sortOrder`) all come from
`src/content/site/site.md` and `src/content/niches/*.md` now — no more
hardcoded arrays in Hero. The old standalone `src/assets/oubaid-profile.jpg`
was removed since the photo now lives at `src/content/site/oubaid-profile.jpg`,
referenced by the Site entry's `photo` field.

Work grid, Process, Stats, Testimonials, FAQ, and Contact are all still
hardcoded placeholder arrays exactly as Session 1 left them — untouched
this session, each waiting on its own future session to wire up.

**Post-session fix (same day):** the two open issues flagged at the end
of Session 2 are resolved. Headline supports an inline `**accent**`
marker (parsed in `Hero.astro`, mirrors Markdown bold syntax) so
`site.md`'s headline can mark which words render in blue — restores the
mockup's two-tone h1 without a new schema field. Subheadline now renders
as its own line between the h1 and the bio paragraph
(`.hero-subheadline`, bold blue-700 text) — sample content in `site.md`
rewritten to a short tagline distinct from Bio's first-person prose.

`astro check` (0 errors) and `astro build` both pass clean; `npm run dev`
confirmed working via screenshot showing live Hero headline/bio/photo/niche
chips.

Repo pushed to GitHub (`Oubaid-Beldi/oubaid-edits`) for version control
only — not connected to any hosting provider.

**Deviation worth knowing about:** CLAUDE.md's file structure lists the
schema file as `src/content/config.ts`. Astro 7 removed that path (the
"legacy" folder-inferred collection type) — `astro check`/`astro build`
now hard-error and require the schema at `src/content.config.ts` with an
explicit `loader:` per collection instead of `type: 'content'`. Used the
framework's required path/API; see session-02 log for detail.

**Not yet started:** Sveltia CMS (`admin/`), real Formspree wiring
(`.env.example` documents the var name only), SEO meta tags,
responsive/accessibility polish beyond the mockup, Cloudflare Pages
deploy, wiring Work/Process/Stats/Testimonials/FAQ/Contact to their
collections.

**Next session:** per the Build Plan, likely wire up one or more of the
remaining sections (Work grid, Process, Stats, Testimonials, FAQ) to their
content collections — schemas and sample content already exist for all of
them, only the components' hardcoded arrays need replacing. Still verified
via `npm run dev` only (no CMS, no deploy).
