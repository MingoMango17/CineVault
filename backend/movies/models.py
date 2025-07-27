from django.db import models
from django.core.validators import FileExtensionValidator


class Movie(models.Model):
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    date_added = models.DateField(auto_now_add=True)
    video_file = models.FileField(
        upload_to="videos/",
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["mp4", "webm", "mkv"])],
    )

    date_released = models.DateField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
    director = models.CharField(max_length=255, null=True, blank=True)
    poster_url = models.CharField(max_length=511, null=True, blank=True)
    poster_image = models.FileField(
        upload_to="images/",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title