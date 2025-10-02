import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .factories import UserFactory


class UserModelTest(TestCase):
    """Test User model functionality"""
    
    def test_user_creation(self):
        """Test user creation with all fields"""
        user = UserFactory(
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.first_name, 'John')
        self.assertEqual(user.last_name, 'Doe')
        self.assertTrue(user.check_password('testpass123'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_user_str_representation(self):
        """Test user string representation"""
        user = UserFactory(email='test@example.com')
        # Django's User model uses username for __str__, not email
        self.assertEqual(str(user), 'test@example.com')  # username should match email


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        self.user = UserFactory(
            email='test@example.com',
            password='testpass123'
        )
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.me_url = reverse('me')
        self.refresh_url = reverse('refresh')

    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        # Verify user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')
        self.assertEqual(user.username, 'newuser@example.com')

    def test_user_registration_without_names(self):
        """Test user registration without first/last names"""
        data = {
            'email': 'minimal@example.com',
            'password': 'minimalpass123'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='minimal@example.com')
        self.assertEqual(user.first_name, '')
        self.assertEqual(user.last_name, '')

    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email fails"""
        data = {
            'email': 'test@example.com',  # Already exists
            'password': 'testpass123'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_invalid_email(self):
        """Test registration with invalid email format"""
        data = {
            'email': 'invalid-email',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_weak_password(self):
        """Test registration with weak password"""
        data = {
            'email': 'weak@example.com',
            'password': '123'  # Too short
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        # Verify user data in response
        user_data = response.data['user']
        self.assertEqual(user_data['email'], 'test@example.com')
        self.assertEqual(user_data['id'], self.user.id)

    def test_user_login_wrong_password(self):
        """Test login with wrong password"""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_login_nonexistent_email(self):
        """Test login with non-existent email"""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_authenticated(self):
        """Test /me endpoint with authenticated user"""
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        response = self.client.get(self.me_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['id'], self.user.id)

    def test_me_endpoint_unauthenticated(self):
        """Test /me endpoint without authentication"""
        response = self.client.get(self.me_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test token refresh functionality"""
        refresh = RefreshToken.for_user(self.user)
        refresh_token = str(refresh)
        
        data = {'refresh': refresh_token}
        response = self.client.post(self.refresh_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_profile_update(self):
        """Test profile update via PATCH /me/"""
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        
        response = self.client.patch(self.me_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify user was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.email, 'updated@example.com')
        self.assertEqual(self.user.username, 'updated@example.com')  # Username should sync with email


class UserSerializerTest(TestCase):
    """Test User serializer functionality"""
    
    def test_user_serializer_full_name(self):
        """Test UserSerializer full_name field"""
        from .serializers import UserSerializer
        
        # Test with both names
        user = UserFactory(first_name='John', last_name='Doe')
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['full_name'], 'John Doe')
        
        # Test with only first name
        user = UserFactory(first_name='John', last_name='')
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['full_name'], 'John')
        
        # Test with only last name
        user = UserFactory(first_name='', last_name='Doe')
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['full_name'], 'Doe')
        
        # Test with no names (fallback to email)
        user = UserFactory(first_name='', last_name='', email='test@example.com')
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['full_name'], 'test@example.com')
