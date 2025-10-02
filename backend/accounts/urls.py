from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, MeView, LoginView, RegisterAndLoginView

urlpatterns = [
    path('register/', RegisterAndLoginView.as_view(), name="register"),
    path('login/', LoginView.as_view(), name="login"),
    path('refresh/', TokenRefreshView.as_view(), name="refresh"),
    path('me/', MeView.as_view(), name="me"),
]
