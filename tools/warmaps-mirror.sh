#!/usr/bin/env bash
# ==============================================================================
# WARMAPS — OSIRIS MIRROR & ARCHIVE
# ==============================================================================
# Mirrors the WARMAPS GitHub repository to OSIRIS and pushes zipped snapshots of
# TAGGED builds to Google Drive. No AI involvement, no size limits, no token cost.
#
# WHY A GIT MIRROR RATHER THAN FILE SNAPSHOTS
#   A git repository IS the archive. `--mirror` clones every commit, branch and
#   tag, so EVERY push ever made is recoverable — not just the ones we thought to
#   snapshot. Ongoing cost is one `git fetch`; storage is tens of megabytes.
#
# BACKUP POSTURE ACHIEVED (3-2-1)
#   3 copies : GitHub, OSIRIS, Google Drive
#   2 media  : GitHub's infrastructure + OSIRIS disk
#   1 offsite: Google Drive
#
# PREREQUISITES (one time, on OSIRIS)
#   sudo apt install git zip rclone
#   rclone config          # create a remote named "gdrive"
#   mkdir -p /srv/warmaps
#
# INSTALL
#   cp warmaps-mirror.sh /usr/local/bin/ && chmod +x /usr/local/bin/warmaps-mirror.sh
#   crontab -e
#     17 3 * * *  /usr/local/bin/warmaps-mirror.sh >> /var/log/warmaps-mirror.log 2>&1
#
# USAGE
#   warmaps-mirror.sh                 # fetch + archive any new tags  (cron mode)
#   warmaps-mirror.sh --list          # list every tag and commit available
#   warmaps-mirror.sh --restore REF   # extract a tag/commit/date to a folder
#   warmaps-mirror.sh --restore-file REF path/to/file
# ==============================================================================
set -euo pipefail

REPO_URL="https://github.com/Allan-AI-Agent/WARMAPS.git"
BASE="/srv/warmaps"
MIRROR="$BASE/WARMAPS.git"          # bare mirror — the real archive
STAGE="$BASE/stage"                 # extraction workspace
ARCHIVE="$BASE/archive"             # zipped tagged builds
SEEN="$BASE/.archived_tags"         # tags already pushed to Drive
RCLONE_REMOTE="gdrive"
DRIVE_PATH="AI Workspace/Anthropic/Projects/WARMAPS/_BUILD_MILESTONES"

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }

mkdir -p "$BASE" "$STAGE" "$ARCHIVE"; touch "$SEEN"

# --- keep the mirror current -------------------------------------------------
sync_mirror() {
  if [ ! -d "$MIRROR" ]; then
    log "first run — cloning full mirror (all history, all tags)"
    git clone --mirror "$REPO_URL" "$MIRROR"
  else
    git --git-dir="$MIRROR" fetch --prune --tags origin '+refs/*:refs/*'
  fi
  log "mirror ok: $(git --git-dir="$MIRROR" rev-list --all --count) commits, $(git --git-dir="$MIRROR" tag | wc -l) tags"
}

# --- archive any tag we have not archived before ------------------------------
archive_new_tags() {
  local tag sha when zipname
  for tag in $(git --git-dir="$MIRROR" tag); do
    grep -qxF "$tag" "$SEEN" && continue
    sha=$(git --git-dir="$MIRROR" rev-list -n1 "$tag")
    when=$(git --git-dir="$MIRROR" show -s --format=%cI "$sha")
    zipname="WARMAPS_${tag}_${when:0:10}.zip"
    log "new tag: $tag ($sha) -> $zipname"

    rm -rf "$STAGE/$tag"; mkdir -p "$STAGE/$tag"
    git --git-dir="$MIRROR" archive "$tag" | tar -x -C "$STAGE/$tag"

    # manifest travels with the build so the zip is self-describing
    {
      echo "WARMAPS BUILD ARCHIVE"
      echo "tag:        $tag"
      echo "commit:     $sha"
      echo "committed:  $when"
      echo "archived:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
      echo "source:     $REPO_URL"
      echo
      echo "RESTORE:    git --git-dir=WARMAPS.git archive $tag | tar -x -C ./restore/"
      echo "OR:         unzip this file"
      echo
      echo "CONTENTS:"
      (cd "$STAGE/$tag" && find . -type f -printf '  %-42p %10s bytes\n' | sort)
    } > "$STAGE/$tag/ARCHIVE_MANIFEST.txt"

    (cd "$STAGE/$tag" && zip -qr "$ARCHIVE/$zipname" .)
    log "  zipped: $(du -h "$ARCHIVE/$zipname" | cut -f1)"

    if rclone copy "$ARCHIVE/$zipname" "$RCLONE_REMOTE:$DRIVE_PATH/" 2>/dev/null; then
      log "  -> Drive: $DRIVE_PATH/$zipname"
      echo "$tag" >> "$SEEN"
    else
      log "  !! rclone upload FAILED — leaving tag unmarked so it retries tomorrow"
    fi
    rm -rf "$STAGE/$tag"
  done
}

# --- restore -------------------------------------------------------------------
do_list() {
  echo "=== TAGS ==="
  git --git-dir="$MIRROR" for-each-ref --sort=-creatordate \
      --format='  %(refname:short)  %(objectname:short)  %(creatordate:iso8601)' refs/tags
  echo
  echo "=== RECENT COMMITS ==="
  git --git-dir="$MIRROR" log --all -25 --format='  %h  %cI  %s'
}

do_restore() {                    # whole build
  local ref="$1" out="$BASE/restore/$1"
  rm -rf "$out"; mkdir -p "$out"
  git --git-dir="$MIRROR" archive "$ref" | tar -x -C "$out"
  log "restored '$ref' -> $out"; ls -la "$out"
}

do_restore_file() {               # single file, any point in history
  local ref="$1" path="$2" out="$BASE/restore/${1}__$(basename "$2")"
  mkdir -p "$(dirname "$out")"
  git --git-dir="$MIRROR" show "${ref}:${path}" > "$out"
  log "restored '$path' at '$ref' -> $out ($(stat -c%s "$out") bytes)"
}

case "${1:-}" in
  --list)         sync_mirror; do_list ;;
  --restore)      sync_mirror; do_restore "${2:?need a tag/commit}" ;;
  --restore-file) sync_mirror; do_restore_file "${2:?need a ref}" "${3:?need a path}" ;;
  *)              sync_mirror; archive_new_tags; log "done" ;;
esac
