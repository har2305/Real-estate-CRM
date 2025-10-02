import factory
from factory.django import DjangoModelFactory
from django.contrib.auth.models import User
from .models import Lead, Activity
from accounts.factories import UserFactory


class LeadFactory(DjangoModelFactory):
    class Meta:
        model = Lead

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Faker('email')
    phone = factory.Faker('phone_number')
    status = factory.Iterator(['new', 'contacted', 'qualified', 'negotiation', 'closed', 'lost'])
    source = factory.Iterator(['website', 'referral', 'zillow', 'other'])
    budget_min = factory.Faker('random_int', min=100000, max=500000)
    budget_max = factory.Faker('random_int', min=500000, max=1000000)
    property_interest = factory.Faker('text', max_nb_chars=200)
    is_active = True


class ActivityFactory(DjangoModelFactory):
    class Meta:
        model = Activity

    lead = factory.SubFactory(LeadFactory)
    user = factory.SelfAttribute('lead.user')  # Use the same user as the lead
    activity_type = factory.Iterator(['call', 'email', 'meeting', 'note'])
    title = factory.Faker('sentence', nb_words=4)
    notes = factory.Faker('text', max_nb_chars=500)
    duration = factory.Faker('random_int', min=5, max=120)
    activity_date = factory.Faker('date_time_this_year')
