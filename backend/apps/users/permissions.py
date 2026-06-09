from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Permission class to check if user is an admin user.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user)
