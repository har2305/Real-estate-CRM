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

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['first_name', 'last_name', 'email']
    filterset_fields = ['status', 'is_active']  # ?status=new/contacted/...

    def get_queryset(self):
        # Only show leads belonging to the authenticated user
        queryset = Lead.objects.filter(user=self.request.user)
        
        # Check if specifically requesting deleted leads
        is_active_param = self.request.query_params.get('is_active')
        if is_active_param is not None:
            is_active = is_active_param.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_active=is_active)
        else:
            # Default: only show active leads
            queryset = queryset.filter(is_active=True)
            
        return queryset

    # Soft delete: mark is_active=False
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ensure user can only delete their own leads
        if instance.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # Restore soft-deleted lead
    def restore(self, request, *args, **kwargs):
        try:
            # Get the lead (including soft-deleted ones)
            lead = Lead.objects.get(id=kwargs.get('pk'), user=request.user)
            if lead.is_active:
                return Response({'detail': 'Lead is already active'}, status=status.HTTP_400_BAD_REQUEST)
            
            lead.is_active = True
            lead.save(update_fields=['is_active'])
            serializer = self.get_serializer(lead)
            return Response(serializer.data)
        except Lead.DoesNotExist:
            return Response({'detail': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

class LeadActivityListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        lead_id = self.kwargs.get('lead_id')
        # Ensure the lead belongs to the authenticated user
        lead = get_object_or_404(Lead, id=lead_id, user=self.request.user, is_active=True)
        return Activity.objects.filter(lead=lead).select_related('user', 'lead')

    def perform_create(self, serializer):
        lead_id = self.kwargs.get('lead_id')
        # Ensure the lead belongs to the authenticated user
        lead = get_object_or_404(Lead, id=lead_id, user=self.request.user, is_active=True)
        # force user & lead so clients can't spoof them
        serializer.save(lead=lead, user=self.request.user)

class ActivityDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        # Ensure activities belong to leads owned by the authenticated user
        lead_id = self.kwargs.get('lead_id')
        return Activity.objects.filter(
            lead_id=lead_id, 
            lead__user=self.request.user,
            lead__is_active=True
        ).select_related('user', 'lead')

class RecentActivitiesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only show activities for leads owned by the authenticated user
        qs = Activity.objects.filter(
            lead__user=request.user,
            lead__is_active=True
        ).select_related('lead', 'user').order_by('-activity_date', '-created_at')[:10]
        data = ActivitySerializer(qs, many=True).data
        return Response(data)

class AnalyticsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get all active leads for analytics (no pagination)
        leads = Lead.objects.filter(user=request.user, is_active=True)
        
        # Calculate stats
        total = leads.count()
        by_status = {}
        for lead in leads:
            status = lead.status
            by_status[status] = by_status.get(status, 0) + 1
        
        # Get recent activities
        recent_activities = Activity.objects.filter(
            lead__user=request.user,
            lead__is_active=True
        ).select_related('lead', 'user').order_by('-activity_date', '-created_at')[:10]
        
        return Response({
            'leads': {
                'total': total,
                'by_status': by_status
            },
            'recent_activities': ActivitySerializer(recent_activities, many=True).data
        })
