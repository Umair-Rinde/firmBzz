from rest_framework import serializers
from accounts.models import User
from accounts.choices import UserTypeChoices, UserRoleChoices
from firm.models import Firm

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "phone",
            "user_type",
            "role",
            "firm",
            "password",
        ]

    def validate(self, data):
        user_type = data.get("user_type")
        firm = data.get("firm")
        role = data.get("role")

        if user_type == UserTypeChoices.OWNER:
            if firm or role:
                raise serializers.ValidationError(
                    "Owner cannot have firm or role"
                )

        if user_type == UserTypeChoices.FIRM_USER:
            if not firm or not role:
                raise serializers.ValidationError(
                    "Firm user must have firm and role"
                )

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
