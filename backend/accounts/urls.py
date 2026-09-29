from django.urls import path

from .views import (
    ApprovalAuthorityCreateView,
    ApprovalAuthorityListView,
    ApprovalAuthorityRevokeView,
    UserCreateView,
    UserListView,
    UserMeView,
)

urlpatterns = [
    path("", UserCreateView.as_view(), name="user-create"),
    path(
        "me/",
        UserMeView.as_view(),
        name="user-me",
    ),
    path("list/", UserListView.as_view(), name="user-list"),
    path(
        "authority/",
        ApprovalAuthorityCreateView.as_view(),
        name="authority-create",
    ),
    path(
        "authority/<int:pk>/revoke/",
        ApprovalAuthorityRevokeView.as_view(),
        name="authority-revoke",
    ),
    path(
        "authority/list/",
        ApprovalAuthorityListView.as_view(),
        name="authority-list",
    ),
]