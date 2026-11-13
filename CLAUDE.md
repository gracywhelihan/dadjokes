# Dad Jokes — project notes

Static site (vanilla HTML/CSS/JS, no build step) served at gracywhelihan.com/dadjokes/ by nginx.
Data comes from a Google Sheet via `scripts/sync_jokes.py` -> `public/jokes.json`. See README.md.

## Run
- Sync data: `python3 scripts/sync_jokes.py` (needs `.env`, see `.env.example`)
- Serve: `python3 -m http.server 8000 -d public`

## Conventions
- Only `public/` is web-served. Keep scripts, docs, and secrets outside it.
- Never commit `.env` or `public/jokes.json` (both gitignored).
- Design is 1-bit black & white, IBM Plex Mono, 8px spacing grid. Change colors/sizes via the
  tokens in `:root` in `styles.css`, not ad hoc values.
- Photos in `public/photos/` must have EXIF/GPS metadata stripped.
- Undecided: whether to bring back the AI "generate a joke" button. If added, it needs its own
  server route with a rate limit, a daily cap, and a small `max_tokens` — never call the API
  from the browser.
- Previous Next.js version (15.1.0, had an RCE vulnerability) is in git history; don't restore it.
