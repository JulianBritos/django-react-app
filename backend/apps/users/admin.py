from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUserModel



class UserAdminCustom(UserAdmin):
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
   
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email","first_name", "last_name", "password1", "password2"),
            },
        ),
    )
    list_display = ("email", "username","first_name", "last_name", "is_staff","is_active", "is_superuser")
    search_fields = ( "first_name", "last_name", "email")
    ordering = ("email",)
    readonly_fields = ("last_login", "date_joined")

admin.site.register(CustomUserModel, UserAdminCustom)