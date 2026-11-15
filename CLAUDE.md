# WARMAPS — standing rules for Claude Code sessions

- **Search, read and summarize tasks run on Haiku 5.5 by default** (Allan's rule, 2026-11-15; it applies in every repo and chat, not only here). When you spawn a subagent for searching, reading or summarizing, use `scout`, `reader` or `summarizer` from `.claude/agents/` (pinned to `claude-haiku-5-5`), or pass `model: haiku` if you use another agent type. Do the work in the main session only when the task needs judgment, writing or editing. **Deviate only** (1) in a rare case where the task needs more capability, or (2) as a review step when Haiku's output looks overly sparse or misaligned: then check it yourself or re-run on a stronger model, and tell Allan in one line that you did and why.
- Editorial charter: the site records who said what, with sources, and never rules on whether a claim is true (see `STATE.md`).
- Read `STATE.md` and, for v2 work, `docs/v2/V2_SESSION_COMMON.md` before changing anything.
