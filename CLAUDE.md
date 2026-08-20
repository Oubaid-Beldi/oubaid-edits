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

**Session 4 complete.** Process, Stats, and Testimonials sections
(`src/components/Process.astro`, `Stats.astro`, `Testimonials.astro`) now
read entirely from their content collections — the Session 1 hardcoded
arrays in all three are gone. All three follow the same
`getCollection(...).sort((a, b) => (a.data.sortOrder ?? Infinity) - (b.data.sortOrder ?? Infinity))`
pattern already established in Hero/WorkGrid: explicit `sortOrder` wins,
entries missing it sort to the end rather than in random/insertion order.

- **Process**: the numeral watermark (01, 02, ...) is derived from each
  step's position in the sorted list, not stored content — it's decorative
  sequencing, not data. A step with no `description` renders title + numeral
  only, no empty paragraph gap.
- **Stats**: `value` (e.g. `"3.2M"`) is split via regex into a leading
  numeric part (light-blue accent span) and trailing suffix, restoring the
  mockup's two-tone stat numbers without a second schema field — same
  technique as Hero's `**accent**` headline marker. A stat with no `label`
  renders its value with no label line beneath, no empty box.
- **Testimonials**: star rating renders as filled/outline stars
  (`★` × rating + `☆` × remainder) only when `rating` is present — omitted
  entirely otherwise, no guessing a default rating. `role` renders only if
  present. `name` falls back to "Anonymous Client" if ever omitted (schema
  allows it, though no sample entry currently omits it).

Sample content: **Process and Stats** kept their existing 4 entries
(preserving the mockup's fixed 4-card/4-stat layout) but had specific
fields stripped from two entries each to exercise the required behaviors:
`process/delivery.md` lost its `description`; `process/rough-cut.md` lost
its `sortOrder` (now renders last, after Discovery/Revisions/Delivery,
proving the fallback actually reorders); `stats/niches-served.md` lost its
`label` (the exact "stat with no Label still shows its Value" case named
in the goal); `stats/views-generated.md` lost its `sortOrder` (now renders
last instead of 3rd). **Testimonials** got a genuinely new 4th entry
(`quick-turnaround-client.md`, no `role`, no `rating`, no `sortOrder`) since
that grid's 3-column layout naturally accommodates a wrapped 4th card,
unlike Process/Stats' fixed-count bands.

FAQ and Contact are still hardcoded placeholders exactly as Session 1 left
them — untouched this session.

`astro check` (0 errors, same pre-existing `z`-deprecation hints as prior
sessions) and `astro build` both pass clean. `npm run dev` confirmed
working via a headless Playwright check against the running dev server:
Process order renders `[Discovery, Revisions, Delivery, Rough Cut]`
(confirming the sortOrder-fallback reorder), Delivery's card has zero `<p>`
elements while Rough Cut's has one; Stats render `[50+, 12, 48h, 3.2M]` in
that order with exactly 3 `.stat-lbl` elements (not 4); Testimonials show
4 cards, the last with zero `.stars` and zero `.p-role` elements. Screenshots
confirmed all three sections render cleanly with no broken layout or
visible empty gaps where optional fields are missing.

Repo pushed to GitHub (`Oubaid-Beldi/oubaid-edits`) for version control
only — not connected to any hosting provider.

**Not yet started:** FAQ and Contact still wired to hardcoded placeholders;
Sveltia CMS (`admin/`), real Formspree wiring (`.env.example` documents the
var name only), SEO meta tags, responsive/accessibility polish beyond the
mockup, Cloudflare Pages deploy.

**Next session (Session 5):** deployment session per CLAUDE.md's hard
constraints — this was the last local-only session. Likely also wire FAQ
to its collection (same pattern as Process/Stats/Testimonials) before or
as part of going live, and connect Cloudflare Pages / set the
`PUBLIC_FORMSPREE_ENDPOINT` build variable. Contact form logic (real
Formspree wiring) and Sveltia CMS remain separately scoped per the Build
Plan (CMS explicitly slated for Session 6).
