from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('email', 'password')

    def create(self, validated_data):
        email = validated_data['email']
        user = User.objects.create(
            username=email,
            email=email,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Accepts either email or username; returns tokens + user payload
    def to_internal_value(self, data):
        # Map email -> username before field-level validation runs
        payload = dict(data)
        email = payload.get('email')
        username = payload.get('username')
        if email and not username:
            try:
                user = User.objects.get(email=email)
                payload['username'] = user.username
            except User.DoesNotExist:
                # Let parent raise the standard invalid credentials error
                payload['username'] = ""
        return super().to_internal_value(payload)

    def validate(self, attrs):
        email = self.initial_data.get('email')
        username = attrs.get('username')
        if email and not username:
            try:
                user = User.objects.get(email=email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass  # fall through; super() will raise
        data = super().validate(attrs)

        # Attach serialized user
        data['user'] = UserSerializer(self.user).data
        return data
