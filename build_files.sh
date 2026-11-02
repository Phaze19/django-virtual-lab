#!/bin/bash
set -e

echo "==> Installing project dependencies..."
python3 -m pip install -r requirements.txt

echo "==> Applying database migrations..."
python3 manage.py migrate --no-input

echo "==> Collecting static assets..."
python3 manage.py collectstatic --no-input --clear

echo "==> Build finished successfully."
