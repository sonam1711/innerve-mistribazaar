"""Serializers for User, ContractorProfile, MistriProfile, and TraderProfile
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, ContractorProfile, MistriProfile, TraderProfile


class ContractorProfileSerializer(serializers.ModelSerializer):
    """Serializer for Contractor profile"""
    
    class Meta:
        model = ContractorProfile
        fields = [
            'company_name', 'experience_years', 'min_project_value',
            'completed_projects', 'is_verified', 'is_available'
        ]
        read_only_fields = ['completed_projects', 'is_verified']


class MistriProfileSerializer(serializers.ModelSerializer):
    """Serializer for Mistri profile"""
    
    class Meta:
        model = MistriProfile
        fields = [
            'skills', 'daily_rate', 'experience_years', 'available_dates',
            'completed_jobs', 'sms_notifications', 'call_notifications',
            'is_verified', 'is_available'
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


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User with nested profiles"""
    
    contractor_profile = ContractorProfileSerializer(required=False)
    mistri_profile = MistriProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'phone', 'role', 'latitude', 'longitude',
            'rating', 'language', 'created_at', 'contractor_profile',
            'mistri_profile', 'trader_profile'
        ]
        read_only_fields = ['id', 'rating', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    contractor_profile = ContractorProfileSerializer(required=False)
    mistri_profile = MistriProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name', 'phone', 'password', 'password2', 'role',
            'latitude', 'longitude', 'language',
            'contractor_profile', 'mistri_profile', 'trader_profile'
        ]
    
    def validate(self, attrs):
        """Validate password match and role-specific profiles"""
        
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        role = attrs.get('role')
        
        # Validate role-specific profiles (only if data is provided)
        if role == 'CONTRACTOR' and 'contractor_profile' in attrs:
            contractor_data = attrs['contractor_profile']
            # Company name is optional, but experience years should be provided
            if 'experience_years' not in contractor_data:
                raise serializers.ValidationError({
                    "contractor_profile": "Experience years are required for Contractor profile."
                })
        
        if role == 'MISTRI' and 'mistri_profile' in attrs:
            mistri_data = attrs['mistri_profile']
            if not mistri_data.get('skills') or not mistri_data.get('daily_rate'):
                raise serializers.ValidationError({
                    "mistri_profile": "Skills and daily rate are required for Mistri profile."
                })
        
        if role == 'TRADER' and 'trader_profile' in attrs:
            trader_data = attrs['trader_profile']
            if not trader_data.get('materials'):
                raise serializers.ValidationError({
                    "trader_profile": "Materials are required for Trader profile."
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create user with nested profile"""
        
        validated_data.pop('password2')
        contractor_profile_data = validated_data.pop('contractor_profile', None)
        mistri_profile_data = validated_data.pop('mistri_profile', None)
        trader_profile_data = validated_data.pop('trader_profile', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create role-specific profile
        if contractor_profile_data and user.role == 'CONTRACTOR':
            ContractorProfile.objects.create(user=user, **contractor_profile_data)
        
        if mistri_profile_data and user.role == 'MISTRI':
            MistriProfile.objects.create(user=user, **mistri_profile_data)
        
        if trader_profile_data and user.role == 'TRADER':
            TraderProfile.objects.create(user=user, **trader_profile_data)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    contractor_profile = ContractorProfileSerializer(required=False)
    mistri_profile = MistriProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name', 'latitude', 'longitude', 'language',
            'contractor_profile', 'mistri_profile', 'trader_profile'
        ]
    
    def update(self, instance, validated_data):
        """Update user and nested profiles"""
        
        contractor_profile_data = validated_data.pop('contractor_profile', None)
        mistri_profile_data = validated_data.pop('mistri_profile', None)
        trader_profile_data = validated_data.pop('trader_profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update contractor profile
        if contractor_profile_data and hasattr(instance, 'contractor_profile'):
            for attr, value in contractor_profile_data.items():
                setattr(instance.contractor_profile, attr, value)
            instance.contractor_profile.save()
        
        # Update mistri profile
        if mistri_profile_data and hasattr(instance, 'mistri_profile'):
            for attr, value in mistri_profile_data.items():
                setattr(instance.mistri_profile, attr, value)
            instance.mistri_profile.save()
        
        # Update trader profile
        if trader_profile_data and hasattr(instance, 'trader_profile'):
            for attr, value in trader_profile_data.items():
                setattr(instance.trader_profile, attr, value)
            instance.trader_profile.save()
        
        return instance
