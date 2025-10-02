import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from .models import Lead, Activity
from .serializers import LeadSerializer, ActivitySerializer
from .factories import LeadFactory, ActivityFactory
from accounts.factories import UserFactory


class LeadSerializerTest(TestCase):
    """Test Lead serializer functionality"""
    
    def setUp(self):
        self.user = UserFactory()
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/')
        self.request.user = self.user

    def test_lead_serializer_full_name(self):
        """Test LeadSerializer full_name field"""
        lead = LeadFactory(
            user=self.user,
            first_name='John',
            last_name='Doe'
        )
        
        serializer = LeadSerializer(lead, context={'request': self.request})
        
        self.assertEqual(serializer.data['full_name'], 'John Doe')
        self.assertEqual(serializer.data['user_id'], self.user.id)
        self.assertEqual(serializer.data['first_name'], 'John')
        self.assertEqual(serializer.data['last_name'], 'Doe')

    def test_lead_serializer_create_assigns_user(self):
        """Test that LeadSerializer.create assigns the current user"""
        data = {
            'first_name': 'New',
            'last_name': 'Lead',
            'email': 'newlead@example.com',
            'phone': '555-1234',
            'status': 'new',
            'source': 'website',
            'budget_min': 200000,
            'budget_max': 400000,
            'property_interest': 'House'
        }
        
        serializer = LeadSerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())
        
        lead = serializer.save()
        
        self.assertEqual(lead.user, self.user)
        self.assertEqual(lead.first_name, 'New')
        self.assertEqual(lead.email, 'newlead@example.com')

    def test_lead_serializer_read_only_fields(self):
        """Test that read-only fields are properly set"""
        lead = LeadFactory(user=self.user)
        
        serializer = LeadSerializer(lead, context={'request': self.request})
        
        # These fields should be in the data but read-only
        self.assertIn('id', serializer.data)
        self.assertIn('user_id', serializer.data)
        self.assertIn('full_name', serializer.data)
        self.assertIn('created_at', serializer.data)
        self.assertIn('updated_at', serializer.data)

    def test_lead_serializer_validation(self):
        """Test LeadSerializer validation"""
        # Test with valid data
        data = {
            'first_name': 'Valid',
            'last_name': 'Lead',
            'email': 'valid@example.com',
            'status': 'new'
        }
        
        serializer = LeadSerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())

        # Test with invalid email
        data['email'] = 'invalid-email'
        serializer = LeadSerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

        # Test with invalid status
        data['email'] = 'valid@example.com'
        data['status'] = 'invalid_status'
        serializer = LeadSerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)


class ActivitySerializerTest(TestCase):
    """Test Activity serializer functionality"""
    
    def setUp(self):
        self.user = UserFactory()
        self.lead = LeadFactory(user=self.user)
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/')
        self.request.user = self.user

    def test_activity_serializer_lead_data(self):
        """Test ActivitySerializer lead field data"""
        activity = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_type='call',
            title='Test call'
        )
        
        serializer = ActivitySerializer(activity, context={'request': self.request})
        
        # Test lead data
        self.assertEqual(serializer.data['lead_id'], self.lead.id)
        self.assertEqual(serializer.data['lead']['id'], self.lead.id)
        self.assertEqual(serializer.data['lead']['first_name'], self.lead.first_name)
        self.assertEqual(serializer.data['lead']['last_name'], self.lead.last_name)
        self.assertEqual(serializer.data['lead']['full_name'], f"{self.lead.first_name} {self.lead.last_name}")

    def test_activity_serializer_user_data(self):
        """Test ActivitySerializer user field data"""
        activity = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_type='email',
            title='Test email'
        )
        
        serializer = ActivitySerializer(activity, context={'request': self.request})
        
        # Test user data
        self.assertEqual(serializer.data['user_id'], self.user.id)
        self.assertEqual(serializer.data['user']['id'], self.user.id)
        self.assertEqual(serializer.data['user']['username'], self.user.username)

    def test_activity_serializer_create_assigns_user(self):
        """Test that ActivitySerializer.create assigns the current user"""
        data = {
            'activity_type': 'call',
            'title': 'New call',
            'notes': 'Test notes',
            'duration': 30,
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())
        
        activity = serializer.save(lead=self.lead)
        
        self.assertEqual(activity.user, self.user)
        self.assertEqual(activity.lead, self.lead)
        self.assertEqual(activity.activity_type, 'call')
        self.assertEqual(activity.title, 'New call')

    def test_activity_serializer_duration_validation(self):
        """Test ActivitySerializer duration validation"""
        # Test with valid duration
        data = {
            'activity_type': 'call',
            'title': 'Test call',
            'duration': 30,
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())

        # Test with negative duration
        data['duration'] = -5
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('duration', serializer.errors)

        # Test with zero duration
        data['duration'] = 0
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('duration', serializer.errors)

    def test_activity_serializer_optional_duration(self):
        """Test that duration is optional for non-call activities"""
        data = {
            'activity_type': 'email',
            'title': 'Test email',
            'activity_date': '2024-01-15T14:00:00Z'
            # No duration field
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())

    def test_activity_serializer_read_only_fields(self):
        """Test that read-only fields are properly set"""
        activity = ActivityFactory(lead=self.lead, user=self.user)
        
        serializer = ActivitySerializer(activity, context={'request': self.request})
        
        # These fields should be in the data but read-only
        self.assertIn('id', serializer.data)
        self.assertIn('lead_id', serializer.data)
        self.assertIn('lead', serializer.data)
        self.assertIn('user_id', serializer.data)
        self.assertIn('user', serializer.data)
        self.assertIn('created_at', serializer.data)

    def test_activity_serializer_activity_type_validation(self):
        """Test ActivitySerializer activity_type validation"""
        valid_types = ['call', 'email', 'meeting', 'note']
        
        for activity_type in valid_types:
            data = {
                'activity_type': activity_type,
                'title': f'Test {activity_type}',
                'activity_date': '2024-01-15T14:00:00Z'
            }
            
            serializer = ActivitySerializer(data=data, context={'request': self.request})
            self.assertTrue(serializer.is_valid(), f"Failed for activity_type: {activity_type}")

        # Test with invalid activity type
        data = {
            'activity_type': 'invalid_type',
            'title': 'Test invalid',
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('activity_type', serializer.errors)

    def test_activity_serializer_required_fields(self):
        """Test ActivitySerializer required fields validation"""
        # Test missing activity_type
        data = {
            'title': 'Test activity',
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('activity_type', serializer.errors)

        # Test missing title
        data = {
            'activity_type': 'call',
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

        # Test missing activity_date
        data = {
            'activity_type': 'call',
            'title': 'Test call'
        }
        
        serializer = ActivitySerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('activity_date', serializer.errors)
