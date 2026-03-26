
from django.conf import settings
from django.contrib.auth import authenticate
from portal.base import BaseResponse
import jwt
import datetime
from . import serializers
from . import choices
from .models import FirmUsers

class AuthService:

    @staticmethod
    def login(data):
        email = data.get("email")
        password = data.get("password")
        firm_id = data.get("firm_id") or data.get("firm") or None

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

        memberships = (
            FirmUsers.objects.filter(user=user)
            .select_related("firm")
            .order_by("firm__name")
        )

        firms = [
            {
                "id": str(m.firm.id),
                "name": m.firm.name,
                "slug": m.firm.slug,
                "role": m.role,
            }
            for m in memberships
        ]

        # If user belongs to multiple firms, require firm selection before issuing token
        if user.user_type == choices.UserTypeChoices.FIRM_USER:
            if not firms:
                return BaseResponse(
                    success=False,
                    message="No firm assigned to this user. Contact admin.",
                    status=403,
                )

            if not firm_id and len(firms) > 1:
                return BaseResponse(
                    message="Select firm to continue",
                    data={
                        "id": str(user.id),
                        "username": user.username,
                        "email": user.email,
                        "user_type": user.user_type,
                        "firms": firms,
                        "requires_firm_selection": True,
                    },
                    status=200,
                    success=True,
                )

        selected_firm = None
        selected_role = None
        if user.user_type == choices.UserTypeChoices.FIRM_USER:
            # Auto-select if only 1 firm, otherwise validate firm_id
            if not firm_id and len(firms) == 1:
                selected_firm = firms[0]
                selected_role = firms[0]["role"]
                firm_id = selected_firm["id"]
            else:
                selected_firm = next((f for f in firms if f["id"] == str(firm_id)), None)
                if not selected_firm:
                    return BaseResponse(
                        success=False,
                        message="Invalid firm selection",
                        status=400,
                    )
                selected_role = selected_firm["role"]

        # Generate Access Token (includes firm context when applicable)
        access_token_payload = {
            "user_id": str(user.id),
            "firm_id": str(firm_id) if firm_id else None,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(days=1),
            "iat": datetime.datetime.now(tz=datetime.timezone.utc),
        }
        access_token = jwt.encode(
            access_token_payload,
            settings.DJANGO_JWT_SECRECT_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

        return BaseResponse(
            message="Login successful",
            data={
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "user_type": user.user_type,
                "firms": firms,
                "firm": selected_firm,
                "firm_id": selected_firm["id"] if selected_firm else None,
                "firm_slug": selected_firm["slug"] if selected_firm else None,
                "role": selected_role,
                "requires_firm_selection": False,
            },
            token=access_token,
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