from django.db import models


class Feedback(models.Model):
    experiment_slug = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.experiment_slug}: {self.message[:40]}"
