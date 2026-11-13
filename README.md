# Dad Jokes

My dad texts me a joke every day. This site shows all of them, with what I said back, as a
retro black-and-white index. Click a joke to open it in a little Mac-style window.

Live (once deployed): **https://gracywhelihan.com/dadjokes/**

## How it works

```
Dad texts a joke ─▶ iPhone automation adds a row ─▶ Google Sheet
                                                         │
                         scripts/sync_jokes.py (every ~15 min on the server)
                                                         ▼
                                               public/jokes.json
                                                         │
                     public/index.html + app.js load it in the browser
```

- **The site is fully static** (HTML/CSS/vanilla JS, no build step, no server code). That
  means nothing running on the server to hack, and no API keys anywhere near a public URL.
- **`app.js`** cleans the data (mixed date formats, ratings like `"1★"`), renders the index,
  and spots repeated jokes by comparing word overlap (Jaccard index, threshold 0.6).
- **`jokes.json` is not committed**; it's generated from the sheet.

## Setup

```bash
cp .env.example .env          # then fill in the two values
python3 scripts/sync_jokes.py # writes public/jokes.json
python3 -m http.server 8000 -d public
# open http://localhost:8000
```

Python 3.9+ with no packages needed.

## Project structure

```
public/            # everything the web server serves (and nothing else)
  index.html
  styles.css       # design tokens at the top (:root) — colors, type, spacing
  app.js
  photos/          # web-sized, metadata-stripped photos (no GPS!)
scripts/
  sync_jokes.py    # Google Sheet -> public/jokes.json
```

## Server (DigitalOcean droplet)

| What | Where |
|---|---|
| Code (git clone, owned by `deploy`) | `/var/www/dadjokes` — nginx serves `public/` at `/dadjokes/` |
| Data (written by the sync job) | `/var/lib/dadjokes/jokes.json` — nginx serves it at `/dadjokes/jokes.json` |
| Google key (root-only, mode 600) | `/etc/dadjokes/env` |
| Sync job | `deploy/dadjokes-sync.service` + `.timer` → `/etc/systemd/system/` |

The sync job runs as its own `dadjokes` user in a systemd sandbox: it can write
`/var/lib/dadjokes` and nothing else, and systemd hands it the key as an env var so the script
never reads the key file itself. The nginx config lives in the portfolio repo
(`gracy-website2.0/deploy/nginx/`).

```bash
sudo systemctl start dadjokes-sync             # sync now
journalctl -u dadjokes-sync -n 20              # see what happened
systemctl list-timers dadjokes-sync            # when it runs next
sudo -u deploy git -C /var/www/dadjokes pull   # update the code
```

## Adding photos

Phone photos contain GPS location in their metadata. Before adding one, resize it and strip
the metadata (e.g. export from Preview / Photos with location removed), keep it around
800×800, and add it to `public/photos/`.

## Tests

None yet. Good first candidates: `to_jokes()` in the sync script, and the date/rating parsing
and repeat detection in `app.js`.
