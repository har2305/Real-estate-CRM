from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet,  LeadActivityListCreateAPIView, ActivityDetailAPIView, RecentActivitiesAPIView, AnalyticsAPIView

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('', include(router.urls)),
    path('leads/<int:lead_id>/activities/', LeadActivityListCreateAPIView.as_view(), name='lead-activities'),
    path('leads/<int:lead_id>/activities/<int:pk>/', ActivityDetailAPIView.as_view(), name='activity-detail'),
    path('activities/recent/', RecentActivitiesAPIView.as_view(), name='recent-activities'),
    path('leads/<int:pk>/restore/', LeadViewSet.as_view({'post': 'restore'}), name='lead-restore'),
    path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),
]
