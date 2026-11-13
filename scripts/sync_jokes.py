"""Pull Dad's jokes from the Google Sheet into public/jokes.json.

The sheet is the source of truth (an iPhone automation adds a row whenever Dad
texts a joke). The website itself is static: it only ever reads jokes.json.
On the server this runs on a timer every ~15 minutes, like an n8n Schedule
trigger -> HTTP request -> write file.

Usage:
    python3 scripts/sync_jokes.py

Needs GOOGLE_SHEETS_ID and GOOGLE_SHEETS_API_KEY, from the environment or a
.env file in the repo root (see .env.example).
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Locally: public/jokes.json. On the server, systemd sets JOKES_OUTPUT so the data
# lives outside the code checkout (see deploy/dadjokes-sync.service).
OUTPUT = Path(os.environ.get("JOKES_OUTPUT", ROOT / "public" / "jokes.json"))
SHEET_RANGE = "Jokes!A2:D"  # Date | Joke | Response | rating  (row 1 is headers)
TIMEOUT_SECONDS = 20


def load_dotenv(path: Path) -> None:
    """Minimal .env reader so the script has no dependencies. Real env vars win."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def fetch_rows(sheet_id: str, api_key: str) -> list[list[str]]:
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/"
        f"{urllib.parse.quote(SHEET_RANGE)}?key={api_key}"
    )
    with urllib.request.urlopen(url, timeout=TIMEOUT_SECONDS) as response:
        return json.load(response).get("values", [])


def to_jokes(rows: list[list[str]]) -> list[dict[str, str]]:
    """Turn sheet rows into dicts. Cleanup of dates/ratings happens in app.js."""
    jokes = []
    for row in rows:
        row = row + [""] * (4 - len(row))  # the API drops empty trailing cells
        date, joke, response, rating = (cell.strip() for cell in row[:4])
        if joke:
            jokes.append({"date": date, "joke": joke, "response": response, "rating": rating})
    return jokes


def write_atomically(path: Path, data: object) -> None:
    """Write to a temp file, then rename over the real one.

    Renaming is atomic, so a visitor loading the page mid-sync gets either the
    old file or the new one, never a half-written one.
    """
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    tmp.replace(path)


def main() -> int:
    load_dotenv(ROOT / ".env")
    sheet_id = os.environ.get("GOOGLE_SHEETS_ID")
    api_key = os.environ.get("GOOGLE_SHEETS_API_KEY")
    if not sheet_id or not api_key:
        print("Missing GOOGLE_SHEETS_ID or GOOGLE_SHEETS_API_KEY (see .env.example)", file=sys.stderr)
        return 1

    try:
        jokes = to_jokes(fetch_rows(sheet_id, api_key))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        # Leave the existing jokes.json alone; the site keeps working with the last good copy.
        print(f"Sync failed, keeping existing jokes.json: {error}", file=sys.stderr)
        return 1

    # Safety check: an empty result is far more likely a sheet/API problem than
    # Dad deleting every joke. Don't wipe the site over it.
    if not jokes:
        print("Sheet returned 0 jokes; not overwriting jokes.json", file=sys.stderr)
        return 1

    write_atomically(OUTPUT, jokes)
    print(f"Wrote {len(jokes)} jokes to {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
