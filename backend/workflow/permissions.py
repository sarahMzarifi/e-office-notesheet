from rest_framework.permissions import BasePermission


class IsAssignedWorkflowUser(BasePermission):
    message = "You are not the assigned user for this workflow assignment."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        return obj.assigned_to_id == request.user.id