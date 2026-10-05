#!/bin/bash
# Sync the review bundle to Google Drive, and pull reviewer output back.
#
# Drive for Desktop mounts the account as an ordinary folder, so this is just
# file copying — no API credentials, no tokens, nothing for an agent to hold.
#
#   ./drive-sync.sh push    publish the current bundle to Drive
#   ./drive-sync.sh pull    copy reviews/ back from Drive into the repo
#   ./drive-sync.sh status  show what is where
#
# Earlier iteration folders are immutable: push NEVER deletes or overwrites an
# iteration that is already in Drive. It refuses instead, so a re-run cannot
# quietly rewrite a bundle a reviewer is part-way through.

set -euo pipefail

REPO="/Users/prashanthvenkataraman/Documents/IDEO/fieldnotes"
SRC="$REPO/fieldnotes/snapshot/review"
BUNDLE_NAME="Prototype Review"
LOCAL_REVIEWS="$REPO/fieldnotes/review-inbox"

find_drive() {
  # Drive for Desktop mounts at ~/Library/CloudStorage/GoogleDrive-<account>/
  local m
  m=$(ls -d "$HOME"/Library/CloudStorage/GoogleDrive-*/ 2>/dev/null | head -1 || true)
  [ -z "$m" ] && return 1
  m="${m%/}"   # ls -d adds a trailing slash; keep it off the joined paths
  # "My Drive" is the personal root; shared drives sit beside it
  if   [ -d "$m/My Drive" ];     then printf '%s' "$m/My Drive"
  elif [ -d "$m/Shared drives" ]; then printf '%s' "$m/Shared drives"
  else printf '%s' "${m%/}"; fi
}

MOUNT=$(find_drive) || {
  cat <<'EOF'
Google Drive for Desktop is not mounted.

  1. Install it:  brew install --cask google-drive
     (it needs your password — run it in your own terminal)
  2. Open Google Drive and sign in.
  3. Wait for ~/Library/CloudStorage/GoogleDrive-<account>/ to appear.

Then run this script again.
EOF
  exit 1
}

DEST="$MOUNT/$BUNDLE_NAME"

case "${1:-status}" in

push)
  echo "Drive mount : $MOUNT"
  echo "Destination : $DEST"
  mkdir -p "$DEST"

  # Control files at the bundle root are the only things push may overwrite.
  for f in README.md CURRENT_ITERATION.txt index.json; do
    [ -f "$SRC/$f" ] && cp "$SRC/$f" "$DEST/$f" && echo "  updated  $f"
  done
  mkdir -p "$DEST/reviews"
  [ -f "$SRC/reviews/README.md" ] && cp "$SRC/reviews/README.md" "$DEST/reviews/README.md"

  # Iterations are immutable once published.
  shopt -s nullglob
  for it in "$SRC"/iteration-*; do
    name=$(basename "$it")
    if [ -d "$DEST/$name" ]; then
      echo "  SKIP     $name — already in Drive, iterations are immutable"
      continue
    fi
    echo "  copying  $name ..."
    cp -R "$it" "$DEST/$name"
    n=$(find "$DEST/$name" -type f | wc -l | tr -d ' ')
    echo "  done     $name — $n files"
  done

  echo
  echo "Drive syncs in the background. Check the menu-bar icon for upload progress."
  ;;

pull)
  if [ ! -d "$DEST/reviews" ]; then
    echo "No reviews/ folder in Drive yet at: $DEST/reviews"; exit 1
  fi
  mkdir -p "$LOCAL_REVIEWS"
  found=0
  shopt -s nullglob
  for f in "$DEST/reviews"/*.md; do
    b=$(basename "$f")
    [ "$b" = "README.md" ] && continue
    cp "$f" "$LOCAL_REVIEWS/$b"
    echo "  pulled   $b"
    found=$((found+1))
  done
  [ "$found" -eq 0 ] && echo "  nothing yet — the reviewer has not written a review file."
  echo
  echo "Local copy: $LOCAL_REVIEWS"
  ;;

status)
  echo "Drive mount   : $MOUNT"
  echo "Bundle in Drive: $DEST"
  if [ -d "$DEST" ]; then
    echo "  iterations  : $(ls -d "$DEST"/iteration-* 2>/dev/null | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"
    echo "  files       : $(find "$DEST" -type f 2>/dev/null | wc -l | tr -d ' ')"
    echo "  reviews/    : $(ls "$DEST/reviews"/*.md 2>/dev/null | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"
  else
    echo "  not pushed yet — run: $0 push"
  fi
  echo "Local source  : $SRC"
  echo "  iterations  : $(ls -d "$SRC"/iteration-* 2>/dev/null | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"
  ;;

*)
  echo "usage: $0 {push|pull|status}"; exit 2;;
esac
