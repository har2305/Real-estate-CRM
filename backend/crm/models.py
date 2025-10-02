from django.db import models
from django.conf import settings

# Create your models here.
class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('negotiation', 'Negotiation'),
        ('closed', 'Closed'),
        ('lost', 'Lost'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leads')  # who owns this lead
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()  # Remove unique=True since multiple users can have same email
    phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=50, blank=True)  # website/referral/zillow/other
    budget_min = models.IntegerField(null=True, blank=True)
    budget_max = models.IntegerField(null=True, blank=True)
    property_interest = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)  # soft delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
class Activity(models.Model):
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
    ]

    lead = models.ForeignKey('crm.Lead', on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # who created it
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)  # minutes, only for calls if you want
    activity_date = models.DateTimeField()  # when it happened

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-activity_date','-created_at']

    def __str__(self):
        return f"{self.activity_type} - {self.title} ({self.lead.id})"