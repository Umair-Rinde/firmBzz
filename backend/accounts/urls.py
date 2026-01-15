from django.urls import path
from .routes import LoginAPIView

urlpatterns = [
    path("login/", LoginAPIView.as_view()),
]
