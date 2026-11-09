---
title: WARMAPS v2 — integrated plan
version: v0.1
date: 2026-11-02 (War Day 248)
author: Claude (Opus 5.5) for Allan Sanceau
status: DRAFT — one-repo ruling (B) made 2026-11-02; GEV rulings pending
companions: DECISION_2026-11-02_one-repo-for-all-theaters.md, WARMAPS_v2_GEV_INTEGRATION_SPEC_2026-11-02_v0.1.md, layers.config.json, SESSION_PROMPT_P0_unblock_and_ship_v01.09.03.md
budget: fits Allan's 2–5 hours/week; every phase leaves the live site better than before
---

> **Update 2026-11-08 (Day 254):** P0 and P1 are DONE. GitHub access fixed (Claude relinked to Allan-AI-Agent), v01.09.03 dynamic timeline end and the 44 pass-1 events (IDs 342-385) merged on 2026-11-02 (PR #2), cold read passed. STATE.md is the live record; section 1 below is the pre-build snapshot.

# 1. State of record on 2026-11-02 (all VERIFIED by fetch unless tagged)
- Live and `main`: **v01.09.02** (built Sep 17). index.html 308,634 bytes, identical to main.
- Timeline cap `maxDay: 220`; today is **Day 248**, so today is unreachable (F-002 recurrence).
- Latest live event: **Day 153 (Jul 30)**. 341 events. Gap: 95 days.
- Staged, never pushed: **v01.09.03** dynamic timeline end (recipe on Drive `126dhHXq4PwVS3OstjdnAj5AbiK8BLd9d`; reproducible from the repo).
- Researched, not inserted: **pass 1, Days 152–170, 44 events, IDs 342–385** (Drive `1LfNlb0cC1NsXeJvZ6PYS0iSkxQX2OE_K`).
- Intake: script v0.3.1 + 37-feed list on Drive `_RESEARCH/WARMAPS/_PIPELINE`; one manual run Sep 30; **no scheduled job**.
- RU: design handover v1.0 only; no repo, no data loaded.
- GitHub push from Claude sessions: **still refused** ("you need push access to allan-ai-agent/warmaps").
- STATE.md on main is stale (says last verified Sep 17).

# 2. Target: what v2 is
One site, one repo, four theaters, two views.
- **Theaters:** Iran war (full fidelity), Russia–Ukraine (full fidelity), East Asia and Caribbean (intake first, events later).
- **Views:** 2D Leaflet map (phone default, fallback) and 3D globe (GEV graft) reading the same data.
- **Interface:** theater switcher; touch-first dock rail; pin/snap panels; side-by-side view; info cards for events and tracks. Landscape and portrait, phone, Fire tablet and PC.
- **Data:** schema REV B with `theater` field; one events file per theater; nightly raw intake; candidate events proposed by AI, approved by Allan.

# 3. Repo layout (ruling B)
```
/                      v1 app stays here until P4 cutover (live URL unchanged)
  index.html, warmaps-data.js, STATE.md, KNOWN_FAILURES.md, _headers, sw.js, manifest.json
/theaters/
  iran-war/events.json        (P4: migrated from warmaps-data.js)
  russia-ukraine/events.json  (P4: from RU design, Timeline Engine v2)
  east-asia/  caribbean/      (intake only at first)
/intake/
  warmaps_intake.py, feeds.json
  raw/YYYY/MM/DD/<theater>.json
  candidates/YYYY-MM-DD.json  (AI-drafted events awaiting approval)
/globe/                       (P6: GEV graft; UPSTREAM.md pins the upstream commit)
  layers.config.json
/tools/                       validators (syntax, tags, ID continuity, war-day math), warmaps-mirror.sh
/.github/workflows/
  intake.yml                  nightly intake, no AI
  validate.yml                runs validators on every push
```

# 4. Phases
| Phase | Work | Model | Allan's part | Exit test |
|---|---|---|---|---|
| **P0 Unblock** | Fix Claude ↔ GitHub push rights; confirm a Claude Code web session can commit | — | Open claude.ai/code, pick the repo, one test commit | A Claude session commits without a pasted token |
| **P1 Ship** | v01.09.03 (dynamic timeline end) + 44 pass-1 events + STATE.md refresh | Opus 5.5 build, Haiku 5.5 validate | Cold read on phone (Trap 12) | Badge and timeline end read cold match code-computed values |
| **P2 Backfill** | Days 171–248 in ~3-week passes using parallel research agents plus an independent checker; stat boxes to latest figures | Opus 5.5 research, Sonnet 5.5 drafting, Haiku check | Spot-approve contested items | Latest event within 2 days of today |
| **P3 Automate** | GitHub Actions nightly intake into `intake/raw/`; validate.yml; scheduled Claude task drafts candidate events; phone approval inbox | Sonnet 5.5 nightly, Haiku check | Approve/reject on phone, minutes a day | 7 straight nights with no human fetching |
| **P3b Collector** | Start the AOI aircraft/vessel sampler for history (see GEV spec §7) | none | Rule on R-GEV-3 (OPSEC) | Daily AOI files accumulating |
| **P4 Data layer** | Schema REV B + theater; migrate Iran; load RU per handover v1.0 (rev 1.1 folded in) | Opus 5.5 schema, Sonnet code, Haiku validate | Rule on contested RU items | Both theaters load from `theaters/` with zero ID or date errors |
| **P5 Interface** | Theater switcher, dock rail, pin/snap, side-by-side, info cards (from the R3 mock-up) | Sonnet 5.5 + Opus review | Test on phone, Fire tablet, PC | No overlaps at 3 widths x 2 orientations |
| **P6 Globe** | GEV graft per spec: events + AOIs + military flights + GNSS first | Opus 5.5 | Device test | Globe usable on the Fire tablet, or 2D stays default there |
| **P7 Sources** | Structured sources (ACLED/GDELT where terms allow), more feeds via the S1 registry | Sonnet | Approve sources | Registry with access verdict per source |

# 5. Automation map
| Job | Where | AI? | Cost |
|---|---|---|---|
| Nightly fetch, sort, dedupe (37 feeds) | GitHub Actions cron | No | Free (public repo) |
| Validate every push | GitHub Actions | No | Free |
| Deploy | Cloudflare from GitHub (confirm GPT's "Option C") | No | Free tier |
| Draft candidate events from raw intake | Scheduled Claude task (Sonnet 5.5) | Yes | Low |
| Check candidates (dates, IDs, duplicates) | Same task, Haiku 5.5 pass | Yes | Very low |
| Approval | Phone inbox page | No | — |
| Drive mirror | `tools/warmaps-mirror.sh` on OSIRIS with rclone | No | — |
| Key rotation | GitHub app removes the PAT; reminder continues (next Nov 27) | No | — |

Honest-access rules carry over: honest User-Agent, robots.txt respected, no circumvention. Some sites may refuse GitHub's shared servers (INFERRED); those become human-only, same as today.

# 6. How the 2026 Claude releases are used
- **Opus 5.5** (Sep 22): long unattended agentic coding, about 40% cheaper than Opus 5 (Anthropic). Use for whole-phase build sessions.
- **Sonnet 5.5** (Sep 28), **Haiku 5.5** (Oct 7): nightly drafting and checking at low cost.
- **Claude Code on web and mobile with the GitHub app:** direct commits, no pasted PAT, drivable from the phone.
- **Scheduled tasks:** already running 8 for you; one more for candidate drafting.
- **Parallel research agents with an independent checker** for P2.
- Not relied on: Duet (Oct 21 research preview).

# 7. Risks
- Scope creep (the cause of the 5-week stall). Mitigation: phase order is fixed; GEV waits for P6.
- Curation is the real bottleneck; automation drafts but Allan approves.
- AISStream publishes no terms and no uptime guarantee; its docs direct a server relay to clients, so vessels go public with attribution. Rules could change without notice; keep the relay swappable.
- Live military tracks: RULED 2026-11-02, no self-imposed delay; provider data shown as published, labeled OBSERVED.
- Fire-tablet performance of the 3D globe is UNKNOWN until tested.
- GitHub push rights: until P0 passes, everything above is blocked.

# 8. Open rulings
- R-GEV-1..5 (see the GEV spec §9).
- R-V2-1: approve the phase order P0–P7.
- R-V2-2: approve the repo layout (v1 stays at root until the P4 cutover).
