"""
Views for Job management
Updated for simplified job system (no bidding)
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt
from .models import Job, JobImage
from .serializers import (
    JobSerializer, JobListSerializer, 
    JobDetailSerializer, JobCreateSerializer
)


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates in kilometers
    Using Haversine formula
    """
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c  # Radius of earth in kilometers
    
    return km


class JobCreateView(generics.CreateAPIView):
    """
    Create a new job (Customer only)
    """
    serializer_class = JobCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only customers can create jobs
        if request.user.role != 'CUSTOMER':
            return Response({
                'error': 'Only customers can create jobs'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        
        return Response({
            'message': 'Job created successfully',
            'job': JobDetailSerializer(job).data
        }, status=status.HTTP_201_CREATED)


class JobListView(generics.ListAPIView):
    """
    List all jobs with filtering
    Query params: status, job_type, my_jobs, radius
    """
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Job.objects.all()
        user = self.request.user
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status.upper())
        
        # Filter by job type
        job_type = self.request.query_params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type.upper())
        
        # Filter for customer's own jobs
        my_jobs = self.request.query_params.get('my_jobs')
        if my_jobs and user.role == 'CUSTOMER':
            queryset = queryset.filter(customer=user)
        
        # For workers/constructors: only show open jobs
        elif user.role in ['WORKER', 'CONSTRUCTOR']:
            queryset = queryset.filter(status='OPEN')
            
            # Filter by job type based on role
            if user.role == 'WORKER':
                queryset = queryset.filter(job_type='WORKER_JOB')
            elif user.role == 'CONSTRUCTOR':
                queryset = queryset.filter(job_type='CONSTRUCTOR_JOB')
            
            # Filter by location if user has coordinates
            if user.latitude and user.longitude:
                radius_km = self.request.query_params.get('radius', 50)
                try:
                    radius_km = float(radius_km)
                except ValueError:
                    radius_km = 50
                
                # Filter nearby jobs
                nearby_job_ids = []
                for job in queryset:
                    distance = calculate_distance(
                        user.latitude, user.longitude,
                        job.latitude, job.longitude
                    )
                    if distance <= radius_km:
                        nearby_job_ids.append(job.id)
                
                queryset = queryset.filter(id__in=nearby_job_ids)
        
        return queryset.order_by('-created_at')


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific job
    Only job owner can update/delete
    """
    queryset = Job.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateSerializer
        return JobDetailSerializer
    
    def update(self, request, *args, **kwargs):
        job = self.get_object()
        
        # Only job owner can update
        if job.customer != request.user:
            return Response({
                'error': 'You do not have permission to update this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        
        # Only job owner can delete
        if job.customer != request.user:
            return Response({
                'error': 'You do not have permission to delete this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)


class MyJobsView(generics.ListAPIView):
    """
    List jobs created by the current customer
    """
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role != 'CUSTOMER':
            return Job.objects.none()
        
        return Job.objects.filter(customer=user).order_by('-created_at')


class NearbyJobsView(APIView):
    """
    Get jobs near the user's location
    For workers and constructors
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Only workers and constructors can access
        if user.role not in ['WORKER', 'CONSTRUCTOR']:
            return Response({
                'error': 'This endpoint is only for workers and constructors'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has location
        if not user.latitude or not user.longitude:
            return Response({
                'results': [],
                'message': 'Please update your location in profile to see nearby jobs'
            }, status=status.HTTP_200_OK)
        
        radius_km = request.query_params.get('radius', 50)
        try:
            radius_km = float(radius_km)
        except ValueError:
            radius_km = 50
        
        # Get open jobs based on user role
        jobs = Job.objects.filter(status='OPEN')
        if user.role == 'WORKER':
            jobs = jobs.filter(job_type='WORKER_JOB')
        elif user.role == 'CONSTRUCTOR':
            jobs = jobs.filter(job_type='CONSTRUCTOR_JOB')
        
        # Calculate distances and filter
        nearby_jobs = []
        for job in jobs:
            distance = calculate_distance(
                user.latitude, user.longitude,
                job.latitude, job.longitude
            )
            if distance <= radius_km:
                job_data = JobListSerializer(job).data
                job_data['distance_km'] = round(distance, 2)
                nearby_jobs.append(job_data)
        
        # Sort by distance
        nearby_jobs.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'count': len(nearby_jobs),
            'jobs': nearby_jobs
        })


class JobStatusUpdateView(APIView):
    """
    Update job status
    Only job owner can update
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Only job owner can update status
        if job.customer != request.user:
            return Response({
                'error': 'You do not have permission to update this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        
        if new_status not in ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']:
            return Response({
                'error': 'Invalid status. Must be OPEN, IN_PROGRESS, COMPLETED, or CANCELLED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = new_status
        job.save()
        
        return Response({
            'message': 'Job status updated successfully',
            'job': JobDetailSerializer(job).data
        })
