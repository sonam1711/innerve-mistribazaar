"""
User views for Supabase-authenticated API
Handles profile management after Supabase authentication
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import User, WorkerProfile, TraderProfile, ConstructorProfile
from .serializers import (
    UserSerializer, UserUpdateSerializer, 
    ProfileCompletionSerializer,
    WorkerProfileSerializer, TraderProfileSerializer, ConstructorProfileSerializer
)


class ProfileCompletionView(APIView):
    """
    Complete user profile after Supabase authentication
    Called after OTP verification to set name, role, and profile details
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Check if profile already completed
        if user.name and user.role:
            return Response({
                'error': 'Profile already completed',
                'user': UserSerializer(user).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProfileCompletionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Update user basic info
        user.name = data.get('name')
        user.role = data.get('role')
        user.latitude = data.get('latitude')
        user.longitude = data.get('longitude')
        user.language = data.get('language', 'English')
        user.save()
        
        # Create role-specific profile
        if user.role == User.Role.WORKER and 'worker_profile' in data:
            WorkerProfile.objects.create(user=user, **data['worker_profile'])
        
        elif user.role == User.Role.TRADER and 'trader_profile' in data:
            TraderProfile.objects.create(user=user, **data['trader_profile'])
        
        elif user.role == User.Role.CONSTRUCTOR and 'constructor_profile' in data:
            ConstructorProfile.objects.create(user=user, **data['constructor_profile'])
        
        return Response({
            'message': 'Profile completed successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile
    GET: Retrieve current user's profile
    PUT/PATCH: Update current user's profile
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    """
    Get details of any user by ID
    Public endpoint for viewing other users' profiles
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserListView(generics.ListAPIView):
    """
    List users with optional filtering
    Query params: role, is_available
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role.upper())
        
        # Filter by availability (for workers/constructors/traders)
        is_available = self.request.query_params.get('is_available')
        if is_available == 'true':
            queryset = queryset.filter(
                models.Q(worker_profile__is_available=True) |
                models.Q(constructor_profile__is_available=True) |
                models.Q(trader_profile__is_available=True)
            )
        
        return queryset


class WorkerProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    Get or update worker profile for current user
    Only accessible to users with WORKER role
    """
    serializer_class = WorkerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != User.Role.WORKER:
            return Response({
                'error': 'Only workers can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get or create worker profile
        profile, created = WorkerProfile.objects.get_or_create(user=user)
        return profile


class TraderProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    Get or update trader profile for current user
    Only accessible to users with TRADER role
    """
    serializer_class = TraderProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != User.Role.TRADER:
            return Response({
                'error': 'Only traders can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get or create trader profile
        profile, created = TraderProfile.objects.get_or_create(user=user)
        return profile


class ConstructorProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    Get or update constructor profile for current user
    Only accessible to users with CONSTRUCTOR role
    """
    serializer_class = ConstructorProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != User.Role.CONSTRUCTOR:
            return Response({
                'error': 'Only constructors can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get or create constructor profile
        profile, created = ConstructorProfile.objects.get_or_create(user=user)
        return profile
