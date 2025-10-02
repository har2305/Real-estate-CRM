from rest_framework import serializers
from .models import Lead
from .models import Activity

class LeadSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'user_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'status', 'source',
            'budget_min', 'budget_max', 'property_interest',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'is_active', 'created_at', 'updated_at', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def create(self, validated_data):
        # Automatically assign the lead to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ActivitySerializer(serializers.ModelSerializer):
    # read-only fields to show who/which lead
    lead_id = serializers.IntegerField(source='lead.id', read_only=True)
    lead = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'lead_id', 'lead', 'user_id', 'user',
            'activity_type', 'title', 'notes', 'duration', 'activity_date',
            'created_at'
        ]
        read_only_fields = ['id', 'lead_id', 'lead', 'user_id', 'user', 'created_at']

    def get_lead(self, obj):
        return {
            'id': obj.lead.id,
            'first_name': obj.lead.first_name,
            'last_name': obj.lead.last_name,
            'full_name': f"{obj.lead.first_name} {obj.lead.last_name}".strip()
        }

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username
        }

    def create(self, validated_data):
        # Automatically assign the activity to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        # Simple guard: duration must be positive if provided
        duration = attrs.get('duration')
        if duration is not None and duration <= 0:
            raise serializers.ValidationError({'duration': 'Duration must be a positive number of minutes.'})
        return attrs