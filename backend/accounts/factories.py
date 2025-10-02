import factory
from django.contrib.auth.models import User
from factory.django import DjangoModelFactory


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}@example.com")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    is_staff = False
    is_superuser = False

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override to sync username with email and handle password"""
        email = kwargs.get('email')
        if email:
            kwargs['username'] = email
        
        # Handle password
        password = kwargs.pop('password', 'testpass123')
        
        user = super()._create(model_class, *args, **kwargs)
        user.set_password(password)
        user.save()
        return user