
from django.conf import settings
from django.contrib.auth import authenticate
from portal.base import BaseResponse
import jwt
import datetime
from . import serializers
from . import choices

class AuthService:

    @staticmethod
    def login(data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return BaseResponse(
                success=False,
                message="Email and password required",
                status=400
            )

        user = authenticate(email=email, password=password)
        print("user", user)

        if not user:
            return BaseResponse(
                success=False,
                message="Invalid credentials",
                status=401
            )

        if not user.is_active:
            return BaseResponse(
                success=False,
                message="User is inactive. Contact admin.",
                status=403
            )

        # Generate Access Token
        access_token_payload = {
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
            "iat": datetime.datetime.utcnow(),
        }
        access_token = jwt.encode(
            access_token_payload, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )

        return BaseResponse(
            message="Login successful",
            data={
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "user_type": user.user_type,
                    "role": user.role,
                    "firm_id": user.firm_id,
                }
            },
            status=200
        )



class UserService:

    @staticmethod
    def create_user(request_user, data):
        # OWNER LOGIC
        if request_user.user_type == choices.UserTypeChoices.OWNER:
            serializer = serializers.UserCreateSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return BaseResponse(
                    message="User created successfully",
                    data={"id": user.id},
                    status=201
                )
            return BaseResponse(
                success=False,
                errors=serializer.errors,
                status=400
            )

        # FIRM MANAGER LOGIC
        if (
            request_user.user_type == choices.UserTypeChoices.FIRM_USER
            and request_user.role == choices.UserRoleChoices.FIRM_MANAGER
        ):
            data["firm"] = request_user.firm.id
            data["user_type"] = choices.UserTypeChoices.FIRM_USER

            serializer = serializers.UserCreateSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return BaseResponse(
                    message="User created successfully",
                    data={"id": user.id},
                    status=201
                )
            return BaseResponse(
                success=False,
                errors=serializer.errors,
                status=400
            )

        return BaseResponse(
            success=False,
            message="Permission denied",
            status=403
        )