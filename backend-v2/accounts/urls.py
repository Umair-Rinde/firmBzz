from django.urls import path
from .apis import UserLoginAPI, UserCreateAPI

urlpatterns = [
    path("login/", UserLoginAPI.as_view(), name="user_login"),
    path("create/", UserCreateAPI.as_view(), name="user_signup"),
    path("get/<str:id>/", UserCreateAPI.as_view(), name="user_get"),
]
