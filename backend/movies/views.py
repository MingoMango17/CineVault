from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth.models import User

from django.contrib.auth import authenticate
from .models import Movie
from .serializers import *


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return MovieListSerializer
        return MovieDetailSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


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
