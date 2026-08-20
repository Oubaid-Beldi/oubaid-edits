# Publishing Cheat Sheet

How to update the site's content — no code, no developer needed.

## Logging in

1. Go to **https://oubaid-edits.oubaidbeldi.workers.dev/admin/**
2. Click **Sign In with GitHub**.
3. Log in with your GitHub account and authorize the app (only needed the first time, or if you're signed out).

You'll land on the CMS dashboard with all seven content sections listed on the left.

## Editing content

For any folder-based section (Niches, Work, Process, Stats, Testimonials, FAQ):
- Click the section name in the sidebar to see all entries.
- Click an entry to edit it, or **New [item]** to add one.
- Open an entry's menu (**⋮**) to delete it.
- Click **Save** when done.

**Site** is different — it's a single settings entry (your bio, photo, headline, etc.), not a list. Click **Site** → **Site Settings** to edit it.

If you try to save an entry with its required field left blank, the CMS will block the save and tell you what's missing — it won't let broken content through.

## The seven content types, one line each

| Section | What it controls | Required field |
|---|---|---|
| **Site** | Name, headline, bio, photo, email, Instagram, response time | Name |
| **Niches** | The industry categories work is filtered by (Cosmetic Dentistry, Meta Ads, etc.) | Name |
| **Work** | Video portfolio items (YouTube embeds) | YouTube URL |
| **Process** | The "How I Work" steps | Title |
| **Stats** | The numbers band (e.g. "50+ Projects delivered") | Value |
| **Testimonials** | Client quotes | Quote |
| **FAQ** | Questions and answers | Question |

A few things worth knowing while editing:

- **Niches → Slug**: fill this in for any new niche, or Work items won't be able to link to it. Existing niches already have this set.
- **Work → Niche**: leave blank if a project doesn't fit a niche yet — it'll still show under "All" on the site.
- **FAQ → Answer**: leave blank to keep a question hidden from the live FAQ section until you've written an answer for it.
- **Site → Headline**: wrap words in `**double asterisks**` to make them render in blue (e.g. `Video edits that turn **viewers into clients.**`).
- **Stats → Value**: stored as text on purpose, so things like `50+`, `3.2M`, or `48h` all work — not just plain numbers.

## Going live

Every save in `/admin` is a real commit to GitHub. That commit automatically triggers a fresh build and deploy — **there's no separate "publish" step and no manual rebuild.** Changes typically show up on the live site within a minute or two of hitting Save.

Live site: **https://oubaid-edits.oubaidbeldi.workers.dev**
