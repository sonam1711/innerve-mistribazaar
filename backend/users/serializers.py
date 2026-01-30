"""
Serializers for User, WorkerProfile, TraderProfile, and ConstructorProfile
Updated for Supabase authentication
"""
from rest_framework import serializers
from .models import User, WorkerProfile, TraderProfile, ConstructorProfile


class WorkerProfileSerializer(serializers.ModelSerializer):
    """Serializer for Worker profile"""
    
    class Meta:
        model = WorkerProfile
        fields = [
            'skills', 'hourly_rate', 'daily_rate', 'experience_years', 
            'available_dates', 'completed_jobs', 'is_verified', 'is_available'
        ]
        read_only_fields = ['completed_jobs', 'is_verified']


class TraderProfileSerializer(serializers.ModelSerializer):
    """Serializer for Trader profile"""
    
    class Meta:
        model = TraderProfile
        fields = [
            'materials', 'delivery_radius_km', 'avg_delivery_time',
            'business_name', 'completed_orders', 'is_verified', 'is_available'
        ]
        read_only_fields = ['completed_orders', 'is_verified']


class ConstructorProfileSerializer(serializers.ModelSerializer):
    """Serializer for Constructor profile"""
    
    class Meta:
        model = ConstructorProfile
        fields = [
            'company_name', 'license_number', 'specializations', 
            'experience_years', 'team_size', 'max_project_value',
            'completed_projects', 'is_verified', 'is_available'
        ]
        read_only_fields = ['completed_projects', 'is_verified']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User with nested profiles"""
    
    worker_profile = WorkerProfileSerializer(required=False, read_only=True)
    trader_profile = TraderProfileSerializer(required=False, read_only=True)
    constructor_profile = ConstructorProfileSerializer(required=False, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'supabase_id', 'name', 'phone', 'role', 
            'latitude', 'longitude', 'rating', 'language', 
            'created_at', 'worker_profile', 'trader_profile', 'constructor_profile'
        ]
        read_only_fields = ['id', 'supabase_id', 'rating', 'created_at']


class ProfileCompletionSerializer(serializers.Serializer):
    """
    Serializer for completing user profile after Supabase authentication
    Used after OTP verification to set role and profile details
    """
    name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=User.Role.choices)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    language = serializers.CharField(max_length=50, default='English')
    
    # Profile data based on role
    worker_profile = WorkerProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    constructor_profile = ConstructorProfileSerializer(required=False)
    
    def validate(self, attrs):
        """Validate role-specific profiles"""
        role = attrs.get('role')
        
        # Profile is optional during initial registration
        # Can be completed later
        if role == User.Role.WORKER and 'worker_profile' in attrs:
            worker_data = attrs['worker_profile']
            if not worker_data.get('skills'):
                raise serializers.ValidationError({
                    "worker_profile": "Skills are required for Worker profile."
                })
        
        if role == User.Role.TRADER and 'trader_profile' in attrs:
            trader_data = attrs['trader_profile']
            if not trader_data.get('materials'):
                raise serializers.ValidationError({
                    "trader_profile": "Materials are required for Trader profile."
                })
        
        if role == User.Role.CONSTRUCTOR and 'constructor_profile' in attrs:
            constructor_data = attrs['constructor_profile']
            if not constructor_data.get('specializations'):
                raise serializers.ValidationError({
                    "constructor_profile": "Specializations are required for Constructor profile."
                })
        
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    worker_profile = WorkerProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    constructor_profile = ConstructorProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name', 'latitude', 'longitude', 'language',
            'worker_profile', 'trader_profile', 'constructor_profile'
        ]
    
    def update(self, instance, validated_data):
        """Update user and nested profiles"""
        
        worker_profile_data = validated_data.pop('worker_profile', None)
        trader_profile_data = validated_data.pop('trader_profile', None)
        constructor_profile_data = validated_data.pop('constructor_profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create worker profile
        if worker_profile_data and instance.role == User.Role.WORKER:
            if hasattr(instance, 'worker_profile'):
                for attr, value in worker_profile_data.items():
                    setattr(instance.worker_profile, attr, value)
                instance.worker_profile.save()
            else:
                WorkerProfile.objects.create(user=instance, **worker_profile_data)
        
        # Update or create trader profile
        if trader_profile_data and instance.role == User.Role.TRADER:
            if hasattr(instance, 'trader_profile'):
                for attr, value in trader_profile_data.items():
                    setattr(instance.trader_profile, attr, value)
                instance.trader_profile.save()
            else:
                TraderProfile.objects.create(user=instance, **trader_profile_data)
        
        # Update or create constructor profile
        if constructor_profile_data and instance.role == User.Role.CONSTRUCTOR:
            if hasattr(instance, 'constructor_profile'):
                for attr, value in constructor_profile_data.items():
                    setattr(instance.constructor_profile, attr, value)
                instance.constructor_profile.save()
            else:
                ConstructorProfile.objects.create(user=instance, **constructor_profile_data)
        
        return instance
