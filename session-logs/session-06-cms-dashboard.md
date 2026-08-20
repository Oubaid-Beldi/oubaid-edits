# Session 6 — CMS Dashboard

**Date:** 2026-08-20

## Goal

Add the Sveltia CMS dashboard: `admin/index.html` + `admin/config.yml`
defining all seven collections from CLAUDE.md's Data model, correct
`required` flags and widget types per field. Walk Oubaid through creating
a GitHub OAuth App and deploying the `sveltia-cms-auth` Cloudflare Worker
(he does the actual dashboard clicking; secrets entered by him, never
pasted into the repo). Set `admin/config.yml`'s `base_url` to the
deployed Worker's URL. Test end-to-end: log in, confirm a bad save
(blank required field) is rejected, confirm a real save commits to
GitHub and auto-redeploys with no manual rebuild. No responsive/
accessibility polish, no SEO meta tags, no custom domain, no fields or
collections beyond the seven in the Data model.

## Key URLs (for reference)

- Live site: https://oubaid-edits.oubaidbeldi.workers.dev
- CMS dashboard: https://oubaid-edits.oubaidbeldi.workers.dev/admin/
- `sveltia-cms-auth` Worker: https://sveltia-cms-auth.oubaidbeldi.workers.dev
- GitHub OAuth App authorization callback URL:
  `https://sveltia-cms-auth.oubaidbeldi.workers.dev/callback`

## What was built

### CMS config

- **`public/admin/index.html`** — minimal loader page, `<script
  src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module">`,
  the standard Sveltia CMS zero-install setup. `<meta name="robots"
  content="noindex">` added since this page shouldn't be indexed.
- **`public/admin/config.yml`** — `backend: { name: github, repo:
  Oubaid-Beldi/oubaid-edits, branch: main, base_url:
  https://sveltia-cms-auth.oubaidbeldi.workers.dev }`, plus all seven
  collections. Verified against `src/content.config.ts` field-by-field
  (see table below) and validated as parseable YAML via a scratch
  `js-yaml` check before committing.

| Collection | Type | Required (matches schema) | Notable widget choices |
|---|---|---|---|
| Site | `files:` (singleton) | Name | Bio → `body`/`markdown` widget (it's the entry's Markdown body, not frontmatter — Session 2 decision); Photo → `image` with `media_folder: ""` / `public_folder: "./"` to co-locate uploads with `site.md`, matching the existing `./oubaid-profile.jpg` convention; Email gets a `pattern` regex |
| Niches | folder | Name | Slug field has a `hint` explaining Work's Niche picker depends on it (see gotcha below) |
| Work | folder | YouTube URL | URL gets a `pattern` regex; Niche is a `relation` widget — see gotcha below; Featured is `boolean` |
| Process | folder | Title | Description is `text` (textarea) |
| Stats | folder | Value | `string` widget, not `number` — Session 2 chose Value as a string specifically to support `"50+"`/`"3.2M"`/`"48h"`; a `hint` explains why |
| Testimonials | folder | Quote | Quote is `text`; Rating is `number` with `min: 1, max: 5` |
| FAQ | folder | Question | Answer has a `hint` explaining the blank-answer-means-hidden convention from Session 5's `FAQ.astro` |

- Every folder collection has `create: true` and `delete: true` set
  explicitly (Decap/Sveltia's `create` defaults to `false` — without it,
  Oubaid could edit existing entries but never add new ones, which would
  silently violate CLAUDE.md's "fully CRUD-editable" hard constraint).
- `identifier_field` set per collection to whichever field makes the best
  CMS-generated filename basis (`title` for Process/Work, `name` for
  Niches/Testimonials, `value`/`question` for Stats/FAQ) — none of this
  affects Astro's build (filenames don't need to be pretty), it's purely
  a CMS-side UX nicety.

### The `admin/` vs `public/admin/` path issue

CLAUDE.md's File structure section listed the CMS files as a repo-root
`admin/index.html` + `admin/config.yml`. Before committing anything,
checked whether Astro's static build would actually serve a root-level
folder — it doesn't. `astro build` only processes `src/pages/` (for
routes) and copies `public/` verbatim into `dist/`; anything else at the
repo root is invisible to the deployed site. Confirmed this concretely:
built locally with files at repo-root `admin/`, and `dist/admin/` didn't
exist. Moved both files to `public/admin/` instead, rebuilt, and
confirmed `dist/admin/{index.html,config.yml}` both exist and later
verified live at `/admin/` (both returned `200`). This is the same class
of doc-vs-reality gap as Session 2's `content.config.ts` path issue —
corrected in CLAUDE.md's File structure section in the same session
rather than leaving it to trip up a future session.

### Work → Niches relation, and the Slug gotcha

Session 2's log flagged that Astro's `glob()` loader uses a Niche
entry's `slug` frontmatter field (if present) as its collection ID
instead of its filename — meaning `work/*.md`'s `niche:` value has to
match a Niche's `slug`, not its filename. This directly determines the
CMS relation widget's config: `value_field: "slug"` (not the default,
which would typically be the target's own generated ID/filename). All
five existing Niches already have `slug` set, so this works today.

The residual risk: **Slug is optional** on Niches per the Data model
(only Name is required) — if Oubaid ever adds a new Niche via the CMS
without filling in Slug, Astro would generate that entry's ID from its
filename instead, but the relation widget would still be storing
(or trying to match against) an empty Slug value, and any Work item
pointed at that niche wouldn't resolve correctly. This isn't a bug
introduced this session — it's inherent to Session 2's schema design
(Slug being optional was itself following the Data model table, not
something Session 6 is authorized to change). Mitigated with a `hint` on
the Slug field flagging this dependency, since it's the one place the
CMS UI can't self-enforce something the underlying data model actually
needs for correctness. Not fixed further, since making Slug required
would deviate from CLAUDE.md's explicit Data model table.

## OAuth App + `sveltia-cms-auth` Worker setup

Walked Oubaid through both dashboards; here's the sequence and what went
wrong along the way.

1. **GitHub OAuth App** created with Homepage URL = the live site,
   Authorization callback URL = `https://sveltia-cms-auth.oubaidbeldi.workers.dev/callback`
   — predicted in advance rather than filled in after the fact, since
   Cloudflare Worker URLs are deterministic (`<worker-name>.<account-subdomain>.workers.dev`)
   and the account subdomain (`oubaidbeldi`) was already known from
   Session 5's live URL. This only works if the Worker is actually named
   `sveltia-cms-auth` on deploy.
2. **Forked** github.com/sveltia/sveltia-cms-auth to Oubaid's account
   (unrenamed, so the fork keeps the name `sveltia-cms-auth`), then
   connected it via Cloudflare's **Create Application → Connect to Git**
   flow — same starting point as Session 5's main-site deploy, but this
   time uneventful: it's a plain Worker script with its own committed
   `wrangler.toml` (`name = "sveltia-cms-auth"`, `main = "src/index.js"`,
   no `[vars]` block), so there was no framework-adapter surprise like
   Session 5's Astro detour. Cloudflare's "Project name" field (its
   current label for what's functionally the Worker name) defaulted to
   `sveltia-cms-auth` automatically, matching what the callback URL
   needed.
3. **Setting the OAuth secrets took several failed attempts**:
   - First save: added `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` as
     plaintext **Variable** type (not encrypted **Secret** type). Tested
     `/auth?provider=github&site_id=...` directly via `curl` — got back
     `{"error":"OAuth app client ID or secret is not configured.",
     "errorCode":"MISCONFIGURED_CLIENT"}`. Confirmed the two variable
     names against the repo's actual README (`GITHUB_CLIENT_ID`,
     `GITHUB_CLIENT_SECRET`, `GITHUB_HOSTNAME` optional) — names were
     already correct, so that wasn't it.
   - Switched both to **Secret** type and asked Oubaid to trigger a
     redeploy — still `MISCONFIGURED_CLIENT`.
   - Suspected a stale deployment not picking up the new bindings (the
     Session 5 Formspree-var parallel); Oubaid pushed several trivial
     "Empty commit message" commits to force fresh deploys — still
     failing after multiple fresh deploys, which ruled out "just needs a
     redeploy" as the actual cause.
   - Fetched the Worker's actual source
     (`raw.githubusercontent.com/sveltia/sveltia-cms-auth/main/src/index.js`)
     to rule out anything unusual in how it reads `env` — it's a plain
     `const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, ... } = env`
     destructure, nothing exotic. Also fetched the committed
     `wrangler.toml` — confirmed no `[vars]` block that could be
     shadowing dashboard-set values.
   - Asked Oubaid to check for a **Production vs Preview** environment
     split on the Variables and Secrets panel — exactly the same trap
     Session 5 hit with `PUBLIC_FORMSPREE_ENDPOINT` needing to be set for
     both. This was it: once set under **Production** specifically,
     `curl`-ing `/auth?provider=github&site_id=...` returned a real `302`
     redirect to `https://github.com/login/oauth/authorize?client_id=...`
     — a working OAuth flow.

## End-to-end verification

- **Bad save is rejected**: opened an FAQ entry in `/admin`, cleared its
  Question field (the collection's one required field), attempted to
  save — Sveltia CMS blocked it with a validation error. Entry discarded
  without saving, left untouched.
- **Good save round-trips through GitHub and auto-redeploys**: edited the
  Site entry's Bio text via `/admin`, saved. Confirmed via `git fetch` +
  `git log origin/main` that a real commit landed
  (`a1fd8a1 Update Site "site"`) within seconds of the save. Diffed it
  locally — the Bio text change was there, plus Sveltia had rewritten the
  entire YAML frontmatter block into its own default serialization style
  (unquoted plain scalars where quotes weren't needed, e.g. `name:
  "Oubaid Beldi"` → `name: Oubaid Beldi`) — semantically identical, just
  a different quoting convention, not a content change. Polled the live
  URL until the new Bio text appeared (confirming the git-push-triggered
  Workers Build auto-redeployed with zero manual steps), then reverted
  the test edit via a normal commit (`cd7ddfd`) since " test" wasn't
  meant to be permanent copy — `astro check`/`astro build` both stayed
  clean after the revert.

## Decisions / tradeoffs

- **`public/admin/` over repo-root `admin/`.** Not a stylistic choice —
  the repo-root path CLAUDE.md documented simply doesn't work with
  Astro's static build. Verified concretely (built locally, checked
  `dist/`) before committing, rather than assuming CLAUDE.md's literal
  text was authoritative — same lesson as Session 2's
  `content.config.ts` path.
- **`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`, not
  `GITHUB_OAUTH_CLIENT_ID`/`SECRET`.** CLAUDE.md's Conventions section had
  documented the latter (presumably a guess made before this Worker was
  ever set up). Corrected to match what `sveltia-cms-auth`'s actual
  source code reads from `env` — verified by reading the source directly
  rather than trusting the pre-existing doc.
- **`pattern` validation added to Email and YouTube URL beyond the bare
  required/widget-type ask.** Both have a Zod format constraint beyond
  plain string (`.email()`, `.url()`) that only gets checked at Astro
  build time, not at CMS-save time. Without CMS-side pattern validation,
  a malformed value would save successfully through the CMS (required
  field is non-empty, so Sveltia's own check passes) and then break the
  next Astro build — a much worse failure mode than catching it
  immediately in the CMS form. Judged this as directly serving the
  session's own goal (a CMS save shouldn't be able to produce a broken
  deploy), not scope creep beyond "required/widget type."
- **`hint` text on Slug, Headline, Answer, and Value fields.** Each
  surfaces a real code-level or data-model convention (the Work-relation
  Slug dependency, the `**accent**` marker syntax, the blank-Answer
  skip behavior, why Value is text not a number) that Oubaid would have
  no way to discover through the CMS UI alone otherwise — directly in
  service of "fully CRUD-editable without touching code."

## Deviations from the build plan

None beyond the two doc corrections above (both flagged as deviations
from what CLAUDE.md previously said, not from the Build Plan itself).
Stayed in scope: no fields/collections beyond the seven in the Data
model, no responsive/accessibility work, no SEO meta tags, no custom
domain.

## Open issues

- The `sveltia-cms-auth` fork has a handful of throwaway "Empty commit
  message" / "test" commits from the secret-scoping troubleshooting.
  Harmless (it's a fork of a third-party tool, not user-facing content),
  but Oubaid may want to tidy that history if he's ever looking at it.
- Carried forward from Session 5: the main site's Worker may still list
  unused `env.SESSION`/`env.IMAGES` bindings from that session's broken
  first deploy — still harmless, still optional cleanup.

## Starting point for next session

- Every hard constraint from CLAUDE.md is now met: static site, free
  hosting, no third-party SaaS holding content, fully CRUD-editable via
  Sveltia CMS with per-collection required-field enforcement, single
  editor, deployed. Nothing structurally blocking remains.
- Two explicitly-deferred items with no session assigned yet: **SEO meta
  tags** and a **responsive/accessibility polish pass**. Either is a
  reasonable next pick — check in with Oubaid on priority.
- CMS is fully live and tested; future content changes (real bio copy,
  real testimonials replacing "Placeholder Name" entries, a real reel
  when Oubaid has one) can now happen entirely through `/admin`, no code
  session required.
