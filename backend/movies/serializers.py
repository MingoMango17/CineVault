from rest_framework import serializers
from .models import Movie
from django.contrib.auth.models import User


class MovieDetailSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(required=True)
    processing_status = serializers.CharField(read_only=True)
    processing_progress = serializers.IntegerField(read_only=True)
    processing_error = serializers.CharField(read_only=True)
    thumbnail = serializers.ImageField(read_only=True)
    hls_playlist = serializers.FileField(read_only=True)

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
            "processing_status",
            "processing_progress", 
            "processing_error",
            "thumbnail",
            "hls_playlist",
            "video_width",
            "video_height",
            "video_codec",
        ]
        read_only_fields = ["date_added", "processing_status", "processing_progress"]

    def validate_video_file(self, value):
        max_size = 5 * 1024 * 1024 * 1024  # 5GB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 5GB.")

        allowed_types = ["video/mp4", "video/avi", "video/mkv", "video/mov", "video/wmv"]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only video files are allowed.")
        
        return value

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
