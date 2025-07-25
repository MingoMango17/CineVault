import datetime
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Movie

class MovieModelTest(TestCase):

    def setUp(self):
        self.video_file = SimpleUploadedFile(
            "test_video.mp4",
            b"file_content",
            content_type="video/mp4"
        )
        self.movie = Movie.objects.create(
            title="A Test Movie",
            description="This is a description for the test movie.",
            video_file=self.video_file
        )

    def test_movie_creation(self):
        self.assertEqual(self.movie.title, "A Test Movie")
        self.assertEqual(self.movie.description, "This is a description for the test movie.")
        self.assertIsInstance(self.movie, Movie)
        self.assertEqual(self.movie.date_added, datetime.date.today())
        self.assertTrue(self.movie.video_file.name.startswith('videos/test_video'))

    def test_title_cannot_be_blank(self):
        with self.assertRaises(ValidationError):
            movie = Movie(title="", description="Some description")
            movie.full_clean()

    def test_description_cannot_be_blank(self):
        with self.assertRaises(ValidationError):
            movie = Movie(title="A Title", description="")
            movie.full_clean()

    def test_video_file_validator_accepts_valid_extensions(self):
        valid_extensions = ['mp4', 'webm', 'mkv']
        for ext in valid_extensions:
            with self.subTest(ext=ext):
                video = SimpleUploadedFile(f"video.{ext}", b"content", content_type=f"video/{ext}")
                movie = Movie(
                    title=f"Movie with {ext}",
                    description="A test.",
                    video_file=video
                )
                try:
                    movie.full_clean()
                except ValidationError:
                    self.fail(f"ValidationError was raised for a valid extension: .{ext}")

    def test_video_file_validator_rejects_invalid_extension(self):
        invalid_video_file = SimpleUploadedFile(
            "test_document.txt",
            b"some text content",
            content_type="text/plain"
        )
        movie = Movie(
            title="Movie with Invalid File",
            description="This should fail.",
            video_file=invalid_video_file
        )

        with self.assertRaises(ValidationError) as context:
            movie.full_clean()

        self.assertIn('File extension \'txt\' is not allowed.', str(context.exception))