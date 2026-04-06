from django.urls import path
from .apis import UserLoginAPI, UserCreateAPI, SwitchFirmAPI

urlpatterns = [
    path("login/", UserLoginAPI.as_view(), name="user_login"),
    path("switch-firm/", SwitchFirmAPI.as_view(), name="switch_firm"),
    path("create/", UserCreateAPI.as_view(), name="user_signup"),
    path("<str:id>/get/", UserCreateAPI.as_view(), name="user_get"),
    path("<str:id>/update/", UserCreateAPI.as_view(), name="user_update"),
    path("<str:id>/delete/", UserCreateAPI.as_view(), name="user_delete"),
]
