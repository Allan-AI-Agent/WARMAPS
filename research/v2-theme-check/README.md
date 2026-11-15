---
title: v2 theme check (reference for the theme validator)
version: v1.0
date: 2026-11-15
author: Claude (Fable 5.2), session F1b-2
status: evidence for DESIGN_SYSTEM_v1.md v1.2 sections 13 and 14; not app code
---

**What this is.** The three built-in theme files and the script that computes every contrast ratio and
colour-difference figure quoted in the design system. Slice 2 moves the script to `tools/validate-theme.js` and the
themes to `v2/themes/`.

| File | What |
|---|---|
| `themes/classic.json`, `themes/ops.json`, `themes/paper.json` | The built-in themes, in the theme file format (DESIGN_SYSTEM 13.1) |
| `theme-check.js` | The checks and limits of DESIGN_SYSTEM 13.3. No dependencies |
| `out-table.txt` | Every computed figure, as run on 2026-11-15 (78 checks per theme, all pass) |

Run: `node theme-check.js themes/*.json` (add `--table` for every figure). Exit code 0 means every file passed.

Methods: WCAG 2 relative-luminance contrast, rounded down; colour difference as OKLab distance times 100;
colour-vision simulation after Machado, Oliveira and Fernandes (2009), full severity. The limits are this
project's own (INFERRED; not validated with readers).
