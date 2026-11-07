#!/bin/bash
set -e

echo "==> Setting up Python environment for build..."

# Create an isolated virtual environment to avoid PEP 668 externally-managed-environment restrictions
if python3 -m venv /tmp/build_venv 2>/dev/null; then
    echo "==> Using temporary venv in /tmp/build_venv..."
    source /tmp/build_venv/bin/activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    python manage.py migrate --no-input
    python manage.py collectstatic --no-input --clear
    deactivate
    rm -rf /tmp/build_venv
elif command -v uv &> /dev/null; then
    echo "==> Using uv package manager..."
    uv pip install --system -r requirements.txt
    python3 manage.py migrate --no-input
    python3 manage.py collectstatic --no-input --clear
else
    echo "==> Using pip with fallback flags..."
    export PIP_BREAK_SYSTEM_PACKAGES=1
    python3 -m pip install --upgrade pip 2>/dev/null || true
    python3 -m pip install -r requirements.txt 2>/dev/null || python3 -m pip install --break-system-packages -r requirements.txt
    python3 manage.py migrate --no-input
    python3 manage.py collectstatic --no-input --clear
fi

echo "==> Build finished successfully."
