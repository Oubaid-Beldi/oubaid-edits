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

**Session 3 complete.** Work section (`src/components/WorkGrid.astro`) now
reads entirely from the Work and Niches collections — the Session 1
hardcoded `workItems`/`filters` arrays are gone. Each Work entry's
`youtubeUrl` is parsed (via a small `getYouTubeId()` helper supporting
`youtu.be/`, `/shorts/`, `/watch?v=`, and `/embed/` URL shapes) into a
video ID and rendered as a real unlisted YouTube `<iframe>` embed inside
the existing `.thumb` card slot, replacing the static play-button overlay.
Niche filter pills are now generated from the Niches collection itself
("All" + one pill per niche, sorted by `sortOrder`) instead of a separate
hardcoded list, so a future CMS-added niche automatically gets a filter
button with no code change. The filter script matches each card's
`data-niche` attribute (the linked niche's id) against the clicked
pill's slug — unchanged logic from Session 1, just re-keyed to real data.

Both empty states from the session goal are handled and verified: a Work
item with no `niche` field (`raw-cut-sample.md`) still renders as a card
(video, title, no niche tag) and is visible under "All" but correctly
disappears under every specific niche filter, since its `data-niche`
attribute is simply absent. A zero-Work-items collection renders a plain
"New work is on the way — check back soon." message instead of an empty
grid (`workItems.length === 0` branch — not currently exercised by sample
content, but present and structurally identical to how Hero already
guards its required Site entry).

Sample Work content was updated with two of Oubaid's real unlisted
YouTube Shorts (`1bqgKH6ybr4`, `4JghVaMrIXA`, reused across entries the
same way Session 2's placeholder video was reused) replacing the old
Rick-Astley placeholder URL on all four existing entries, plus two new
entries: one for the previously-unused Testimonials niche
(`client-success-story.md`) and one with no niche at all
(`raw-cut-sample.md`) specifically to exercise the empty-state behavior
above. Six Work entries total now.

Process, Stats, Testimonials, FAQ, and Contact are all still hardcoded
placeholder arrays exactly as Session 1 left them — untouched this
session, each waiting on its own future session to wire up.

`astro check` (0 errors, same pre-existing `z`-deprecation hints as prior
sessions) and `astro build` both pass clean. `npm run dev` confirmed
working via a headless Playwright check against the running dev server:
6 work cards render, each with a live YouTube iframe (`src` resolves to
the correct video ID); clicking "Cosmetic Dentistry" narrows the grid to
1 visible card; clicking "All" restores all 6; the no-niche card is
visible under "All" and correctly hidden under "Meta Ads". Screenshot
confirmed the grid visually matches the mockup's card/filter layout.

Repo pushed to GitHub (`Oubaid-Beldi/oubaid-edits`) for version control
only — not connected to any hosting provider.

**Not yet started:** Sveltia CMS (`admin/`), real Formspree wiring
(`.env.example` documents the var name only), SEO meta tags,
responsive/accessibility polish beyond the mockup, Cloudflare Pages
deploy, wiring Process/Stats/Testimonials/FAQ/Contact to their
collections.

**Next session:** per the Build Plan, likely wire up one or more of the
remaining sections (Process, Stats, Testimonials, FAQ) to their content
collections — schemas and sample content already exist for all of them,
only the components' hardcoded arrays need replacing, following the same
pattern now established in Hero and WorkGrid. Still verified via
`npm run dev` only (no CMS, no deploy).
