"""
URL configuration for bids app
"""
from django.urls import path
from .views import (
    BidCreateView, BidListView, BidDetailView, JobBidsView,
    AcceptBidView, RejectBidView, WithdrawBidView,
    JobAcceptanceCreateView, JobAcceptanceListView, JobAcceptanceDetailView,
    NearbyJobsForMistriView, AcceptJobByMistriView, RejectJobByMistriView,
    SelectMistriForJobView
)

urlpatterns = [
    # Bid endpoints (for contractors/traders on PROJECT category)
    path('', BidListView.as_view(), name='bid-list'),
    path('create/', BidCreateView.as_view(), name='bid-create'),
    path('<int:pk>/', BidDetailView.as_view(), name='bid-detail'),
    path('<int:pk>/accept/', AcceptBidView.as_view(), name='bid-accept'),
    path('<int:pk>/reject/', RejectBidView.as_view(), name='bid-reject'),
    path('<int:pk>/withdraw/', WithdrawBidView.as_view(), name='bid-withdraw'),
    path('job/<int:job_id>/', JobBidsView.as_view(), name='job-bids'),
    
    # Job acceptance endpoints (for mistri on JOB category)
    path('acceptances/', JobAcceptanceListView.as_view(), name='job-acceptance-list'),
    path('acceptances/create/', JobAcceptanceCreateView.as_view(), name='job-acceptance-create'),
    path('acceptances/<int:pk>/', JobAcceptanceDetailView.as_view(), name='job-acceptance-detail'),
    path('acceptances/nearby-jobs/', NearbyJobsForMistriView.as_view(), name='nearby-jobs-mistri'),
    path('acceptances/accept-job/<int:job_id>/', AcceptJobByMistriView.as_view(), name='accept-job-mistri'),
    path('acceptances/reject-job/<int:job_id>/', RejectJobByMistriView.as_view(), name='reject-job-mistri'),
    path('acceptances/select-mistri/<int:job_id>/<int:acceptance_id>/', SelectMistriForJobView.as_view(), name='select-mistri'),
]
