from notesheets.models import Notesheet

from rest_framework import generics, permissions

from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from rest_framework.response import Response

from accounts.permissions import IsAdmin

from .models import NotesheetComment, WorkflowReviewer

from .serializers import WorkflowReviewerSerializer

from .models import WorkflowAssignment, WorkflowReviewer

from .permissions import IsAssignedWorkflowUser

from .serializers import (
    DispositionSerializer,
    WorkflowAssignmentForwardSerializer,
    WorkflowAssignmentSerializer,
    WorkflowReviewerSerializer,
    NotesheetCommentSerializer,
)

from .services import (
    decide_approval,
    dispatch_notesheet,
    forward_review_assignment,
    create_notesheet_comment,
)

from rest_framework.exceptions import NotFound

class WorkflowReviewerCreateView(generics.CreateAPIView):
    queryset = WorkflowReviewer.objects.all()
    serializer_class = WorkflowReviewerSerializer
    permission_classes = [IsAdmin]


class WorkflowReviewerListView(generics.ListAPIView):
    queryset = WorkflowReviewer.objects.select_related(
        "user",
        "department",
    ).order_by("-added_at")
    serializer_class = WorkflowReviewerSerializer
    permission_classes = [IsAdmin]

class MyWorkflowAssignmentsView(generics.ListAPIView):
    serializer_class = WorkflowAssignmentSerializer
    permission_classes = [IsAssignedWorkflowUser]

    def get_queryset(self):
        return (
            WorkflowAssignment.objects
            .select_related(
                "notesheet",
                "assigned_to",
            )
            .filter(
                assigned_to=self.request.user,
                status=WorkflowAssignment.Status.ACTIVE,
            )
            .order_by("-assigned_at")
        )
    
class WorkflowAssignmentDetailView(generics.RetrieveAPIView):
    queryset = WorkflowAssignment.objects.select_related(
        "notesheet",
        "assigned_to",
    )
    serializer_class = WorkflowAssignmentSerializer
    permission_classes = [IsAssignedWorkflowUser]

class WorkflowAssignmentForwardView(generics.GenericAPIView):
    queryset = WorkflowAssignment.objects.select_related(
        "notesheet",
        "assigned_to",
    )
    serializer_class = WorkflowAssignmentForwardSerializer
    permission_classes = [IsAssignedWorkflowUser]

    def post(self, request, *args, **kwargs):
        assignment = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            next_assignment = forward_review_assignment(
                assignment=assignment,
                user=request.user,
            )
        except ValueError as exc:
            raise ValidationError(
                {"detail": str(exc)}
            )

        response_serializer = WorkflowAssignmentSerializer(
            next_assignment
        )

        return Response(
            response_serializer.data,
            status=200,
        )

class WorkflowAssignmentDecisionView(generics.GenericAPIView):
    queryset = WorkflowAssignment.objects.select_related(
        "notesheet",
        "assigned_to",
    )
    serializer_class = DispositionSerializer
    permission_classes = [IsAssignedWorkflowUser]

    def post(self, request, *args, **kwargs):
        assignment = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            disposition = decide_approval(
                assignment=assignment,
                user=request.user,
                decision=serializer.validated_data["decision"],
                justification=serializer.validated_data.get(
                    "justification",
                    "",
                ),
            )
        except ValueError as exc:
            raise ValidationError(
                {"detail": str(exc)}
            )

        response_serializer = self.get_serializer(
            disposition
        )

        return Response(
            response_serializer.data,
            status=200,
        )

class NotesheetCommentView(
    generics.GenericAPIView
):
    serializer_class = NotesheetCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_notesheet(self):
        notesheet_id = self.kwargs["notesheet_id"]

        try:
            return Notesheet.objects.get(
                id=notesheet_id
            )
        except Notesheet.DoesNotExist:
            raise NotFound(
                "Notesheet not found."
            )

    def has_access(self, notesheet):
        return (
            notesheet.creator_id == self.request.user.id
            or WorkflowAssignment.objects.filter(
                notesheet=notesheet,
                assigned_to=self.request.user,
            ).exists()
        )

    def get(self, request, notesheet_id):
        notesheet = self.get_notesheet()

        if not self.has_access(notesheet):
            raise PermissionDenied(
                "You do not have access to this notesheet."
            )

        comments = (
            NotesheetComment.objects
            .filter(notesheet=notesheet)
            .select_related(
                "author",
                "parent_comment",
            )
            .order_by("sequence_number")
        )

        serializer = self.get_serializer(
            comments,
            many=True,
            context={
                "notesheet": notesheet,
            },
        )

        return Response(serializer.data)

    def post(self, request, notesheet_id):
        notesheet = self.get_notesheet()

        serializer = self.get_serializer(
            data=request.data,
            context={
                "notesheet": notesheet,
            },
        )
        serializer.is_valid(raise_exception=True)

        try:
            comment = create_notesheet_comment(
                notesheet=notesheet,
                user=request.user,
                content=serializer.validated_data["content"],
                action_type=serializer.validated_data[
                    "action_type"
                ],
                parent_comment=serializer.validated_data.get(
                    "parent_comment"
                ),
            )
        except ValueError as exc:
            raise ValidationError(
                {"detail": str(exc)}
            )

        response_serializer = self.get_serializer(
            comment,
            context={
                "notesheet": notesheet,
            },
        )

        return Response(
            response_serializer.data,
            status=201,
        )