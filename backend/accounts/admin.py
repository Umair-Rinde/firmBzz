from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import UserChangeForm, UserCreationForm
from accounts.models import User, FirmUsers


class MyUserAdmin(BaseUserAdmin):

    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('username', 'phone', 'full_name', 'email', 'is_guest')
    list_filter = ('is_admin',)
    add_fieldsets = (
        (None, {'fields': ('username', 'phone', 'email', 'password1', 'password2', 'is_active', 'is_guest')}),
        ('Personal info', {'fields': ('full_name', 'gender', )}),
        ('Permissions', {'fields': ('is_admin', 'user_type')}),
    )
    fieldsets = (
        (None, {'fields': ('username', 'phone', 'email', 'is_active', 'is_guest')}),
        ('Personal info', {'fields': ('full_name', 'gender', )}),
        ('Permissions', {'fields': ('is_admin', 'user_type')}),
    )

    search_fields = ('email', 'phone')
    ordering = ('phone', 'email', )
    filter_horizontal = ()


admin.site.register(User, MyUserAdmin)
admin.site.unregister(Group)


@admin.register(FirmUsers)
class FirmUsersAdmin(admin.ModelAdmin):
    list_display = ['user', 'firm', 'role', 'created_on']
    list_filter = ['firm', 'role', 'created_on']
    search_fields = ['user__email', 'user__full_name', 'firm__name', 'aadhaar_number', 'pan_number']
    readonly_fields = ['created_on', 'updated_on']
    ordering = ['-created_on']
    fieldsets = (
        ('User & Firm', {
            'fields': ('user', 'firm', 'role')
        }),
        ('Staff Details', {
            'fields': ('aadhaar_number', 'pan_number', 'driving_license', 'license_expiry', 'home_address', 'profile_photo')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'firm')