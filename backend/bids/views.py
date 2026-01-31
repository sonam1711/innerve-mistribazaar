"""
Views for Bid and JobAcceptance management
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from math import radians, cos, sin, asin, sqrt
from .models import Bid, JobAcceptance
from jobs.models import Job
from jobs.serializers import JobSerializer, JobListSerializer as JobList
from .serializers import (
    BidSerializer, BidListSerializer, BidUpdateSerializer,
    JobAcceptanceSerializer, JobAcceptanceListSerializer, JobAcceptanceUpdateSerializer
)
from users.permissions import IsContractorOrTrader, IsConsumer, IsMistri


class BidCreateView(generics.CreateAPIView):
    """
    Create a new bid (Contractor/Trader only)
    """
    
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated, IsContractorOrTrader]
    
    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)


class BidListView(generics.ListAPIView):
    """
    List bids
    - Consumers see bids on their jobs
    - Contractors/Traders see their own bids
    """
    
    serializer_class = BidListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'CONSUMER':
            # Show bids on user's jobs
            job_id = self.request.query_params.get('job_id', None)
            if job_id:
                return Bid.objects.filter(job_id=job_id, job__consumer=user)
            return Bid.objects.filter(job__consumer=user).order_by('bid_amount')
        
        else:  # CONTRACTOR or TRADER
            # Show user's bids
            return Bid.objects.filter(bidder=user).order_by('-created_at')


class BidDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update a specific bid
    """
    
    queryset = Bid.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BidUpdateSerializer
        return BidSerializer


class JobBidsView(generics.ListAPIView):
    """
    Get all bids for a specific job
    Only job owner can see all bids
    """
    
    serializer_class = BidListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        user = self.request.user
        
        # Verify user is the job owner
        try:
            job = Job.objects.get(pk=job_id, consumer=user)
        except Job.DoesNotExist:
            return Bid.objects.none()
        
        return Bid.objects.filter(job=job).order_by('bid_amount')


class AcceptBidView(APIView):
    """
    Accept a bid and assign the job
    Only job owner can accept bids
    """
    
    permission_classes = [IsAuthenticated, IsConsumer]
    
    @transaction.atomic
    def post(self, request, pk):
        try:
            bid = Bid.objects.get(pk=pk)
        except Bid.DoesNotExist:
            return Response({
                'error': 'Bid not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        job = bid.job
        
        # Verify user is job owner
        if job.consumer != request.user:
            return Response({
                'error': 'You do not have permission to accept this bid'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verify job is still open
        if job.status != 'OPEN':
            return Response({
                'error': 'This job is no longer open'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Accept the bid
        bid.status = 'ACCEPTED'
        bid.save()
        
        # Update job
        job.selected_provider = bid.bidder
        job.status = 'IN_PROGRESS'
        job.save()
        
        # Reject all other bids
        Bid.objects.filter(job=job).exclude(pk=bid.pk).update(status='REJECTED')
        
        return Response({
            'message': 'Bid accepted successfully',
            'bid': BidSerializer(bid).data
        }, status=status.HTTP_200_OK)


class RejectBidView(APIView):
    """
    Reject a bid
    Only job owner can reject bids
    """
    
    permission_classes = [IsAuthenticated, IsConsumer]
    
    def post(self, request, pk):
        try:
            bid = Bid.objects.get(pk=pk)
        except Bid.DoesNotExist:
            return Response({
                'error': 'Bid not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify user is job owner
        if bid.job.consumer != request.user:
            return Response({
                'error': 'You do not have permission to reject this bid'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Reject the bid
        bid.status = 'REJECTED'
        bid.save()
        
        return Response({
            'message': 'Bid rejected successfully',
            'bid': BidSerializer(bid).data
        }, status=status.HTTP_200_OK)


class WithdrawBidView(APIView):
    """
    Withdraw own bid
    Only bidder can withdraw
    """
    
    permission_classes = [IsAuthenticated, IsContractorOrTrader]
    
    def post(self, request, pk):
        try:
            bid = Bid.objects.get(pk=pk, bidder=request.user)
        except Bid.DoesNotExist:
            return Response({
                'error': 'Bid not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if bid can be withdrawn
        if bid.status != 'PENDING':
            return Response({
                'error': 'Only pending bids can be withdrawn'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Withdraw the bid
        bid.status = 'WITHDRAWN'
        bid.save()
        
        return Response({
            'message': 'Bid withdrawn successfully',
            'bid': BidSerializer(bid).data
        }, status=status.HTTP_200_OK)


# ========================
# JobAcceptance Views (Mistri)
# ========================

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r


class JobAcceptanceCreateView(generics.CreateAPIView):
    """
    Create a new job acceptance (Mistri only)
    Mistri can accept or reject a JOB category job
    """
    
    serializer_class = JobAcceptanceSerializer
    permission_classes = [IsAuthenticated, IsMistri]
    
    def perform_create(self, serializer):
        serializer.save(mistri=self.request.user)


class JobAcceptanceListView(generics.ListAPIView):
    """
    List job acceptances
    - Consumers see acceptances on their jobs
    - Mistri see their own acceptances
    """
    
    serializer_class = JobAcceptanceListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        print(f"[JobAcceptanceListView] User: {user.phone}, Role: {user.role}")
        
        if user.role == 'CONSUMER':
            # Show acceptances on user's jobs
            job_id = self.request.query_params.get('job_id', None)
            if job_id:
                return JobAcceptance.objects.filter(job_id=job_id, job__consumer=user)
            acceptances = JobAcceptance.objects.filter(job__consumer=user).order_by('-created_at')
            print(f"[JobAcceptanceListView] Consumer acceptances count: {acceptances.count()}")
            return acceptances
        
        elif user.role == 'MISTRI':
            # Show mistri's own acceptances
            acceptances = JobAcceptance.objects.filter(mistri=user).order_by('-created_at')
            print(f"[JobAcceptanceListView] Mistri acceptances count: {acceptances.count()}")
            return acceptances
        
        print(f"[JobAcceptanceListView] No matching role, returning empty queryset")
        return JobAcceptance.objects.none()


class NearbyJobsForMistriView(generics.ListAPIView):
    """
    Get nearby JOB category jobs for Mistri
    Filters jobs within specified radius of mistri's location
    """
    
    serializer_class = JobList
    permission_classes = [IsAuthenticated, IsMistri]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get location from query params or user profile
        latitude = self.request.query_params.get('latitude', user.latitude)
        longitude = self.request.query_params.get('longitude', user.longitude)
        radius_km = float(self.request.query_params.get('radius', 50))  # Default 50km
        
        if not latitude or not longitude:
            return Job.objects.none()
        
        # Get all OPEN JOB category jobs
        jobs = Job.objects.filter(status='OPEN', category='JOB')
        
        # Filter by distance
        nearby_jobs = []
        for job in jobs:
            if job.latitude and job.longitude:
                distance = haversine_distance(latitude, longitude, job.latitude, job.longitude)
                if distance <= radius_km:
                    nearby_jobs.append(job.id)
        
        return Job.objects.filter(id__in=nearby_jobs).order_by('-created_at')


class JobAcceptanceDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update a specific job acceptance
    """
    
    queryset = JobAcceptance.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobAcceptanceUpdateSerializer
        return JobAcceptanceSerializer


class AcceptJobByMistriView(APIView):
    """
    Mistri accepts a job
    Consumer then chooses which mistri to assign
    """
    
    permission_classes = [IsAuthenticated, IsMistri]
    
    def post(self, request, job_id):
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify job category is JOB
        if job.category != 'JOB':
            return Response({
                'error': 'Only JOB category jobs can be accepted by mistri'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify job is still open
        if job.status != 'OPEN':
            return Response({
                'error': 'This job is no longer open'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if mistri already responded
        if JobAcceptance.objects.filter(job=job, mistri=request.user).exists():
            return Response({
                'error': 'You have already responded to this job'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create job acceptance
        proposed_start_date = request.data.get('proposed_start_date')
        message = request.data.get('message', '')
        
        acceptance = JobAcceptance.objects.create(
            job=job,
            mistri=request.user,
            status='ACCEPTED',
            proposed_start_date=proposed_start_date,
            message=message
        )
        
        return Response({
            'message': 'Job acceptance submitted successfully',
            'acceptance': JobAcceptanceSerializer(acceptance).data
        }, status=status.HTTP_201_CREATED)


class RejectJobByMistriView(APIView):
    """
    Mistri rejects a job
    """
    
    permission_classes = [IsAuthenticated, IsMistri]
    
    def post(self, request, job_id):
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if mistri already responded
        if JobAcceptance.objects.filter(job=job, mistri=request.user).exists():
            return Response({
                'error': 'You have already responded to this job'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create rejection
        message = request.data.get('message', '')
        
        acceptance = JobAcceptance.objects.create(
            job=job,
            mistri=request.user,
            status='REJECTED',
            message=message
        )
        
        return Response({
            'message': 'Job rejection recorded',
            'acceptance': JobAcceptanceSerializer(acceptance).data
        }, status=status.HTTP_201_CREATED)


class SelectMistriForJobView(APIView):
    """
    Consumer selects a mistri who accepted the job
    Job status changes to IN_PROGRESS
    """
    
    permission_classes = [IsAuthenticated, IsConsumer]
    
    @transaction.atomic
    def post(self, request, job_id, acceptance_id):
        try:
            job = Job.objects.get(pk=job_id, consumer=request.user)
            acceptance = JobAcceptance.objects.get(pk=acceptance_id, job=job, status='ACCEPTED')
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)
        except JobAcceptance.DoesNotExist:
            return Response({
                'error': 'Job acceptance not found or not in accepted state'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify job is still open
        if job.status != 'OPEN':
            return Response({
                'error': 'This job is no longer open'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Assign job to mistri
        job.selected_provider = acceptance.mistri
        job.status = 'IN_PROGRESS'
        job.save()
        
        return Response({
            'message': 'Mistri selected successfully',
            'job': JobSerializer(job).data
        }, status=status.HTTP_200_OK)
