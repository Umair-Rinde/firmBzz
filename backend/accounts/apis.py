from django.contrib.auth import authenticate
from portal.base import BaseResponse
from rest_framework_simplejwt.tokens import RefreshToken
import serializers
import choices


class AuthService:

    @staticmethod
    def login(data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return BaseResponse(
                success=False,
                message="Username and password required",
                status=400
            )

        user = authenticate(username=username, password=password)

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

        refresh = RefreshToken.for_user(user)

        return BaseResponse(
            message="Login successful",
            data={
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
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