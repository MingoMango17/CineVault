from rest_framework import viewsets, permissions
from .models import Movie
from .serializers import MovieListSerializer, MovieDetailSerializer

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieDetailSerializer

    def get_permissions(self):
        if self.action == 'list' or 'retrieve':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
