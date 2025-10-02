from django.contrib import admin
from .models import Lead, Activity

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']
    list_editable = ['is_active']  # Allow toggling is_active directly in list view
    
    def get_queryset(self, request):
        # Show ALL leads (including soft-deleted) in admin
        return Lead.objects.all()

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['id', 'lead', 'activity_type', 'title', 'activity_date', 'user']
    list_filter = ['activity_type', 'activity_date', 'lead__is_active']
    search_fields = ['title', 'notes', 'lead__first_name', 'lead__last_name']
