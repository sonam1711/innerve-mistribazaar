"""
Serializers for Rating
"""
from rest_framework import serializers
from .models import Rating
from users.serializers import UserSerializer


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for creating and viewing ratings"""
    
    rated_to_details = UserSerializer(source='rated_to', read_only=True)
    rated_by_details = UserSerializer(source='rated_by', read_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'job', 'rated_to', 'rated_by', 'rating', 'review',
            'created_at', 'updated_at',
            'rated_to_details', 'rated_by_details'
        ]
        read_only_fields = ['id', 'rated_by', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate rating constraints"""
        
        job = attrs.get('job')
        request = self.context.get('request')
        
        # Check if job is completed
        if job.status != 'COMPLETED':
            raise serializers.ValidationError("You can only rate completed jobs.")
        
        # Check if user is the consumer of this job
        if request and job.consumer != request.user:
            raise serializers.ValidationError("Only the job owner can rate.")
        
        # Check if rating already exists
        if Rating.objects.filter(job=job).exists():
            raise serializers.ValidationError("This job has already been rated.")
        
        # Check if rated_to is the selected provider
        rated_to = attrs.get('rated_to')
        if job.selected_provider != rated_to:
            raise serializers.ValidationError("You can only rate the selected provider for this job.")
        
        return attrs


class RatingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for rating listings"""
    
    rated_by_name = serializers.CharField(source='rated_by.name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'job', 'job_title', 'rated_by_name',
            'rating', 'review', 'created_at'
        ]
