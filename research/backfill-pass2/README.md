# Backfill pass 2 records (Days 171-254, Aug 17 - Nov 8 2026)

Audit trail for PR #6 (event IDs 386-601). Data in `warmaps-data.js` is the published form;
these files keep what the published schema cannot yet hold.

- `RESEARCH_BRIEF.md` — the rules the four research agents followed.
- `VERIFY_BRIEF.md` — the rules the four independent verifier agents followed.
- `events_386-600_with_tiers_sources.json` — every event with its `id`, `tier`
  (milestone/major/standard), `fog`, full `sources` list, research block (`chunk` A-D),
  verifier index (`vid`) and `verified` verdict (PASS / FIX, or absent = not sampled).
- `verdict_A..D.json`, `verdict_rest.json` — verifier verdicts keyed by `vid`, with the fix applied and a one-line note.

Coverage: all 216 researched events verified in two passes (129, then the other 87):
171 PASS, 44 FIX, 1 DROP (duplicate). 215 published as IDs 386-600 (renumbered after the drop).
Stored in the repo (not Drive) on 2026-11-09 to avoid relaying ~300 KB through a chat;
mirror to Drive _RESEARCH/WARMAPS via the OSIRIS rclone job when it exists.
