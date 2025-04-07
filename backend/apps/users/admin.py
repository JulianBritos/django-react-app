from django.contrib import admin
from django.contrib.sites.models import Site



from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'password',
        'last_login',
        'is_superuser',
        'username',
        'is_staff',
        'is_active',
        'date_joined',
        'first_name',
        'last_name',
        'email',
        'phone',
        'birth_date',
        'address',
        'city',
        'country',
        'role',
    )
    list_filter = (
        'last_login',
        'is_superuser',
        'is_staff',
        'is_active',
        'date_joined',
        'birth_date',
    )
    raw_id_fields = ('groups', 'user_permissions')
