#!/usr/bin/env bash
set -euo pipefail

HERE="$(dirname -- "$(readlink -f -- "$0")")"
PYTHON="${PYTHON:-/home/cayleb/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python}"

if ! "$PYTHON" -c 'import reportlab' >/dev/null 2>&1; then
  printf 'ReportLab is required. Install resume/requirements.txt or set PYTHON to an interpreter with ReportLab.\n' >&2
  exit 1
fi

exec "$PYTHON" "$HERE/build_resume.py" "$@"
