"""
Views for Bid management
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Bid
from jobs.models import Job
from .serializers import BidSerializer, BidListSerializer, BidUpdateSerializer
from users.permissions import IsMasonOrTrader, IsConsumer


class BidCreateView(generics.CreateAPIView):
    """
    Create a new bid (Mason/Trader only)
    """
    
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated, IsMasonOrTrader]
    
    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)


class BidListView(generics.ListAPIView):
    """
    List bids
    - Consumers see bids on their jobs
    - Masons/Traders see their own bids
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
        
        else:  # MASON or TRADER
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
    
    permission_classes = [IsAuthenticated, IsMasonOrTrader]
    
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
