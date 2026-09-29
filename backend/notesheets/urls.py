from django.urls import path

from .views import (
    NotesheetCreateView,
    NotesheetDetailView,
    NotesheetDispatchView,
    NotesheetListView,
    NotesheetUpdateView,
)


urlpatterns = [
    path("", NotesheetCreateView.as_view(), name="notesheet-create"),
    path("list/", NotesheetListView.as_view(), name="notesheet-list"),
    path(
        "<int:pk>/",
        NotesheetDetailView.as_view(),
        name="notesheet-detail",
    ),
    path(
        "<int:pk>/edit/",
        NotesheetUpdateView.as_view(),
        name="notesheet-update",
    ),
    path(
        "<int:pk>/dispatch/",
        NotesheetDispatchView.as_view(),
        name="notesheet-dispatch",
    ),
]