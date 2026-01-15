from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
import apis

class LoginAPIView(APIView):
    authentication_classes = []  
    permission_classes = []

    def post(self, request):
        return apis.AuthService.login(request.data)

class UserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return apis.UserService.create_user(
            request_user=request.user,
            data=request.data
        )