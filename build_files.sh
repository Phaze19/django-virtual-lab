#!/bin/bash
set -e

echo "==> Installing project dependencies..."
export PIP_BREAK_SYSTEM_PACKAGES=1

if command -v uv &> /dev/null; then
    uv pip install --system -r requirements.txt
else
    python3 -m pip install --break-system-packages -r requirements.txt
fi

echo "==> Applying database migrations..."
python3 manage.py migrate --no-input

echo "==> Collecting static assets..."
python3 manage.py collectstatic --no-input --clear

echo "==> Build finished successfully."
