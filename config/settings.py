import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

IS_VERCEL = bool(os.environ.get("VERCEL"))

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-template-learning-lab-development-only")

# Default to False on Vercel unless explicitly overridden
if "DJANGO_DEBUG" in os.environ:
    DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")
else:
    DEBUG = not IS_VERCEL

hosts_env = os.environ.get("ALLOWED_HOSTS", "")
if hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in hosts_env.split(",") if h.strip()]
else:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]", ".vercel.app", "*"]

CSRF_TRUSTED_ORIGINS = [
    "https://*.vercel.app",
]
csrf_env = os.environ.get("CSRF_TRUSTED_ORIGINS", "")
if csrf_env:
    CSRF_TRUSTED_ORIGINS.extend([origin.strip() for origin in csrf_env.split(",") if origin.strip()])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "lab",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

WSGI_APPLICATION = "config.wsgi.application"

# Database configuration (with serverless /tmp fallback for Vercel)
db_path = BASE_DIR / "db.sqlite3"
if IS_VERCEL:
    import shutil
    tmp_db = Path("/tmp") / "db.sqlite3"
    if not tmp_db.exists() and db_path.exists():
        try:
            shutil.copyfile(db_path, tmp_db)
        except Exception:
            pass
    db_path = tmp_db

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": db_path,
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_ROOT.mkdir(parents=True, exist_ok=True)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

