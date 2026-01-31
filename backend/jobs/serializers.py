"""
Serializers for Job and JobImage
"""
from rest_framework import serializers
from .models import Job, JobImage
from users.serializers import UserSerializer


class JobImageSerializer(serializers.ModelSerializer):
    """Serializer for job images"""
    
    class Meta:
        model = JobImage
        fields = ['id', 'image_url', 'caption', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job with nested images"""
    
    images = JobImageSerializer(many=True, read_only=True)
    consumer_details = UserSerializer(source='consumer', read_only=True)
    selected_provider_details = UserSerializer(source='selected_provider', read_only=True)
    
    # For creating jobs with images
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Job
        fields = [
            'id', 'consumer', 'category', 'job_type', 'title', 'description',
            'budget_min', 'budget_max', 'latitude', 'longitude', 'address',
            'status', 'selected_provider', 'created_at', 'updated_at', 'deadline',
            'images', 'consumer_details', 'selected_provider_details', 'image_urls'
        ]
        read_only_fields = ['id', 'consumer', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate job category and type"""
        category = attrs.get('category')
        job_type = attrs.get('job_type')
        
        # PROJECT category should have construction-related types
        if category == 'PROJECT' and job_type not in ['CONSTRUCTION', 'RENOVATION']:
            raise serializers.ValidationError(
                "PROJECT category should have CONSTRUCTION or RENOVATION type."
            )
        
        # JOB category should have repair/maintenance types
        if category == 'JOB' and job_type in ['CONSTRUCTION']:
            raise serializers.ValidationError(
                "JOB category cannot have CONSTRUCTION type."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create job with images"""
        
        image_urls = validated_data.pop('image_urls', [])
        job = Job.objects.create(**validated_data)
        
        # Create job images
        for url in image_urls:
            JobImage.objects.create(job=job, image_url=url)
        
        return job


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job listings"""
    
    consumer_name = serializers.CharField(source='consumer.name', read_only=True)
    image_count = serializers.SerializerMethodField()
    bid_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'category', 'title', 'job_type', 'status', 'budget_min', 'budget_max',
            'latitude', 'longitude', 'consumer_name', 'created_at',
            'image_count', 'bid_count'
        ]
    
    def get_image_count(self, obj):
        return obj.images.count()
    
    def get_bid_count(self, obj):
        return obj.bids.count()


class JobDetailSerializer(serializers.ModelSerializer):
    """Detailed job serializer with all information"""
    
    images = JobImageSerializer(many=True, read_only=True)
    consumer_details = UserSerializer(source='consumer', read_only=True)
    selected_provider_details = UserSerializer(source='selected_provider', read_only=True)
    bid_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'category', 'job_type', 'title', 'description',
            'budget_min', 'budget_max', 'latitude', 'longitude', 'address',
            'status', 'deadline', 'created_at', 'updated_at',
            'consumer_details', 'selected_provider_details',
            'images', 'bid_count'
        ]
    
    def get_bid_count(self, obj):
        return obj.bids.count()
