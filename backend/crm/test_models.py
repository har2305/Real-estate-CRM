import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import Lead, Activity
from .factories import LeadFactory, ActivityFactory
from accounts.factories import UserFactory


class LeadModelTest(TestCase):
    """Test Lead model functionality"""
    
    def setUp(self):
        self.user = UserFactory()
    
    def test_lead_creation(self):
        """Test lead creation with all fields"""
        lead = LeadFactory(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            phone='555-1234',
            status='new',
            source='website',
            budget_min=200000,
            budget_max=400000,
            property_interest='3 bedroom house'
        )
        
        self.assertEqual(lead.user, self.user)
        self.assertEqual(lead.first_name, 'John')
        self.assertEqual(lead.last_name, 'Doe')
        self.assertEqual(lead.email, 'john@example.com')
        self.assertEqual(lead.phone, '555-1234')
        self.assertEqual(lead.status, 'new')
        self.assertEqual(lead.source, 'website')
        self.assertEqual(lead.budget_min, 200000)
        self.assertEqual(lead.budget_max, 400000)
        self.assertEqual(lead.property_interest, '3 bedroom house')
        self.assertTrue(lead.is_active)
        self.assertIsNotNone(lead.created_at)
        self.assertIsNotNone(lead.updated_at)

    def test_lead_str_representation(self):
        """Test lead string representation"""
        lead = LeadFactory(first_name='John', last_name='Doe', email='john@example.com')
        expected = "John Doe (john@example.com)"
        self.assertEqual(str(lead), expected)

    def test_lead_status_choices(self):
        """Test lead status field choices"""
        valid_statuses = ['new', 'contacted', 'qualified', 'negotiation', 'closed', 'lost']
        
        for status in valid_statuses:
            lead = LeadFactory(user=self.user, status=status)
            self.assertEqual(lead.status, status)

    def test_lead_soft_delete(self):
        """Test lead soft delete functionality"""
        lead = LeadFactory(user=self.user)
        self.assertTrue(lead.is_active)
        
        # Soft delete
        lead.is_active = False
        lead.save()
        
        self.assertFalse(lead.is_active)
        # Lead should still exist in database
        self.assertTrue(Lead.objects.filter(id=lead.id).exists())

    def test_lead_user_relationship(self):
        """Test lead belongs to user"""
        lead = LeadFactory(user=self.user)
        
        # Test forward relationship
        self.assertEqual(lead.user, self.user)
        
        # Test reverse relationship
        self.assertIn(lead, self.user.leads.filter(is_active=True))

    def test_lead_email_not_unique(self):
        """Test that multiple users can have leads with same email"""
        user2 = UserFactory()
        
        lead1 = LeadFactory(user=self.user, email='same@example.com')
        lead2 = LeadFactory(user=user2, email='same@example.com')
        
        self.assertEqual(lead1.email, lead2.email)
        self.assertNotEqual(lead1.user, lead2.user)


class ActivityModelTest(TestCase):
    """Test Activity model functionality"""
    
    def setUp(self):
        self.user = UserFactory()
        self.lead = LeadFactory(user=self.user)
    
    def test_activity_creation(self):
        """Test activity creation with all fields"""
        activity = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_type='call',
            title='Initial contact call',
            notes='Discussed property requirements',
            duration=30,
            activity_date='2024-01-15T10:00:00Z'
        )
        
        self.assertEqual(activity.lead, self.lead)
        self.assertEqual(activity.user, self.user)
        self.assertEqual(activity.activity_type, 'call')
        self.assertEqual(activity.title, 'Initial contact call')
        self.assertEqual(activity.notes, 'Discussed property requirements')
        self.assertEqual(activity.duration, 30)
        self.assertIsNotNone(activity.activity_date)
        self.assertIsNotNone(activity.created_at)

    def test_activity_str_representation(self):
        """Test activity string representation"""
        activity = ActivityFactory(
            lead=self.lead,
            activity_type='call',
            title='Test call'
        )
        expected = f"call - Test call ({self.lead.id})"
        self.assertEqual(str(activity), expected)

    def test_activity_type_choices(self):
        """Test activity type field choices"""
        valid_types = ['call', 'email', 'meeting', 'note']
        
        for activity_type in valid_types:
            activity = ActivityFactory(
                lead=self.lead,
                user=self.user,
                activity_type=activity_type
            )
            self.assertEqual(activity.activity_type, activity_type)

    def test_activity_lead_relationship(self):
        """Test activity belongs to lead"""
        activity = ActivityFactory(lead=self.lead, user=self.user)
        
        # Test forward relationship
        self.assertEqual(activity.lead, self.lead)
        
        # Test reverse relationship
        self.assertIn(activity, self.lead.activities.all())

    def test_activity_user_relationship(self):
        """Test activity belongs to user"""
        activity = ActivityFactory(lead=self.lead, user=self.user)
        
        # Test forward relationship
        self.assertEqual(activity.user, self.user)

    def test_activity_ordering(self):
        """Test activity ordering by activity_date and created_at"""
        # Create activities with different dates
        activity1 = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_date='2024-01-15T10:00:00Z'
        )
        activity2 = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_date='2024-01-16T10:00:00Z'
        )
        activity3 = ActivityFactory(
            lead=self.lead,
            user=self.user,
            activity_date='2024-01-15T10:00:00Z'
        )
        
        # Get activities ordered by model's Meta ordering
        activities = Activity.objects.filter(lead=self.lead)
        
        # Should be ordered by -activity_date, -created_at
        self.assertEqual(activities[0], activity2)  # Most recent date
        # Between activities with same date, most recent created_at should be first
        if activity1.created_at > activity3.created_at:
            self.assertEqual(activities[1], activity1)
            self.assertEqual(activities[2], activity3)
        else:
            self.assertEqual(activities[1], activity3)
            self.assertEqual(activities[2], activity1)

    def test_activity_duration_optional(self):
        """Test that activity duration is optional"""
        activity = ActivityFactory(
            lead=self.lead,
            user=self.user,
            duration=None
        )
        
        self.assertIsNone(activity.duration)

    def test_activity_notes_optional(self):
        """Test that activity notes are optional"""
        activity = ActivityFactory(
            lead=self.lead,
            user=self.user,
            notes=''
        )
        
        self.assertEqual(activity.notes, '')

    def test_activity_cascade_delete(self):
        """Test that activities are deleted when lead is deleted"""
        activity = ActivityFactory(lead=self.lead, user=self.user)
        activity_id = activity.id
        
        # Delete the lead
        self.lead.delete()
        
        # Activity should be deleted too
        self.assertFalse(Activity.objects.filter(id=activity_id).exists())

    def test_activity_user_cascade_delete(self):
        """Test that activities are deleted when user is deleted"""
        activity = ActivityFactory(lead=self.lead, user=self.user)
        activity_id = activity.id
        
        # Delete the user
        self.user.delete()
        
        # Activity should be deleted too
        self.assertFalse(Activity.objects.filter(id=activity_id).exists())
