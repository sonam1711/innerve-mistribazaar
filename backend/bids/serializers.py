"""
Serializers for Bid and JobAcceptance
"""
from rest_framework import serializers
from .models import Bid, JobAcceptance
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
        
        # Check if job category is PROJECT (only projects accept bids)
        if job.category != 'PROJECT':
            raise serializers.ValidationError(
                "Only PROJECT category jobs accept bids. JOB category uses job acceptance by mistri."
            )
        
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


class JobAcceptanceSerializer(serializers.ModelSerializer):
    """Serializer for mistri job acceptances"""
    
    mistri_details = UserSerializer(source='mistri', read_only=True)
    job_details = JobListSerializer(source='job', read_only=True)
    
    class Meta:
        model = JobAcceptance
        fields = [
            'id', 'job', 'mistri', 'status', 'note', 
            'created_at', 'updated_at',
            'mistri_details', 'job_details'
        ]
        read_only_fields = ['id', 'mistri', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate job acceptance constraints"""
        
        job = attrs.get('job')
        request = self.context.get('request')
        
        # Check if job category is JOB (only JOB category uses mistri acceptance)
        if job.category != 'JOB':
            raise serializers.ValidationError(
                "Only JOB category jobs can be accepted by mistri. PROJECT category uses bidding by contractors/traders."
            )
        
        # Check if job is open
        if job.status != 'OPEN':
            raise serializers.ValidationError("This job is no longer open for acceptance.")
        
        # Check if mistri already responded to this job
        if request and JobAcceptance.objects.filter(job=job, mistri=request.user).exists():
            raise serializers.ValidationError("You have already responded to this job.")
        
        return attrs


class JobAcceptanceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job acceptance listings"""
    
    mistri_name = serializers.SerializerMethodField()
    mistri_rating = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = JobAcceptance
        fields = [
            'id', 'job', 'job_title', 'mistri', 'mistri_name', 'mistri_rating',
            'status', 'note', 'created_at'
        ]
    
    def get_mistri_name(self, obj):
        return obj.mistri.name if obj.mistri else None
    
    def get_mistri_rating(self, obj):
        return float(obj.mistri.rating) if obj.mistri else 0.0
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None


class JobAcceptanceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating job acceptance status"""
    
    class Meta:
        model = JobAcceptance
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transitions"""
        
        instance = self.instance
        request = self.context.get('request')
        
        # Only mistri can update their own acceptance
        if request and instance.mistri != request.user:
            raise serializers.ValidationError("You can only update your own job acceptance.")
        
        # Can only move from PENDING to ACCEPTED or REJECTED
        if instance.status != 'PENDING':
            raise serializers.ValidationError("Job acceptance has already been finalized.")
        
        return value
