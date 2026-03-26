
from rest_framework.views import APIView
from portal.base import BaseResponse
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
)
from django.conf import settings
from .models import User
import jwt

class UserLoginAPI(APIView):
    def post(self, request, *args, **kwargs):
        try:
            user = User.objects.get(email=request.data["email"])
            user_data = UserSerializer(user).data

        except User.DoesNotExist:
            return BaseResponse(message="User not found", status=404, success=False)
        if not user.check_password(request.data["password"]):
            return BaseResponse(message="Invalid password", status=400, success=False)

        firm_id = request.data.get("firm_id") or request.data.get("firm") or None

        # Firm selection flow (user may belong to multiple firms)
        firms = (user_data or {}).get("firms") or []
        if firms and len(firms) > 1 and not firm_id:
            user_data["requires_firm_selection"] = True
            user_data["firm"] = None
            return BaseResponse(
                message="Select firm to continue",
                data=user_data,
                token=None,
                status=200,
                success=True,
            )

        selected_firm = None
        if firms:
            if not firm_id and len(firms) == 1:
                selected_firm = firms[0]
                firm_id = str(selected_firm["id"])
            else:
                selected_firm = next((f for f in firms if str(f["id"]) == str(firm_id)), None)
                if not selected_firm:
                    return BaseResponse(message="Invalid firm selection", status=400, success=False)

        user_data["firm"] = selected_firm
        user_data["requires_firm_selection"] = False

        payload = {
            "user_id": str(user.id),
            "firm_id": str(firm_id) if firm_id else None,
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

        return BaseResponse(
            message="Login Successful",
            data=user_data,
            token=token,
            status=200,
            success=True,
        )

class UserCreateAPI(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="User Created Successfully",
                data=serializer.data,
                status=201,
                success=True,
            )
        return BaseResponse(
            message="User Creation Failed",
            data=serializer.errors,
            status=400,
            success=False,
        )

    def get(self, request, id=None, *args, **kwargs):
        if not id:
            return BaseResponse(message="User ID is required", status=400, success=False)
        if id == 'list':
            users = User.objects.all()
            user_data = UserSerializer(users, many=True).data
            data = {"rows": user_data,"count": users.count()}
            return BaseResponse(
                message="Users Fetched Successfully",
                data=data,
                status=200,
                success=True,
            )
        if id == 'me':
            user = User.objects.get(id=request.user.id)
            user_data = UserSerializer(user).data
            return BaseResponse(
                message="User Fetched Successfully",
                data=user_data,
                status=200,
                success=True,
            )
        else:
            user = User.objects.get(id=id)
            user_data = UserSerializer(user).data
        return BaseResponse(
            message="User Fetched Successfully",
            data=user_data,
            status=200,
            success=True,
        )
    
    def delete(self,id, request, *args, **kwargs):
        if not id:
            return BaseResponse(message="User ID is required", status=400, success=False)
        user = User.objects.get(id=id)
        user.delete()
        return BaseResponse(
            message="User Deleted Successfully",
            status=200,
            success=True,
        )   
    
    def put(self, request, id=None, *args, **kwargs):
        if not id:
            return BaseResponse(message="User ID is required", status=400, success=False)
        user = User.objects.get(id=id)
        serializer = UserUpdateSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="User Updated Successfully",
                data=serializer.data,
                status=200,
                success=True,
            )
        return BaseResponse(
            message="User Update Failed",
            data=serializer.errors,
            status=400,
            success=False,
        )

        