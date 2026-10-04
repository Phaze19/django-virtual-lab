from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("experiment_slug", "short_message", "created_at")
    list_filter = ("experiment_slug", "created_at")
    search_fields = ("experiment_slug", "message")
    readonly_fields = ("created_at",)

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message[:60] + "..." if len(obj.message) > 60 else obj.message
