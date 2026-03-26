import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework import status

User = get_user_model()

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response 

    def __call__(self, request):
        if request.path in settings.EXCLUDED_PATHS:
                return self.get_response(request)

        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return self.get_response(request)

        try:
            parts = auth_header.split(" ")
            if len(parts) == 1:
                # Backwards compatibility: clients sending raw token
                token = parts[0]
            else:
                prefix, token = parts[0], parts[1]
                if prefix.lower() != 'bearer':
                    raise ValueError("Invalid token prefix")
            
            payload = jwt.decode(
                token, 
                settings.DJANGO_JWT_SECRECT_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            user = User.objects.get(id=payload['user_id'])
            request.user = user
            request.firm_id = payload.get("firm_id")
            
        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            # If token is invalid, we don't necessarily want to block 
            # (unless specific paths require checking request.user.is_authenticated later)
             pass

        return self.get_response(request)