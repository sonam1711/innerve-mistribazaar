"""
Serializers for Bid
"""
from rest_framework import serializers
from .models import Bid
from users.serializers import UserSerializer
from jobs.serializers import JobListSerializer


class BidSerializer(serializers.ModelSerializer):
    """Serializer for creating and viewing bids"""
    
    bidder_details = UserSerializer(source='bidder', read_only=True)
    job_details = JobListSerializer(source='job', read_only=True)
    
    class Meta:
        model = Bid
        fields = [
            'id', 'job', 'bidder', 'bid_amount', 'estimated_days',
            'message', 'status', 'created_at', 'updated_at',
            'bidder_details', 'job_details'
        ]
        read_only_fields = ['id', 'bidder', 'status', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate bid constraints"""
        
        job = attrs.get('job')
        request = self.context.get('request')
        
        # Check if job is open
        if job.status != 'OPEN':
            raise serializers.ValidationError("This job is no longer open for bidding.")
        
        # Check if user already bid on this job
        if request and Bid.objects.filter(job=job, bidder=request.user).exists():
            raise serializers.ValidationError("You have already submitted a bid for this job.")
        
        # Check if bid is within budget range
        bid_amount = attrs.get('bid_amount')
        if bid_amount < job.budget_min or bid_amount > job.budget_max:
            raise serializers.ValidationError(
                f"Bid amount must be between {job.budget_min} and {job.budget_max}."
            )
        
        return attrs


class BidListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for bid listings"""
    
    bidder_name = serializers.CharField(source='bidder.name', read_only=True)
    bidder_rating = serializers.DecimalField(source='bidder.rating', max_digits=3, decimal_places=2, read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = Bid
        fields = [
            'id', 'job', 'job_title', 'bidder', 'bidder_name', 'bidder_rating',
            'bid_amount', 'estimated_days', 'status', 'created_at'
        ]


class BidUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bid status"""
    
    class Meta:
        model = Bid
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transitions"""
        
        instance = self.instance
        
        # Only job owner can accept/reject
        if value in ['ACCEPTED', 'REJECTED']:
            request = self.context.get('request')
            if request and instance.job.consumer != request.user:
                raise serializers.ValidationError("Only the job owner can accept or reject bids.")
        
        # Only bidder can withdraw
        if value == 'WITHDRAWN':
            request = self.context.get('request')
            if request and instance.bidder != request.user:
                raise serializers.ValidationError("Only the bidder can withdraw their bid.")
        
        return value
