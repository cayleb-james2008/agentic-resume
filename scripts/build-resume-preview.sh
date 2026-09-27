#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pdf="$root/Cayleb-James-resume.pdf"
preview="$root/assets/img/resume-preview.webp"

for command in pdfinfo pdftoppm magick; do
  command -v "$command" >/dev/null || { echo "Missing $command" >&2; exit 1; }
done

pages="$(pdfinfo "$pdf" | awk '/^Pages:/ { print $2 }')"
[[ "$pages" == 1 ]] || { echo "Expected a one-page PDF, found $pages" >&2; exit 1; }

temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT
pdftoppm -f 1 -singlefile -png -r 110 "$pdf" "$temporary/page"
magick "$temporary/page.png" -resize 700x906 -strip -quality 84 "$preview"
magick identify -format 'Preview: %wx%h, %b\n' "$preview"
