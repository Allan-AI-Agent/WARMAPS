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

## STEP 1b — Load the known-failure register (added 2026-08-31)

    https://raw.githubusercontent.com/Allan-AI-Agent/WARMAPS/main/KNOWN_FAILURES.md

Nine recurring failures with symptom, cause and fix, sorted by recurrence. **If a symptom
you are seeing appears there, the diagnosis is already done — do not re-derive it.**

Why this step exists: on 2026-08-31 a failure cost ~5 hours to diagnose. The correct
diagnosis and remedy had been written down on 2026-06-13 and sat unread. Memory summarises
and forgets; a loaded file does not.

## STEP 2 — Confirm capability (updated 2026-11-02)
Verify, do not assume. In a Claude Code cloud session, push access is the real test:
create a throwaway branch, commit an empty file, push it, then delete the branch.

Push works only if the Claude account is linked to GitHub user **`Allan-AI-Agent`**
(fixed 2026-11-02; it had been linked to Allan's old account `sanceau`, which has no rights
on the repo). Check with `gh api user --jq .login`. If it shows any other name, relink at
https://claude.ai/connect-github while the browser is signed in to GitHub as
`Allan-AI-Agent`. On a phone, use Chrome "Desktop site" mode.

If push fails, the session is research/planning only. **Do not ask Allan for a token.**

## STEP 3 — Work
Code and data edits happen against files pulled fresh from the repo, never from Drive.

## STEP 4 — Push (updated 2026-11-02)
1. Work on a branch, never directly on `main`.
2. Before pushing, run the validators:
   - `git show main:index.html > /tmp/base.html`
   - `node tools/validate.js . /tmp/base.html`
   - `node tools/test-timeline.js .`
   Both must exit 0 (Trap 6).
3. Push, open a PR to `main`, and merge only on Allan's OK. Cloudflare deploys `main` within
   about a minute.

**The PAT flow is retired.** No personal access token is pasted into chats. The old method
(fine-grained PAT plus the REST blob-SHA PUT) remains a last-resort fallback only, if the
GitHub link is ever broken and cannot be fixed.

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
