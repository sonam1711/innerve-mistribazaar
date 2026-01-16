"""
URL configuration for ratings app
"""
from django.urls import path
from .views import RatingCreateView, RatingListView, UserRatingsView, RatingDetailView

urlpatterns = [
    path('', RatingListView.as_view(), name='rating-list'),
    path('create/', RatingCreateView.as_view(), name='rating-create'),
    path('<int:pk>/', RatingDetailView.as_view(), name='rating-detail'),
    path('user/<int:user_id>/', UserRatingsView.as_view(), name='user-ratings'),
]
