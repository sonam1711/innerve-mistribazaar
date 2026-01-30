"""
URL configuration for users app
Updated for Supabase authentication
"""
from django.urls import path
from .views import (
    ProfileCompletionView, UserProfileView, UserDetailView, UserListView,
    WorkerProfileUpdateView, TraderProfileUpdateView, ConstructorProfileUpdateView
)

urlpatterns = [
    # Profile management (after Supabase auth)
    path('complete-profile/', ProfileCompletionView.as_view(), name='complete-profile'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Role-specific profile endpoints
    path('worker-profile/', WorkerProfileUpdateView.as_view(), name='worker-profile'),
    path('trader-profile/', TraderProfileUpdateView.as_view(), name='trader-profile'),
    path('constructor-profile/', ConstructorProfileUpdateView.as_view(), name='constructor-profile'),
]
