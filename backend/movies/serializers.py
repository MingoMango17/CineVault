from rest_framework import serializers
from .models import Movie

class MovieDetailSerializer(serializers.Serializer):
    class Meta:
        model = Movie
        fields = ["id", "title", "description", "date_added", "video_file"]
        read_only_fields = ["date_added"]

class MovieListSerializer(serializers.ListSerializer):
    class Meta:
        model = Movie
        fields = ["id", "title", "date_added"]
        read_only_fields = ['date_added']
