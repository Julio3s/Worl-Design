from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'phone', 'is_admin_user', 'is_staff']
    search_fields = ['email', 'username', 'phone']
    list_filter = ['is_admin_user', 'is_staff', 'date_joined']
