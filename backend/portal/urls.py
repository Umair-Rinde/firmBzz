from django.urls import path
from . import routes

urlpatterns = [
    path('documents/', routes.DocumentUploadAPIView.as_view()),
]
