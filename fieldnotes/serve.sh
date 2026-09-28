#!/bin/sh
# Serve the captured site. It is entirely client-side, so any static
# server works; this one needs nothing installed beyond python3.
cd "$(dirname "$0")/snapshot" || exit 1
echo "Fieldnotes → http://localhost:${1:-8765}"
exec python3 -m http.server "${1:-8765}"
