from django.db.models import Q

from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Notesheet
from .serializers import (
    NotesheetCreateSerializer,
    NotesheetDispatchSerializer,
    NotesheetSerializer,
    NotesheetUpdateSerializer,
)

from workflow.services import dispatch_notesheet


class NotesheetCreateView(generics.CreateAPIView):
    queryset = Notesheet.objects.all()
    serializer_class = NotesheetCreateSerializer
    permission_classes = [IsAuthenticated]


class NotesheetListView(generics.ListAPIView):
    serializer_class = NotesheetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            queryset = Notesheet.objects.all()
        else:
            queryset = Notesheet.objects.filter(
                Q(creator=user)
                | Q(workflow_assignments__assigned_to=user)
            ).distinct()

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                title__icontains=search.strip()
            )

        return queryset.order_by("-created_at")


class NotesheetDetailView(generics.RetrieveAPIView):
    serializer_class = NotesheetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Notesheet.objects.all()

        return Notesheet.objects.filter(
            Q(creator=user)
            | Q(workflow_assignments__assigned_to=user)
        ).distinct()


class NotesheetUpdateView(generics.UpdateAPIView):
    serializer_class = NotesheetUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Notesheet.objects.filter(
            creator=self.request.user,
            status=Notesheet.Status.DRAFT,
        )


class NotesheetDispatchView(generics.UpdateAPIView):
    queryset = Notesheet.objects.all()
    serializer_class = NotesheetDispatchSerializer

    def get_queryset(self):
        return Notesheet.objects.filter(
            creator=self.request.user,
            status=Notesheet.Status.DRAFT,
        )

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        notesheet = self.get_object()

        try:
            dispatch_notesheet(notesheet)
        except ValueError as exc:
            raise ValidationError(
                {"detail": str(exc)}
            )

        notesheet.refresh_from_db()

        serializer = self.get_serializer(notesheet)

        return Response(serializer.data)