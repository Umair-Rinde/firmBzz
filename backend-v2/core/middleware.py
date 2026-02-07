import jwt
from django.conf import settings
from accounts.models import User
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.headers.get("Authorization")
        print(token)
        if request.path.startswith("/api") and request.path not in settings.EXCLUDED_PATHS:
            if not token:
                return JsonResponse(
                    data={"msg": "Token not provided"}, status=403
                )
            try:
                jwt_data = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
                request.user = User.objects.get(id=jwt_data.get("user_id"))

                response = self.get_response(request)
                return response
            except:
                return JsonResponse(
                    data={"msg": "Invalid token"}, status=401
                )
        response = self.get_response(request)
        return response



class DisableCSRFCheck(MiddlewareMixin):
    def process_request(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)