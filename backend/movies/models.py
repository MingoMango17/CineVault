from django.db import models
from django.core.validators import FileExtensionValidator

class Movie(models.Model):
    PENDING = 0
    PROCESSING = 1
    COMPLETED = 2
    FAILED = 3
    PROCESSING_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    date_added = models.DateField(auto_now_add=True)
    video_file = models.FileField(
        upload_to="videos/original/",
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["mp4", "webm", "mkv"])],
    )

    processing_status = models.IntegerField(choices=PROCESSING_STATUS_CHOICES, default=PENDING
    )
    processing_progress = models.IntegerField(default=0)  # 0-100
    processing_error = models.TextField(null=True, blank=True)

    # Generated content
    thumbnail = models.ImageField(upload_to="thumbnails/", null=True, blank=True)
    hls_playlist = models.FileField(upload_to="hls/", null=True, blank=True)
    hls_folder = models.CharField(max_length=255, null=True, blank=True)

    # Metadata
    year_released = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # in seconds
    director = models.CharField(max_length=255, null=True, blank=True)
    poster_url = models.CharField(max_length=511, null=True, blank=True)
    poster_image = models.FileField(upload_to="images/", null=True, blank=True)

    # Video metadata (extracted during processing)
    video_width = models.IntegerField(null=True, blank=True)
    video_height = models.IntegerField(null=True, blank=True)
    video_bitrate = models.IntegerField(null=True, blank=True)
    video_codec = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title
