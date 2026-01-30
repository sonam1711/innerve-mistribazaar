"""
Serializers for Job and JobImage
Updated for simplified job system (no bidding)
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
    customer_details = UserSerializer(source='customer', read_only=True)
    
    # For creating jobs with images
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Job
        fields = [
            'id', 'customer', 'job_type', 'title', 'description',
            'budget_min', 'budget_max', 'latitude', 'longitude', 'address',
            'status', 'created_at', 'updated_at', 'deadline',
            'images', 'customer_details', 'image_urls'
        ]
        read_only_fields = ['id', 'customer', 'created_at', 'updated_at']
    
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
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_role = serializers.CharField(source='customer.role', read_only=True)
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'job_type', 'status', 'budget_min', 'budget_max',
            'latitude', 'longitude', 'customer_name', 'customer_role',
            'created_at', 'image_count'
        ]
    
    def get_image_count(self, obj):
        return obj.images.count()


class JobDetailSerializer(serializers.ModelSerializer):
    """Detailed job serializer with all information"""
    
    images = JobImageSerializer(many=True, read_only=True)
    customer_details = UserSerializer(source='customer', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'job_type', 'title', 'description',
            'budget_min', 'budget_max', 'latitude', 'longitude', 'address',
            'status', 'deadline', 'created_at', 'updated_at',
            'customer_details', 'images'
        ]


class JobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating jobs"""
    
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Job
        fields = [
            'job_type', 'title', 'description',
            'budget_min', 'budget_max', 'latitude', 'longitude',
            'address', 'deadline', 'image_urls'
        ]
    
    def validate(self, attrs):
        """Validate budget and job type"""
        if attrs['budget_min'] > attrs['budget_max']:
            raise serializers.ValidationError({
                "budget": "Minimum budget cannot be greater than maximum budget."
            })
        return attrs
    
    def create(self, validated_data):
        """Create job with images and set customer from request context"""
        image_urls = validated_data.pop('image_urls', [])
        
        # Get customer from request context
        request = self.context.get('request')
        validated_data['customer'] = request.user
        
        job = Job.objects.create(**validated_data)
        
        # Create job images
        for url in image_urls:
            JobImage.objects.create(job=job, image_url=url)
        
        return job
