# Nightly intake

`warmaps_intake.py` + `feeds.json` run every day at 6:17 AM MST via `.github/workflows/intake.yml`
(GitHub Actions, free for public repos, no AI). Output lands on the **`intake-data`** branch:
`raw/YYYY/MM/DD/<theater>.json` (machine-readable), `<theater>.md` (readable brief), `run.json`.

- Theaters: iran-war, russia-ukraine, east-asia, caribbean, global (keyword rules).
- RAW, NOT VERIFIED: headlines as published. An item becomes a map event only after curation.
- Honest User-Agent; robots.txt respected; refusals are logged in `run.json`, never bypassed.
- Run by hand: Actions tab -> nightly-intake -> Run workflow.
- Next step (planned): a daily Claude task drafts candidate events from these files for Allan's approval.
