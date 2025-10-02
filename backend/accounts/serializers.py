from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        user = User.objects.create(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name')
    
    def get_full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        elif obj.first_name:
            return obj.first_name
        elif obj.last_name:
            return obj.last_name
        else:
            return obj.email


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Accepts either email or username; returns tokens + user payload
    email = serializers.EmailField(required=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username not required since we can use email
        self.fields['username'].required = False
    
    def validate(self, attrs):
        # Handle email-based login
        email = self.initial_data.get('email')
        username = attrs.get('username')
        
        # If email is provided but no username, convert email to username
        if email and not username:
            try:
                user = User.objects.get(email=email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                # Set a dummy username to let parent handle authentication failure
                attrs['username'] = 'nonexistent@example.com'
        
        # Ensure we have a username for the parent validation
        if not attrs.get('username'):
            raise serializers.ValidationError("Either username or email is required.")
        
        # Call parent validation
        data = super().validate(attrs)

        # Attach serialized user
        data['user'] = UserSerializer(self.user).data
        return data
