import os
import django
from django.conf import settings
import pytest

# Configure Django settings before importing Django models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def api_client():
    """Provide an API client for testing"""
    return APIClient()


@pytest.fixture
def user():
    """Provide a test user"""
    from accounts.factories import UserFactory
    return UserFactory()


@pytest.fixture
def authenticated_client(api_client, user):
    """Provide an authenticated API client"""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def lead(user):
    """Provide a test lead"""
    from crm.factories import LeadFactory
    return LeadFactory(user=user)


@pytest.fixture
def activity(lead, user):
    """Provide a test activity"""
    from crm.factories import ActivityFactory
    return ActivityFactory(lead=lead, user=user)


@pytest.fixture
def multiple_users():
    """Provide multiple test users"""
    from accounts.factories import UserFactory
    return [UserFactory() for _ in range(3)]


@pytest.fixture
def leads_for_users(multiple_users):
    """Provide leads for multiple users"""
    from crm.factories import LeadFactory
    leads = []
    for user in multiple_users:
        leads.extend([LeadFactory(user=user) for _ in range(2)])
    return leads


@pytest.fixture
def activities_for_leads(leads_for_users):
    """Provide activities for leads"""
    from crm.factories import ActivityFactory
    activities = []
    for lead in leads_for_users:
        activities.append(ActivityFactory(lead=lead, user=lead.user))
    return activities


# Test settings
@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Enable database access for all tests"""
    pass


@pytest.fixture
def test_settings():
    """Provide test-specific settings"""
    return {
        'SECRET_KEY': 'test-secret-key',
        'DEBUG': True,
        'DATABASES': {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        'PASSWORD_HASHERS': [
            'django.contrib.auth.hashers.MD5PasswordHasher',
        ],
        'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    }
