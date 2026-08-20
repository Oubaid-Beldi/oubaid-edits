# Session 5 — FAQ, Contact, First Deploy

**Date:** 2026-08-20

## Goal

Two parts. Part 1: wire the FAQ collection into the accordion (skipping
any entry with a blank Answer), and wire the real contact form to
Formspree — honeypot, real success/error states, keep the mockup's field
layout. Part 2: first live deploy — connect the GitHub repo to Cloudflare
Pages, set `PUBLIC_FORMSPREE_ENDPOINT` as a build environment variable,
get a live URL with auto-deploy on push. No Sveltia CMS, no
responsive/accessibility pass, no SEO meta tags, no CAPTCHA — all out of
scope. End of session: confirm the live site matches local, test-submit
the live contact form against the real Formspree endpoint.

## What was built — Part 1

- **`src/components/FAQ.astro`** — reads `getCollection("faq")`, filters
  to entries where `data.answer` is truthy, then sorts by `sortOrder ??
  Infinity` (same pattern as every other section since Session 3). The
  first item in the filtered/sorted list opens by default (`i === 0`),
  matching the mockup's hardcoded `open: true` on the first placeholder.
- **`src/components/Contact.astro`**:
  - `action={import.meta.env.PUBLIC_FORMSPREE_ENDPOINT}` on the `<form>`
    element — a real HTML attribute, so the form degrades to a working
    plain POST (full-page navigation to Formspree's default response
    page) if JS never loads. `method="POST"` unchanged.
  - Added `name` attributes to every field (`name`, `email`, `topic`,
    `message`) — the Session 1 markup had none, so a real submission
    (JS or plain HTML) would have silently dropped every field's value.
    This was a latent bug independent of the Formspree wiring itself.
  - Added a honeypot: `<input type="text" name="_gotcha" ...>`, visually
    hidden off-screen (not `display:none`, which some bots specifically
    check for), `tabindex="-1"`, `aria-hidden="true"`,
    `autocomplete="off"` so screen reader users and real visitors never
    encounter it. `_gotcha` is Formspree's own documented honeypot field
    name — filling it makes Formspree itself silently discard the
    submission without emailing Oubaid, on top of the client-side check
    added here that skips the `fetch` call entirely if it's filled.
  - JS `submit` handler: builds `FormData`, bails early if the honeypot
    is filled, otherwise `fetch(form.action, { method: "POST", body:
    data, headers: { Accept: "application/json" } })`. Success (`response.ok`)
    resets the form and shows `#formSuccess`; any failure (non-OK
    response or thrown error, e.g. offline) shows `#formError` with a
    fallback "email me directly" message. Submit button is disabled for
    the duration of the request to prevent double-submits.
- **`.env`** created locally (git-ignored, confirmed via `git status`)
  with the real `PUBLIC_FORMSPREE_ENDPOINT` value so local dev/build
  testing exercised the real endpoint end-to-end, not a placeholder.
  `.env.example` untouched — still documents the variable name with a
  placeholder only, per CLAUDE.md's convention.
- **Sample content**: `src/content/faq/long-form-youtube.md` added with
  a `question` and no `answer` — specifically to exercise and verify the
  skip-blank-answer behavior.

### Part 1 verification

- `astro check` — 0 errors (same pre-existing hints as every prior
  session). `astro build` — clean; confirmed via `grep` on `dist/index.html`
  that exactly 4 `.faq-item` render (not 5), the blank-answer question
  text is absent, the honeypot field is present, and the form's `action`
  resolves to the real Formspree URL.
- `npm run dev` + Playwright against the running server:
  - FAQ: 4 questions render (long-form-YouTube excluded), first item
    open by default, single-open accordion behavior confirmed by
    clicking a third item and checking exactly one `.faq-item.open`
    exists afterward.
  - Contact success path: network intercepted and mocked to return
    `200`, submit clicked, success message became visible, error message
    stayed hidden, name field confirmed empty after `form.reset()`.
  - Contact error path: mocked a `500` response — error message
    displayed, success message did not.
  - Honeypot: filled `_gotcha` via `page.evaluate`, submitted, and
    confirmed (via `page.route` interception) that **no request was ever
    sent** to the Formspree URL at all.
  - All three flows screenshotted for visual confirmation — no layout
    issues.

## What was built — Part 2 (deploy)

- Walked Oubaid through Cloudflare's dashboard to connect the GitHub repo
  (Oubaid did the manual clicking, per the plan — this is a one-time
  human step). He went through **Workers & Pages → Create Application**
  (Cloudflare's current unified flow — the dashboard has moved away from
  a cleanly separate "Pages" product) rather than a distinct "Pages"
  path, since that's what the current UI actually offers.
- **First deploy was broken**, and diagnosing it took most of this part
  of the session:
  - Live symptom: hero photo 404'd. `curl`-ing the live HTML showed
    `<img src="/_image?href=...">` — an **on-demand image transform**
    URL, which only exists when Astro runs with a server adapter, not in
    this project's `output: "static"` configuration.
  - Rebuilt locally with the exact same code (`npx astro build`) and
    confirmed the real static output has always been a plain pre-built
    file reference (`/_astro/oubaid-profile.HASH.webp`), no `/_image`
    endpoint anywhere — so the discrepancy was entirely on Cloudflare's
    build side, not this repo's code.
  - `git fetch origin` + `git log origin/main` confirmed no commits had
    been pushed to the repo by Cloudflare's setup (ruling out "the
    adapter got committed and we don't have it locally").
  - Got the full Cloudflare deployment build log from Oubaid. It showed
    the actual root cause precisely: `npm run build` (the **Build
    command**) ran clean and produced the correct static output — but
    the separate **Deploy command**, `npx wrangler deploy`, found no
    `wrangler.jsonc`/`wrangler.toml` in the repo. With no config file to
    read, and Wrangler's Astro framework detection kicking in, it ran
    its own interactive-by-default setup wizard
    (`🛠️ Configuring project for Astro with "astro add cloudflare"`),
    auto-answering "yes" in the non-interactive CI context. That
    installed `@astrojs/cloudflare`, re-ran the build a second time with
    the adapter now present (`[build] adapter: @astrojs/cloudflare`,
    `dist/client` split output), and auto-provisioned an `env.SESSION`
    KV binding ("Enabling sessions with Cloudflare KV") and an
    `env.IMAGES` Cloudflare Images binding ("Enabling image processing
    with Cloudflare Images") — none of which this static site declared,
    needs, or has code for.
  - **Fix**: added `wrangler.jsonc` at the repo root:
    ```json
    { "name": "oubaid-edits", "compatibility_date": "2026-08-20", "assets": { "directory": "./dist" } }
    ```
    Deliberately **no `main` field** — this is Cloudflare's documented
    "static assets only, no Worker script" pattern, the direct
    successor to what the classic Pages product did: upload `dist/` as
    plain files, no server-side code execution, no bindings. `name`
    matches what Cloudflare's CI expected (`oubaid-edits`, not the
    `package.json` name `oubaid-edits-portfolio` — the mismatched name
    was flagged as a warning in the broken build's log). With a real
    config file present, Wrangler no longer has any reason to run its
    auto-configure wizard.
  - Also added **`.nvmrc`** (`22.12.0`, matching `package.json`'s
    `engines` field) proactively before the redeploy — not strictly
    required to fix the image bug, but a plausible second failure mode
    (Cloudflare defaulting to an older Node than this project requires)
    worth closing out while already touching deploy config. The build
    log confirmed Cloudflare had already been correctly resolving Node
    22.12.0 even before this file existed, so it's a safety net rather
    than a fix for an observed problem.
- Committed and pushed both fixes, which triggered an automatic
  redeploy via the already-connected Git integration — no manual retry
  needed.
- Confirmed after redeploy, via direct comparison against the local
  build's `dist/index.html`:
  - Hero photo: `/_astro/oubaid-profile.Bn0lwKrF_r6tLu.webp` now returns
    `200`, `content-type: image/webp` — matches local exactly.
  - No `/_image` references anywhere in the live HTML.
  - Contact form `action` resolves to the real Formspree URL (confirming
    `PUBLIC_FORMSPREE_ENDPOINT` was correctly set as a Cloudflare
    environment variable — this also needed a manual fix mid-session,
    since the first attempt to check it showed the attribute missing
    entirely; Oubaid confirmed/fixed it in the dashboard).
  - FAQ: 4 items, blank-answer entry absent — matches local.
  - Work: both real YouTube video IDs present, 6 niche filter pills —
    matches local.
  - Process: 4 cards. Stats: 4 values. Testimonials: 4 cards. All match
    local counts.
  - `git ls-remote --heads origin` shows only `main` — the "Workers
    Builds connected builds will attempt to open a pull request" warning
    from the broken build's log never actually resulted in a stray
    branch or PR.
- **Live end-to-end contact form test**: ran a real (non-mocked)
  Playwright submission against
  `https://oubaid-edits.oubaidbeldi.workers.dev` — Formspree responded
  `200 {"next":"/thanks","ok":true}`, and the on-page success message
  rendered correctly.

## Decisions / tradeoffs

- **Static-assets-only Wrangler config over living with the SSR
  adapter.** The adapter path technically "worked" once Astro's build
  produced valid `dist/client` output — the only reason the first deploy
  broke was the hero photo. Patching just the image issue (e.g., by
  actually adopting the Cloudflare Images binding for real) would have
  meant permanently carrying a KV namespace and an Images binding this
  site has zero use for, and Cloudflare Images pricing isn't free at
  scale — directly at odds with CLAUDE.md's "100% free deployment, no
  ongoing costs" hard constraint. Forcing Wrangler onto a plain
  static-assets deploy (no `main`, no adapter, no bindings) is both
  simpler and the architecture this project was actually designed
  around: "Astro (static output) — zero JS by default."
- **`wrangler.jsonc` over `wrangler.toml`.** The broken build's log
  referenced `wrangler.jsonc` as the expected/auto-generated filename
  ("Original user's configuration: 'wrangler.jsonc'"), so matching that
  convention avoids any ambiguity about which format Cloudflare's
  tooling looks for first.
- **CLAUDE.md's "Cloudflare Pages" language lightly corrected, not
  rewritten.** The Chosen stack section's reasoning for picking
  Cloudflare over Vercel/Netlify is unchanged and still accurate — same
  company, same free tier. Only added a parenthetical noting the actual
  deployed shape (Workers with static assets, not the legacy distinct
  Pages product) rather than rewriting the historical rationale, since
  Cloudflare's current dashboard genuinely doesn't offer a clearly
  separate "Pages" path anymore for new projects.
- **Real `.env` created locally, not just documented.** Testing the
  actual Formspree endpoint locally (not a placeholder) before ever
  touching the live site caught the missing `name` attributes on form
  fields early, in a fast local feedback loop rather than after deploy.

## Deviations from the build plan

- **Cloudflare Pages → Cloudflare Workers (static assets).** Not a
  choice made this session — it's what Cloudflare's current dashboard
  flow actually produces when connecting a GitHub repo today. Functionally
  equivalent (free static hosting, auto-deploy on push), and now
  correctly configured as pure static-asset serving with no server code,
  matching the project's original static-site intent.
- No other deviations. FAQ/Contact wiring stayed within Part 1's scope
  (no CAPTCHA, no field layout changes); deploy stayed within Part 2's
  scope (no Sveltia CMS, no SEO/accessibility work).

## Open issues

- Cloudflare dashboard's Bindings tab likely still lists the unused
  `env.SESSION` KV namespace and `env.IMAGES` binding provisioned by the
  first broken deploy attempt. Not harmful (nothing references them, no
  idle cost), but worth Oubaid deleting manually next time he's in the
  dashboard for tidiness.
- Formspree may require a one-time "confirm this submission" email click
  for the very first real submission from a new domain — worth Oubaid
  checking his Formspree-registered inbox if he doesn't see the test
  submission (or any real client submission) land as expected.

## Starting point for next session

- Site is live at https://oubaid-edits.oubaidbeldi.workers.dev, content
  is fully collection-driven for every section (Hero, Work, Process,
  Stats, Testimonials, FAQ, Contact) — nothing left hardcoded from
  Session 1's placeholders.
- Auto-deploy on push to `main` is confirmed working (this session's own
  `wrangler.jsonc` fix round-tripped through exactly that flow).
- Per the Build Plan, **Session 6 is Sveltia CMS**: `admin/index.html` +
  `admin/config.yml` (mirroring `src/content.config.ts`'s seven
  collections), plus the self-hosted `sveltia-cms-auth` Cloudflare
  Worker for GitHub OAuth (a separate deployable from this site, per
  CLAUDE.md's Conventions) and the associated `GITHUB_OAUTH_CLIENT_ID`/
  `SECRET` setup. That's the last piece needed before Oubaid can edit any
  content type without touching code.
