from django.db import transaction
from rest_framework import serializers

from firm.models import Firm

from .choices import UserTypeChoices
from .models import FirmUsers, User

FIRM_MEMBERSHIP_ROLES = [
    c[0]
    for c in UserTypeChoices.choices
    if c[0] not in (UserTypeChoices.ADMIN,)
]


def _validate_firm_assignments(assignments):
    if not isinstance(assignments, list):
        raise serializers.ValidationError("Expected a list of {firm_id, role} objects.")
    if not assignments:
        raise serializers.ValidationError("Select at least one firm.")
    seen = set()
    for item in assignments:
        if not isinstance(item, dict):
            raise serializers.ValidationError("Each assignment must be an object.")
        firm_id = item.get("firm_id")
        role = item.get("role")
        if not firm_id or not role:
            raise serializers.ValidationError("Each assignment needs firm_id and role.")
        if role not in FIRM_MEMBERSHIP_ROLES:
            raise serializers.ValidationError(f"Invalid role: {role}")
        key = str(firm_id)
        if key in seen:
            raise serializers.ValidationError("Duplicate firm in assignments.")
        seen.add(key)
        if not Firm.objects.filter(id=firm_id).exists():
            raise serializers.ValidationError(f"Unknown firm id: {firm_id}")


def _sync_firm_memberships(user, assignments):
    _validate_firm_assignments(assignments)
    new_map = {str(a["firm_id"]): a["role"] for a in assignments}

    with transaction.atomic():
        for m in list(FirmUsers.objects.filter(user=user)):
            fid = str(m.firm_id)
            if fid not in new_map:
                m.delete()
            else:
                role = new_map[fid]
                if m.role != role:
                    m.role = role
                    m.save()

        existing_ids = set(
            str(x)
            for x in FirmUsers.objects.filter(user=user).values_list(
                "firm_id", flat=True
            )
        )
        for fid, role in new_map.items():
            if fid not in existing_ids:
                FirmUsers.objects.create(user=user, firm_id=fid, role=role)


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
    firm_assignments = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        write_only=True,
        required=False,
        default=list,
    )

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
            "firm_assignments",
        ]

    def validate(self, data):
        ut = data.get("user_type", UserTypeChoices.FIRM_USER)
        assignments = data.get("firm_assignments") or []
        if ut == UserTypeChoices.ADMIN and assignments:
            raise serializers.ValidationError(
                {"firm_assignments": "Firm assignments are not used for admin users."}
            )
        if ut == UserTypeChoices.FIRM_USER:
            if not assignments:
                raise serializers.ValidationError(
                    {"firm_assignments": "Select at least one firm for firm users."}
                )
            _validate_firm_assignments(assignments)
        return data

    def create(self, validated_data):
        firm_assignments = validated_data.pop("firm_assignments", []) or []
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if user.user_type == UserTypeChoices.FIRM_USER:
            _sync_firm_memberships(user, firm_assignments)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    firm_assignments = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        write_only=True,
        required=False,
    )

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
            "firm_assignments",
        ]

    def validate(self, data):
        if not self.instance:
            return data
        new_ut = data.get("user_type", self.instance.user_type)
        assignments = data.get("firm_assignments", None)
        if new_ut == UserTypeChoices.ADMIN and self.initial_data.get("firm_assignments"):
            raise serializers.ValidationError(
                {"firm_assignments": "Firm assignments are not used for admin users."}
            )
        if (
            new_ut == UserTypeChoices.FIRM_USER
            and self.instance.user_type != UserTypeChoices.FIRM_USER
            and data.get("user_type") == UserTypeChoices.FIRM_USER
            and "firm_assignments" not in self.initial_data
        ):
            raise serializers.ValidationError(
                {
                    "firm_assignments": "Provide at least one firm when changing this user to Firm User."
                }
            )
        if assignments is not None and new_ut == UserTypeChoices.FIRM_USER:
            _validate_firm_assignments(assignments)
        return data

    def update(self, instance, validated_data):
        firm_assignments = validated_data.pop("firm_assignments", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if instance.user_type == UserTypeChoices.ADMIN:
            FirmUsers.objects.filter(user=instance).delete()
        elif firm_assignments is not None:
            _sync_firm_memberships(instance, firm_assignments)

        return instance
