"""
URL configuration for users app
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView, UserDetailView,
    SendOTPView, VerifyOTPView, ResendOTPView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # OTP Authentication
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
