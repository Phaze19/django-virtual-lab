import os
import sys
from django.apps import AppConfig


class LabConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "lab"

    def ready(self):
        # Auto-apply database migrations on serverless instances if fresh
        if os.environ.get("VERCEL") and "test" not in sys.argv:
            try:
                from django.core.management import call_command
                call_command("migrate", interactive=False)
            except Exception:
                pass
