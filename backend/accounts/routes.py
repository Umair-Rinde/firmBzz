from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema


class LoginAPIView(APIView):
    authentication_classes = []  
    permission_classes = []
    schema = AutoSchema()

    def post(self, request):
        return apis.AuthService.login(request.data)


class UserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def post(self, request):
        return apis.UserService.create_user(
            request_user=request.user,
            data=request.data
        )