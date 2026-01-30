"""
Serializers for User, MasonProfile, and TraderProfile
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, MasonProfile, TraderProfile


class MasonProfileSerializer(serializers.ModelSerializer):
    """Serializer for Mason profile"""
    
    class Meta:
        model = MasonProfile
        fields = [
            'skills', 'daily_rate', 'experience_years', 'available_dates',
            'completed_jobs', 'is_verified', 'is_available'
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
    
    mason_profile = MasonProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'phone', 'role', 'latitude', 'longitude',
            'rating', 'language', 'created_at', 'mason_profile', 'trader_profile'
        ]
        read_only_fields = ['id', 'rating', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    mason_profile = MasonProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name', 'phone', 'password', 'password2', 'role',
            'latitude', 'longitude', 'language',
            'mason_profile', 'trader_profile'
        ]
    
    def validate(self, attrs):
        """Validate password match and role-specific profiles"""
        
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        role = attrs.get('role')
        
        # Validate role-specific profiles (only if data is provided)
        # Allow empty profiles for all roles during registration
        # Profile can be completed later
        if role == 'MASON' and 'mason_profile' in attrs:
            # Validate mason profile if provided
            mason_data = attrs['mason_profile']
            if not mason_data.get('skills') or not mason_data.get('daily_rate'):
                raise serializers.ValidationError({
                    "mason_profile": "Skills and daily rate are required for Mason profile."
                })
        
        if role == 'TRADER' and 'trader_profile' in attrs:
            # Validate trader profile if provided
            trader_data = attrs['trader_profile']
            if not trader_data.get('materials'):
                raise serializers.ValidationError({
                    "trader_profile": "Materials are required for Trader profile."
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create user with nested profile"""
        
        validated_data.pop('password2')
        mason_profile_data = validated_data.pop('mason_profile', None)
        trader_profile_data = validated_data.pop('trader_profile', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create role-specific profile
        if mason_profile_data and user.role == 'MASON':
            MasonProfile.objects.create(user=user, **mason_profile_data)
        
        if trader_profile_data and user.role == 'TRADER':
            TraderProfile.objects.create(user=user, **trader_profile_data)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    mason_profile = MasonProfileSerializer(required=False)
    trader_profile = TraderProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name', 'latitude', 'longitude', 'language',
            'mason_profile', 'trader_profile'
        ]
    
    def update(self, instance, validated_data):
        """Update user and nested profiles"""
        
        mason_profile_data = validated_data.pop('mason_profile', None)
        trader_profile_data = validated_data.pop('trader_profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update mason profile
        if mason_profile_data and hasattr(instance, 'mason_profile'):
            for attr, value in mason_profile_data.items():
                setattr(instance.mason_profile, attr, value)
            instance.mason_profile.save()
        
        # Update trader profile
        if trader_profile_data and hasattr(instance, 'trader_profile'):
            for attr, value in trader_profile_data.items():
                setattr(instance.trader_profile, attr, value)
            instance.trader_profile.save()
        
        return instance
