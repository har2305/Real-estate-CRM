from rest_framework import serializers
from .models import Lead
from .models import Activity

class LeadSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'status', 'source',
            'budget_min', 'budget_max', 'property_interest',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_active', 'created_at', 'updated_at', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class ActivitySerializer(serializers.ModelSerializer):
    # read-only fields to show who/which lead
    lead_id = serializers.IntegerField(source='lead.id', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'lead_id', 'user_id', 'user_username',
            'activity_type', 'title', 'notes', 'duration', 'activity_date',
            'created_at'
        ]
        read_only_fields = ['id', 'lead_id', 'user_id', 'user_username', 'created_at']

    def validate(self, attrs):
        # Simple guard: duration must be positive if provided
        duration = attrs.get('duration')
        if duration is not None and duration <= 0:
            raise serializers.ValidationError({'duration': 'Duration must be a positive number of minutes.'})
        return attrs