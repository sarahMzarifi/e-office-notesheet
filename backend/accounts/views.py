from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .authority_serializers import (
    ApprovalAuthorityCreateSerializer,
    ApprovalAuthorityRevokeSerializer,
    ApprovalAuthoritySerializer,
)
from .models import ApprovalAuthority, User
from .permissions import IsAdmin
from .serializers import UserCreateSerializer, UserSerializer

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdmin]

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class ApprovalAuthorityListView(generics.ListAPIView):
    queryset = ApprovalAuthority.objects.select_related(
        "user",
        "department",
    ).order_by("-assigned_at")
    serializer_class = ApprovalAuthoritySerializer
    permission_classes = [IsAdmin]

class ApprovalAuthorityCreateView(generics.CreateAPIView):
    queryset = ApprovalAuthority.objects.all()
    serializer_class = ApprovalAuthorityCreateSerializer
    permission_classes = [IsAdmin]

class ApprovalAuthorityRevokeView(generics.UpdateAPIView):
    queryset = ApprovalAuthority.objects.all()
    serializer_class = ApprovalAuthorityRevokeSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["patch"]

class UserMeView(generics.RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user