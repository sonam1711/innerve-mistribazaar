"""
URL configuration for bids app
"""
from django.urls import path
from .views import (
    BidCreateView, BidListView, BidDetailView, JobBidsView,
    AcceptBidView, RejectBidView, WithdrawBidView
)

urlpatterns = [
    path('', BidListView.as_view(), name='bid-list'),
    path('create/', BidCreateView.as_view(), name='bid-create'),
    path('<int:pk>/', BidDetailView.as_view(), name='bid-detail'),
    path('<int:pk>/accept/', AcceptBidView.as_view(), name='bid-accept'),
    path('<int:pk>/reject/', RejectBidView.as_view(), name='bid-reject'),
    path('<int:pk>/withdraw/', WithdrawBidView.as_view(), name='bid-withdraw'),
    path('job/<int:job_id>/', JobBidsView.as_view(), name='job-bids'),
]
