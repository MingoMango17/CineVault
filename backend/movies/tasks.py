import os
import ffmpeg
from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image
import tempfile
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def process_video(self, movie_id):
    """
    Main task to process uploaded video:
    1. Extract metadata
    2. Generate thumbnail
    3. Create HLS segments
    4. Update movie status
    """
    from .models import Movie

    try:
        movie = Movie.objects.get(id=movie_id)
        movie.processing_status = Movie.PROCESSING
        movie.processing_progress = 0
        movie.save()

        # Update progress
        self.update_state(state="PROGRESS", meta={"current": 10, "total": 100})
        movie.processing_progress = 10
        movie.save()

        # Extract video metadata
        extract_video_metadata.delay(movie_id)

        # Update progress
        self.update_state(state="PROGRESS", meta={"current": 30, "total": 100})
        movie.processing_progress = 30
        movie.save()

        # Generate thumbnail
        generate_thumbnail.delay(movie_id)

        # Update progress
        self.update_state(state="PROGRESS", meta={"current": 60, "total": 100})
        movie.processing_progress = 60
        movie.save()

        # Generate HLS
        generate_hls.delay(movie_id)

        # Final update
        movie.processing_status = Movie.COMPLETED
        movie.processing_progress = 100
        movie.save()

        return {"status": "completed", "movie_id": movie_id}

    except Exception as exc:
        movie = Movie.objects.get(id=movie_id)
        movie.processing_status = Movie.FAILED
        movie.processing_error = str(exc)
        movie.save()
        logger.error(f"Video processing failed for movie {movie_id}: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task
def extract_video_metadata(movie_id):
    """Extract video metadata using ffprobe"""
    from .models import Movie

    try:
        movie = Movie.objects.get(id=movie_id)
        video_path = movie.video_file.path

        probe = ffmpeg.probe(video_path)
        video_stream = next(
            (stream for stream in probe["streams"] if stream["codec_type"] == "video"),
            None,
        )

        if video_stream:
            movie.video_width = int(video_stream.get("width", 0))
            movie.video_height = int(video_stream.get("height", 0))
            movie.video_codec = video_stream.get("codec_name", "")

            if not movie.duration and "duration" in probe["format"]:
                movie.duration = int(float(probe["format"]["duration"]))

        movie.save()
        logger.info(f"Metadata extracted for movie {movie_id}")

    except Exception as exc:
        logger.error(f"Metadata extraction failed for movie {movie_id}: {exc}")
        raise


@shared_task
def generate_thumbnail(movie_id):
    """Generate thumbnail from video"""
    from .models import Movie

    try:
        movie = Movie.objects.get(id=movie_id)
        video_path = movie.video_file.path

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_thumb:
            temp_thumb_path = temp_thumb.name

        try:
            duration = movie.duration or 30
            timestamp = max(1, duration * 0.1)

            (
                ffmpeg.input(video_path, ss=timestamp)
                .filter("scale", 320, 240)
                .output(temp_thumb_path, vframes=1, format="image2", vcodec="mjpeg")
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )

            with open(temp_thumb_path, "rb") as thumb_file:
                movie.thumbnail.save(
                    f"{movie.id}_thumbnail.jpg",
                    ContentFile(thumb_file.read()),
                    save=True,
                )

            logger.info(f"Thumbnail generated for movie {movie_id}")

        finally:
            # Clean up temp file
            if os.path.exists(temp_thumb_path):
                os.unlink(temp_thumb_path)

    except Exception as exc:
        logger.error(f"Thumbnail generation failed for movie {movie_id}: {exc}")
        raise


@shared_task
def generate_hls(movie_id):
    """Generate HLS segments for streaming"""
    from .models import Movie

    try:
        movie = Movie.objects.get(id=movie_id)
        video_path = movie.video_file.path

        # Create HLS directory
        hls_dir = os.path.join(settings.MEDIA_ROOT, "hls", str(movie.id))
        os.makedirs(hls_dir, exist_ok=True)

        playlist_path = os.path.join(hls_dir, "playlist.m3u8")
        segment_pattern = os.path.join(hls_dir, "segment_%03d.ts")

        qualities = [
            {"height": 480, "bitrate": "1000k", "name": "low"},
            {"height": 720, "bitrate": "2500k", "name": "medium"},
            {"height": 1080, "bitrate": "5000k", "name": "high"},
        ]

        master_playlist_content = "#EXTM3U\n#EXT-X-VERSION:3\n"

        for quality in qualities:
            quality_dir = os.path.join(hls_dir, quality["name"])
            os.makedirs(quality_dir, exist_ok=True)

            quality_playlist = os.path.join(quality_dir, "playlist.m3u8")
            quality_segment_pattern = os.path.join(quality_dir, "segment_%03d.ts")

            (
                ffmpeg.input(video_path)
                .filter("scale", -1, quality["height"])
                .output(
                    quality_segment_pattern,
                    format="hls",
                    vcodec="libx264",
                    acodec="aac",
                    video_bitrate=quality["bitrate"],
                    hls_time=10,
                    hls_list_size=0,
                    hls_playlist_path=quality_playlist,
                )
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )

            master_playlist_content += f"#EXT-X-STREAM-INF:BANDWIDTH={quality['bitrate'].replace('k', '000')},RESOLUTION=1280x{quality['height']}\n"
            master_playlist_content += f"{quality['name']}/playlist.m3u8\n"

        with open(playlist_path, "w") as f:
            f.write(master_playlist_content)

        movie.hls_playlist.name = f"hls/{movie.id}/playlist.m3u8"
        movie.hls_folder = f"hls/{movie.id}/"
        movie.save()

        logger.info(f"HLS generated for movie {movie_id}")

    except Exception as exc:
        logger.error(f"HLS generation failed for movie {movie_id}: {exc}")
        raise
