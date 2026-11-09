---
title: DECISION — One WARMAPS repo for all theaters (RU folds in)
date: 2026-11-02
decided_by: Allan Sanceau
recorded_by: Claude (Opus 5.5)
status: RULED
supersedes: "Separate project and repo (Allan-AI-Agent/WARMAPS-RU)", ruled 2026-07-19
---

# Ruling
**Option B.** Russia–Ukraine (and later East Asia, Caribbean, and the God's Eye View globe) live in the existing repo `Allan-AI-Agent/WARMAPS`, one folder per theater. No `WARMAPS-RU` repo will be created.

# Why (as presented 2026-11-02)
- One 3D globe and one date scrubber must read every theater; one repo means one data format, one validator, one deploy, one automated feed.
- Cheap to change now: the WARMAPS-RU repo was never created (raw.githubusercontent returned 404 on 2026-11-02, INFERRED not created).
- One credential path (Claude GitHub app) instead of two.

# What carries over unchanged from the RU design
- `WARMAPS-RU_Design_Handover_v1.0.md` (Drive id `1Y6HBT0yjAk6hGz7Wq3Zy5Sjw-oALLd7s`): Timeline Engine v2 (monthly 2022–2024, daily 2025→), Data Schema v2, P0–P6 phases, model assignment (Sonnet code, Haiku validation, Opus contested judgment, Fable at 4 touchpoints only).
- RU naming for its theater build label: "WarMaps - Russia vs Ukraine v01.00.y".
- STATE.md is the single source of truth; it gains one section per theater.

# What changes
- RU Phase 1 is no longer "fork the repo"; it becomes "add `theaters/russia-ukraine/` to the shared data layer".
- RU Drive folders stay as the design/research archive (`15p_-8KxYQe0qaFXVDn2Zx9M_C6rixIht`).
- The old memory/governance line "separate project and repo" is superseded by this record.
