# WARMAPS — SESSION BOOTSTRAP
How to start any WarMaps session, on any surface (project chat, general chat,
Android app, Claude Code). Replaces reliance on memory or Drive docs for build state.

## STEP 1 — Get ground truth (always first, ~10 seconds)
Ask Claude to fetch:

    https://raw.githubusercontent.com/Allan-AI-Agent/WARMAPS/main/STATE.md

That file is rewritten at every push and reports version, event count, latest event
day, maxDay cap, open gaps, and next actions. **Trust it over any chat memory,
project instruction, or Drive document.** If they disagree, STATE.md wins and the
others get corrected.

## STEP 2 — Confirm capability
Claude should verify, not assume, by running:

    git --version; curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: warmaps" https://api.github.com/rate_limit

Expect `200`. If this fails, the session cannot push and should be used for research
or planning only.

## STEP 3 — Work
Code and data edits happen against files pulled fresh from the repo, never from Drive.

## STEP 4 — Push
Requires Allan's fine-grained PAT (scope: `Allan-AI-Agent/WARMAPS` only, Contents:
Read and write). GitHub REST API pattern: GET the file's blob SHA, then PUT with
base64 content plus that SHA.

Token location on GitHub (buried — this is the hard-to-find page):
**Settings > Developer settings > Personal access tokens > Fine-grained tokens**
(a separate tab from the classic token list).

## STEP 5 — Close out
Rewrite STATE.md with the new numbers and push it in the same session.
A session that changes the build but not STATE.md has re-created the drift problem.

---

## WHY THIS EXISTS
On 2026-07-30 the project's own memory and Drive files said v01.08.07 / 284 events /
latest Jun 7. Live reality was v01.08.09 / 297 events / latest Jul 13. Drive folders
have no version control and cannot detect divergence. The repo does. One fetch of
STATE.md would have caught it instantly.

## LAYER SPLIT
| Layer | System of record |
|---|---|
| Code + data (`index.html`, `warmaps-data.js`) | GitHub repo |
| Build state | `STATE.md` in the repo |
| Governance, handoffs, research, roadmap | Google Drive |

## SURFACE NOTES
Code execution / file creation is available on web, Desktop, **and the iOS/Android
apps** — it is not a browser-only capability. Conversations, projects, and memory sync
across surfaces, so a session can be started in one and continued in another.
"Claude in Chrome" is a *different product* (a browser-agent extension) — not the
same as opening claude.ai in the Chrome browser.
