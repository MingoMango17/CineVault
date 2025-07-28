from rest_framework import serializers
from .models import Movie
from django.contrib.auth.models import User


class MovieDetailSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(required=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "year_released",
            "duration",
            "director",
            "description",
            "poster_url",
            "video_file",
            "date_added",
        ]

        read_only_fields = ["date_added"]

    def validate_video_file(self, value):
        """
        Validate video file type and size
        """
        # Check file size (5GB limit)
        max_size = 5 * 1024 * 1024 * 1024  # 5GB in bytes
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 5GB.")

        # Check file type
        allowed_types = [
            "video/mp4",
            "video/avi",
            "video/mkv",
            "video/mov",
            "video/wmv",
        ]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only video files are allowed.")

        return value

    def create(self, validated_data):
        """
        Create a new movie instance with the uploaded video file
        """
        return Movie.objects.create(**validated_data)


class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ["id", "title", "year_released"]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class SigninSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
