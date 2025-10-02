import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Lead, Activity
from .factories import LeadFactory, ActivityFactory
from accounts.factories import UserFactory


class LeadAPITest(APITestCase):
    """Test Lead API endpoints"""
    
    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()
        
        # Create leads for user1
        self.lead1 = LeadFactory(user=self.user1, first_name='John', last_name='Doe')
        self.lead2 = LeadFactory(user=self.user1, first_name='Jane', last_name='Smith')
        
        # Create lead for user2
        self.lead3 = LeadFactory(user=self.user2, first_name='Bob', last_name='Johnson')
        
        # Get JWT token for user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        
        # URLs
        self.leads_url = reverse('lead-list')
        self.lead_detail_url = lambda id: reverse('lead-detail', kwargs={'pk': id})

    def test_get_leads_authenticated(self):
        """Test getting leads for authenticated user"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.leads_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Only user1's leads
        
        # Verify user isolation
        lead_emails = [lead['email'] for lead in response.data['results']]
        self.assertIn(self.lead1.email, lead_emails)
        self.assertIn(self.lead2.email, lead_emails)
        self.assertNotIn(self.lead3.email, lead_emails)

    def test_get_leads_unauthenticated(self):
        """Test getting leads without authentication"""
        response = self.client.get(self.leads_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_lead_detail_own_lead(self):
        """Test getting detail of own lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.lead_detail_url(self.lead1.id))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.lead1.id)
        self.assertEqual(response.data['first_name'], 'John')

    def test_get_lead_detail_other_user_lead(self):
        """Test getting detail of another user's lead returns 404"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.lead_detail_url(self.lead3.id))
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_lead_authenticated(self):
        """Test creating a new lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'first_name': 'New',
            'last_name': 'Lead',
            'email': 'newlead@example.com',
            'phone': '555-9999',
            'status': 'new',
            'source': 'website',
            'budget_min': 300000,
            'budget_max': 500000,
            'property_interest': '2 bedroom condo'
        }
        
        response = self.client.post(self.leads_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'New')
        self.assertEqual(response.data['user_id'], self.user1.id)
        
        # Verify lead was created in database
        lead = Lead.objects.get(email='newlead@example.com')
        self.assertEqual(lead.user, self.user1)

    def test_create_lead_unauthenticated(self):
        """Test creating lead without authentication"""
        data = {
            'first_name': 'New',
            'last_name': 'Lead',
            'email': 'newlead@example.com'
        }
        
        response = self.client.post(self.leads_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_lead_own_lead(self):
        """Test updating own lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com',
            'status': 'contacted'
        }
        
        response = self.client.patch(self.lead_detail_url(self.lead1.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['status'], 'contacted')
        
        # Verify lead was updated in database
        self.lead1.refresh_from_db()
        self.assertEqual(self.lead1.first_name, 'Updated')
        self.assertEqual(self.lead1.status, 'contacted')

    def test_update_lead_other_user_lead(self):
        """Test updating another user's lead returns 404"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {'first_name': 'Hacked'}
        
        response = self.client.patch(self.lead_detail_url(self.lead3.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_lead_own_lead(self):
        """Test soft deleting own lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.delete(self.lead_detail_url(self.lead1.id))
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify lead was soft deleted
        self.lead1.refresh_from_db()
        self.assertFalse(self.lead1.is_active)

    def test_delete_lead_other_user_lead(self):
        """Test deleting another user's lead returns 404"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.delete(self.lead_detail_url(self.lead3.id))
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_lead_search(self):
        """Test lead search functionality"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.leads_url, {'search': 'John'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['first_name'], 'John')

    def test_lead_filter_by_status(self):
        """Test lead filtering by status"""
        # Update lead2 status
        self.lead2.status = 'qualified'
        self.lead2.save()
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.leads_url, {'status': 'qualified'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'qualified')

    def test_lead_pagination(self):
        """Test lead pagination"""
        # Create more leads to test pagination
        for i in range(15):
            LeadFactory(user=self.user1)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.leads_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)  # Default page size
        self.assertIsNotNone(response.data['next'])  # Should have next page


class ActivityAPITest(APITestCase):
    """Test Activity API endpoints"""
    
    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()
        
        # Create leads
        self.lead1 = LeadFactory(user=self.user1)
        self.lead2 = LeadFactory(user=self.user2)
        
        # Create activities
        self.activity1 = ActivityFactory(lead=self.lead1, user=self.user1)
        self.activity2 = ActivityFactory(lead=self.lead1, user=self.user1)
        self.activity3 = ActivityFactory(lead=self.lead2, user=self.user2)
        
        # Get JWT token for user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        
        # URLs
        self.activities_url = lambda lead_id: reverse('lead-activities', kwargs={'lead_id': lead_id})
        self.activity_detail_url = lambda lead_id, activity_id: reverse('activity-detail', kwargs={'lead_id': lead_id, 'pk': activity_id})
        self.recent_activities_url = reverse('recent-activities')

    def test_get_lead_activities_own_lead(self):
        """Test getting activities for own lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.activities_url(self.lead1.id))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Only user1's activities for lead1

    def test_get_lead_activities_other_user_lead(self):
        """Test getting activities for another user's lead returns 404"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.activities_url(self.lead2.id))
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_activity_own_lead(self):
        """Test creating activity for own lead"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'activity_type': 'call',
            'title': 'Follow-up call',
            'notes': 'Discussed next steps',
            'duration': 15,
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        response = self.client.post(self.activities_url(self.lead1.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['activity_type'], 'call')
        self.assertEqual(response.data['user_id'], self.user1.id)
        self.assertEqual(response.data['lead_id'], self.lead1.id)

    def test_create_activity_other_user_lead(self):
        """Test creating activity for another user's lead returns 404"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'activity_type': 'call',
            'title': 'Unauthorized call',
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        response = self.client.post(self.activities_url(self.lead2.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_recent_activities(self):
        """Test getting recent activities for authenticated user"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.recent_activities_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only user1's activities
        
        # Verify user isolation
        activity_lead_ids = [activity['lead_id'] for activity in response.data]
        self.assertIn(self.lead1.id, activity_lead_ids)
        self.assertNotIn(self.lead2.id, activity_lead_ids)

    def test_activity_validation_duration(self):
        """Test activity duration validation"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'activity_type': 'call',
            'title': 'Test call',
            'duration': -5,  # Invalid negative duration
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        response = self.client.post(self.activities_url(self.lead1.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration', response.data)

    def test_activity_required_fields(self):
        """Test activity creation with missing required fields"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'activity_type': 'call',
            # Missing title and activity_date
        }
        
        response = self.client.post(self.activities_url(self.lead1.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserIsolationTest(APITestCase):
    """Test user isolation across all endpoints"""
    
    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()
        
        # Create data for both users
        self.lead1 = LeadFactory(user=self.user1)
        self.lead2 = LeadFactory(user=self.user2)
        self.activity1 = ActivityFactory(lead=self.lead1, user=self.user1)
        self.activity2 = ActivityFactory(lead=self.lead2, user=self.user2)
        
        # Get JWT token for user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_user_cannot_see_other_user_leads(self):
        """Test that user cannot see other user's leads"""
        response = self.client.get(reverse('lead-list'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead_ids = [lead['id'] for lead in response.data['results']]
        
        self.assertIn(self.lead1.id, lead_ids)
        self.assertNotIn(self.lead2.id, lead_ids)

    def test_user_cannot_access_other_user_lead_detail(self):
        """Test that user cannot access other user's lead detail"""
        response = self.client.get(reverse('lead-detail', kwargs={'pk': self.lead2.id}))
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_see_other_user_activities(self):
        """Test that user cannot see other user's activities"""
        response = self.client.get(reverse('recent-activities'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        activity_ids = [activity['id'] for activity in response.data]
        
        self.assertIn(self.activity1.id, activity_ids)
        self.assertNotIn(self.activity2.id, activity_ids)

    def test_user_cannot_create_activity_for_other_user_lead(self):
        """Test that user cannot create activity for other user's lead"""
        data = {
            'activity_type': 'call',
            'title': 'Unauthorized call',
            'activity_date': '2024-01-15T14:00:00Z'
        }
        
        response = self.client.post(
            reverse('lead-activities', kwargs={'lead_id': self.lead2.id}),
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
