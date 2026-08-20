# Oubaid Edits — Portfolio Site

Client-facing portfolio site for Oubaid Beldi ("Oubaid Edits"), a freelance video editor. Built with Astro, hosted free on Cloudflare, content managed through Sveltia CMS.

## Links

- **Live site:** https://oubaid-edits.oubaidbeldi.workers.dev
- **CMS dashboard (edit content):** https://oubaid-edits.oubaidbeldi.workers.dev/admin/
- **Auth Worker** (backs the CMS login, no content of its own): https://sveltia-cms-auth.oubaidbeldi.workers.dev

See [`CLAUDE.md`](./CLAUDE.md) for the full project spec, data model, and conventions, and [`session-logs/`](./session-logs/) for a session-by-session build history.

## Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the build locally, before deploying |
| `npm run astro check` | Type-check the project |

Pushing to `main` auto-deploys to Cloudflare — including CMS saves, since those are git commits too.
