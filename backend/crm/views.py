from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, filters, status, generics
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lead, Activity
from .serializers import LeadSerializer, ActivitySerializer
# Create your views here.

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    queryset = Lead.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['first_name', 'last_name', 'email']
    filterset_fields = ['status', 'is_active']  # ?status=new/contacted/...

    # Soft delete: mark is_active=False
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

class LeadActivityListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        lead_id = self.kwargs.get('lead_id')
        # 404 if the lead doesn't exist (even if soft-deleted you may choose to allow/deny; we’ll allow only active)
        lead = get_object_or_404(Lead, id=lead_id, is_active=True)
        return Activity.objects.filter(lead=lead).select_related('user', 'lead')

    def perform_create(self, serializer):
        lead_id = self.kwargs.get('lead_id')
        lead = get_object_or_404(Lead, id=lead_id, is_active=True)
        # force user & lead so clients can’t spoof them
        serializer.save(lead=lead, user=self.request.user)

class ActivityDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        # Limit to activities under this lead for safety
        lead_id = self.kwargs.get('lead_id')
        return Activity.objects.filter(lead_id=lead_id).select_related('user', 'lead')

class RecentActivitiesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Activity.objects.select_related('lead', 'user').order_by('-activity_date', '-created_at')[:10]
        data = ActivitySerializer(qs, many=True).data
        return Response(data)
