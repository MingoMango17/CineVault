"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from movies.urls import router as movie_router
from movies.views import SignupView, SigninView, SignoutView

urlpatterns = [
    path("api/v1/", include(movie_router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("auth/signup", SignupView.as_view(), name="sign-up"),
    path("auth/signin", SigninView.as_view(), name="sign-in"),
    path("auth/signout", SignoutView.as_view(), name="sign-out"),
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)