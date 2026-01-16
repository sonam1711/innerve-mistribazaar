"""
URL configuration for jobs app
"""
from django.urls import path
from .views import (
    JobCreateView, JobListView, JobDetailView,
    MyJobsView, NearbyJobsView, JobStatusUpdateView
)

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('create/', JobCreateView.as_view(), name='job-create'),
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    path('nearby/', NearbyJobsView.as_view(), name='nearby-jobs'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('<int:pk>/status/', JobStatusUpdateView.as_view(), name='job-status-update'),
]
