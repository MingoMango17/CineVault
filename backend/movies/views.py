from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django.contrib.auth.models import User

from django.contrib.auth import authenticate
from .models import Movie
from .serializers import *

from .tasks import process_video


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = MovieDetailSerializer
    
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Create movie and trigger background processing"""
        try:
            # Extract and validate data
            movie_data = {
                'title': request.data.get('title'),
                'year_released': int(request.data.get('releaseYear')) if request.data.get('releaseYear') else None,
                'duration': int(request.data.get('duration')) if request.data.get('duration') else None,
                'director': request.data.get('director', ''),
                'description': request.data.get('description', ''),
                'poster_url': request.data.get('posterUrl', ''),
                'video_file': request.data.get('videoFile')
            }
            
            if not movie_data['title']:
                return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not movie_data['video_file']:
                return Response({'error': 'Video file is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(data=movie_data)
            if serializer.is_valid():
                movie = serializer.save()

                process_video.delay(movie.id)
                
                return Response({
                    'message': 'Movie created successfully. Processing started.',
                    'movie': MovieDetailSerializer(movie).data,
                    'processing_status': 'started'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def processing_status(self, request, pk=None):
        """Get processing status for a movie"""
        movie = self.get_object()
        return Response({
            'id': movie.id,
            'processing_status': movie.processing_status,
            'processing_progress': movie.processing_progress,
            'processing_error': movie.processing_error,
            'thumbnail_ready': bool(movie.thumbnail),
            'hls_ready': bool(movie.hls_playlist),
        })
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        """Reprocess a failed video"""
        movie = self.get_object()
        if movie.processing_status in [Movie.FAILED, Movie.COMPLETED]:
            movie.processing_status = Movie.PENDING
            movie.processing_progress = 0
            movie.processing_error = None
            movie.save()
            
            process_video.delay(movie.id)
            
            return Response({
                'message': 'Reprocessing started',
                'processing_status': movie.processing_status
            })
        else:
            return Response({
                'error': 'Movie is currently being processed'
            }, status=status.HTTP_400_BAD_REQUEST)


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()

        data["password_confirm"] = data.get("confirmPassword", None)
        data["first_name"] = data.get("firstName", None)
        data["last_name"] = data.get("lastName", None)

        serializer = SignupSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "User created successfully",
                    "user": SignupSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SigninView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()

        data["username_or_email"] = data.get("email", None)
        serializer = SigninSerializer(data=data)
        if serializer.is_valid():
            username_or_email = serializer.validated_data["username_or_email"]
            password = serializer.validated_data["password"]

            user = None
            if "@" in username_or_email:
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            else:
                user = authenticate(username=username_or_email, password=password)

            if user is not None:
                if user.is_active:
                    refresh = RefreshToken.for_user(user)
                    return Response(
                        {
                            "message": "Sign in successful",
                            "user": {
                                "id": user.id,
                                "username": user.username,
                                "email": user.email,
                                "first_name": user.first_name,
                                "last_name": user.last_name,
                            },
                            "tokens": {
                                "refresh": str(refresh),
                                "access": str(refresh.access_token),
                            },
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"error": "Account is disabled"},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            else:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {"message": "Successfully signed out"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
