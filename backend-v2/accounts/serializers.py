from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    firm = serializers.SerializerMethodField()
    firms = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = ["password"]

    def get_firm(self, obj):
        from .models import FirmUsers
        firm_user = FirmUsers.objects.filter(user=obj).select_related("firm").first()
        if firm_user:
            return {
                "id": firm_user.firm.id,
                "name": firm_user.firm.name,
                "slug": firm_user.firm.slug,
                "role": firm_user.role
            }
        return None

    def get_firms(self, obj):
        from .models import FirmUsers
        memberships = (
            FirmUsers.objects.filter(user=obj)
            .select_related("firm")
            .order_by("firm__name")
        )
        return [
            {
                "id": m.firm.id,
                "name": m.firm.name,
                "slug": m.firm.slug,
                "role": m.role,
            }
            for m in memberships
        ]

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "full_name",
            "phone",
            "gender",
            "user_type",
            "date_of_birth",
            "address",
            "city",
            "state",
            "country",
            "pincode",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "phone",
            "gender",
            "user_type",
            "date_of_birth",
            "address",
            "city",
            "state",
            "country",
            "pincode",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
