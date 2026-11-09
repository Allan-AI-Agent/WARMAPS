#!/usr/bin/env python3
"""WARMAPS nightly intake, v0.4 (2026-11-09; v0.3.1 moved into the repo for GitHub Actions).

Fetches the feeds in feeds.json with an honest User-Agent, after a robots.txt check.
Keeps only conflict/geopolitical items, deduplicates them, assigns each to a theater
by keyword rules (no AI), and writes, per run:
  <out>/<theater>.json   machine-readable items (for the candidate-drafting step)
  <out>/<theater>.md     human-readable brief
  <out>/run.json         run log (feed statuses, counts)
Output is RAW INTAKE: headlines as published by each outlet, not verified WARMAPS events.

Usage: python3 intake/warmaps_intake.py [--hours 24] --out DIR
"""
import argparse, json, re, ssl, time, urllib.request, urllib.robotparser, urllib.parse, urllib.error
import html, datetime as dt, os, gzip
import concurrent.futures as cf
import feedparser

UA = "WARMAPS-research-bot/0.4 (personal non-commercial research; honest UA; respects robots.txt; +https://github.com/Allan-AI-Agent/WARMAPS)"
MST = dt.timezone(dt.timedelta(hours=-7))
WAR_START = dt.date(2026, 2, 28)          # Day 1
CA = "/root/.ccr/ca-bundle.crt"           # Claude sandbox proxy; absent on GitHub Actions
CTX = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()


def war_day(d):
    return (d - WAR_START).days + 1


def kw(words):
    return re.compile(r"\b(" + "|".join(words) + r")\b", re.I)


CONFLICT = kw([
    "war", "wars", "warfare", "military", "militar", "army", "troops", "soldiers?", "strikes?", "air ?strikes?",
    "missiles?", "drones?", "attacks?", "attacked", "bomb(s|ing|ed)?", "shelling", "killed", "casualt(y|ies)",
    "ceasefire", "truce", "invasion", "offensive", "navy", "naval", "warships?", "sanctions?", "nuclear",
    "weapons?", "arms", "defen[cs]e", "security council", "diplomat(s|ic|ics)?", "diplomacy", "talks",
    "negotiat\\w*", "treaty", "summit", "foreign minister", "coup", "insurgen\\w*", "militants?", "rebels?",
    "hostages?", "prisoners?", "blockade", "tariffs?", "espionage", "spy", "cyber ?attacks?", "refugees?",
    "humanitarian", "occupation", "occupied", "annex\\w*", "sovereignty", "border", "territorial",
    "coast guard", "intercept\\w*", "executions?", "executed", "raids?", "clashes", "gunfire", "shot dead",
    "airspace", "mobili[sz]ation", "conscription", "martial law", "protests?", "crackdown", "detained",
    "arrested", "regime", "geopolitic\\w*", "nato", "pentagon", "kremlin", "irgc", "hezbollah", "hamas",
    "houthis?", "idf", "tanker", "strait", "chokepoint",
    "guerra", "ataques?", "bombardeos?", "misil(es)?", "sanciones", "r[eé]gimen", "presos? pol[ií]ticos?",
    "protestas?", "frontera", "narcolanchas?", "lanchas?", "armada", "ej[eé]rcito", "diplom[aá]tic\\w*",
    "cumbre", "embajada", "represi[oó]n", "detenid[oa]s?", "fuerzas armadas", "narcotr[aá]fico",
])

THEATERS = {
    "iran-war": kw([
        "iran\\w*", "tehran", "israel\\w*", "gaza\\w*", "west bank", "palestin\\w*", "hamas", "hezbollah",
        "lebanon", "lebanese", "beirut", "houthis?", "ansarullah", "yemen\\w*", "sanaa", "red sea",
        "bab el-mandeb", "hormuz", "persian gulf", "gulf states?", "saudi\\w*", "riyadh", "jordan(ian)?",
        "amman", "iraq\\w*", "baghdad", "qatar\\w*", "doha", "u\\.?a\\.?e\\.?", "emirat\\w*", "abu dhabi",
        "dubai", "kuwait\\w*", "bahrain\\w*", "oman\\w*", "muscat", "irgc", "idf", "netanyahu", "khamenei",
        "araghchi", "pezeshkian", "centcom", "syria\\w*", "damascus", "jerusalem", "tel aviv",
        "qeshm", "bandar abbas", "kharg", "natanz", "fordow", "isfahan", "middle east", "gulf of oman",
    ]),
    "russia-ukraine": kw([
        "russia\\w*", "ukrain\\w*", "kyiv", "kiev", "moscow", "kremlin", "putin", "zelensky\\w*", "donbas",
        "donetsk", "luhansk", "crimea\\w*", "kharkiv", "zaporizhzhia", "odesa", "odessa", "kursk", "kherson",
        "pokrovsk", "belarus\\w*", "lukashenko", "black sea fleet", "wagner",
    ]),
    "east-asia": kw([
        "china", "chinese", "beijing", "xi jinping", "taiwan\\w*", "taipei", "lai ching-te", "japan\\w*",
        "tokyo", "north korea\\w*", "south korea\\w*", "korean peninsula", "pyongyang", "seoul",
        "kim jong un", "kim yo jong", "dprk", "n\\. ?korea\\w*", "s\\. ?korea\\w*", "dmz", "pla",
        "south china sea", "east china sea", "senkaku", "philippines?", "philippine", "okinawa",
    ]),
    "caribbean": kw([
        "cuba\\w*", "havana", "la habana", "venezuel\\w*", "caracas", "maduro", "caribbean", "caribe",
        "drug boats?", "narco\\w*", "puerto rico", "haiti\\w*", "port-au-prince", "trinidad",
        "southern command", "southcom", "d[ií]az-canel",
    ]),
}
THEATER_ORDER = ["iran-war", "russia-ukraine", "east-asia", "caribbean"]
LABELS = {"iran-war": "US+ISRAEL vs IRAN (Iran war theater)", "russia-ukraine": "RUSSIA vs UKRAINE",
          "east-asia": "GEO-POLITICS - EAST ASIA", "caribbean": "GEO-POLITICS - CARIBBEAN",
          "global": "GEO-POLITICS - GLOBAL (all other conflict and geopolitical news)"}


def classify(title, summary, home="global"):
    t, s = title or "", summary or ""
    if not (CONFLICT.search(t) or CONFLICT.search(s)):
        return None, {}
    scores = {}
    for th, rx in THEATERS.items():
        sc = 2 * len(rx.findall(t)) + len(rx.findall(s))
        if sc:
            scores[th] = sc
    if not scores:
        return (home if home in THEATERS else "global"), {}
    best = max(scores.values())
    primary = next(x for x in THEATER_ORDER if scores.get(x) == best)
    return primary, {x: v for x, v in scores.items() if x != primary}


_robots = {}


def robots_verdict(url):
    """404/410 = no robots.txt = allowed (RFC 9309); 401/403 = treated as disallowed; unreadable = skipped."""
    p = urllib.parse.urlparse(url)
    root = f"{p.scheme}://{p.netloc}"
    if root not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        try:
            r = urllib.request.urlopen(urllib.request.Request(root + "/robots.txt", headers={"User-Agent": UA}),
                                       timeout=15, context=CTX)
            rp.parse(r.read().decode("utf-8", "ignore").splitlines())
            _robots[root] = ("parsed", rp)
        except urllib.error.HTTPError as e:
            _robots[root] = ("allow-all", None) if e.code in (404, 410) else (f"robots-{e.code}", None)
        except Exception as e:
            _robots[root] = (f"robots-unreachable:{type(e).__name__}", None)
    kind, rp = _robots[root]
    if kind == "parsed":
        ok = rp.can_fetch(UA, url)
        return ok, "robots ok" if ok else "robots.txt disallows"
    if kind == "allow-all":
        return True, "no robots.txt"
    return False, kind


def fetch(feed):
    ok, note = robots_verdict(feed["url"])
    if not ok:
        return feed, None, f"SKIPPED ({note})"
    try:
        req = urllib.request.Request(feed["url"], headers={"User-Agent": UA, "Accept-Encoding": "identity"})
        raw = urllib.request.urlopen(req, timeout=25, context=CTX).read()
        if raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        parsed = feedparser.parse(raw)
        return feed, parsed, f"ok ({len(parsed.entries)} entries)"
    except urllib.error.HTTPError as e:
        return feed, None, f"HTTP {e.code}"
    except Exception as e:
        return feed, None, f"error {type(e).__name__}"
    finally:
        time.sleep(0.5)


INVISIBLE = "[" + "".join(map(chr, (0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF, 0xAD))) + "]"


def clean(s, n):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    s = re.sub(INVISIBLE, "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "..."


def norm_title(t):
    return re.sub(r"[^a-z0-9 ]", "", (t or "").lower())[:90]


def run(hours, outdir):
    here = os.path.dirname(os.path.abspath(__file__))
    feeds = json.load(open(os.path.join(here, "feeds.json")))["feeds"]
    now = dt.datetime.now(dt.timezone.utc)
    cutoff = now - dt.timedelta(hours=hours)
    with cf.ThreadPoolExecutor(6) as ex:
        results = list(ex.map(fetch, feeds))

    status, items, seen_links, seen_titles = [], [], set(), set()
    stats = {"entries": 0, "undated": 0, "old": 0, "notconflict": 0, "dupes": 0}
    for feed, parsed, st in results:
        status.append({"source": feed["name"], "origin": feed["origin"], "status": st})
        if not parsed:
            continue
        for e in parsed.entries:
            stats["entries"] += 1
            tp = e.get("published_parsed") or e.get("updated_parsed")
            if not tp:
                stats["undated"] += 1
                continue
            when = dt.datetime(*tp[:6], tzinfo=dt.timezone.utc)
            if when < cutoff or when > now + dt.timedelta(hours=2):
                stats["old"] += 1
                continue
            title, link = clean(e.get("title"), 200), e.get("link", "")
            summary = clean(e.get("summary") or e.get("description"), 400)
            theater, also = classify(title, summary, feed.get("home", "global") if feed.get("fallback") else "global")
            if not theater:
                stats["notconflict"] += 1
                continue
            nt = norm_title(title)
            if link in seen_links or nt in seen_titles:
                stats["dupes"] += 1
                continue
            seen_links.add(link)
            seen_titles.add(nt)
            items.append(dict(when=when.isoformat(), title=title, link=link, summary=clean(summary, 240),
                              source=feed["name"], origin=feed["origin"], theater=theater, also=sorted(also)))

    os.makedirs(outdir, exist_ok=True)
    today = now.astimezone(MST).date()
    counts = {}
    for th, label in LABELS.items():
        sel = sorted([i for i in items if i["theater"] == th], key=lambda i: i["when"], reverse=True)
        counts[th] = len(sel)
        json.dump(sel, open(os.path.join(outdir, f"{th}.json"), "w"), indent=1, ensure_ascii=False)
        lines = [f"# WARMAPS DAILY INTAKE - {label}", "",
                 f"**Run:** {now.astimezone(MST):%Y-%m-%d %H:%M} MST ({now:%H:%M} UTC) | **War Day {war_day(today)}** "
                 f"(Feb 28, 2026 = Day 1) | **Window:** last {hours} h | **Items:** {len(sel)}", "",
                 "> **RAW INTAKE, NOT VERIFIED.** Headlines as each outlet published them, sorted by keyword rules "
                 "(no AI judgment). Nothing here is a WARMAPS event until curated. `origin` is provenance, never credibility.", ""]
        for i in sel:
            w = dt.datetime.fromisoformat(i["when"]).astimezone(MST)
            also = f" | also: {', '.join(i['also'])}" if i["also"] else ""
            lines += [f"- **{w:%m-%d %H:%M} MST | {i['source']}** ({i['origin']}){also}  ",
                      f"  [{i['title']}]({i['link']})  "]
            if i["summary"] and th != "global":
                lines.append(f"  {i['summary']}")
        open(os.path.join(outdir, f"{th}.md"), "w").write("\n".join(lines) + "\n")
    log = {"run_utc": now.isoformat(timespec="seconds"), "run_mst": f"{now.astimezone(MST):%Y-%m-%d %H:%M}",
           "war_day": war_day(today), "window_hours": hours, "counts": counts, "stats": stats, "feeds": status}
    json.dump(log, open(os.path.join(outdir, "run.json"), "w"), indent=1)
    print(json.dumps({k: log[k] for k in ("run_mst", "war_day", "counts", "stats")}, indent=1))
    print("not ok:", [f for f in status if not f["status"].startswith("ok")])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--hours", type=int, default=24)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    run(a.hours, a.out)
