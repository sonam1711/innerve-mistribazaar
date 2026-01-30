"""
Views for Job management
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt
from .models import Job, JobImage
from .serializers import JobSerializer, JobListSerializer, JobDetailSerializer
from users.permissions import IsConsumer, IsJobOwner


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
    Create a new job (Consumer only)
    """
    
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsConsumer]
    
    def perform_create(self, serializer):
        serializer.save(consumer=self.request.user)


class JobListView(generics.ListAPIView):
    """
    List all jobs with filtering
    """
    
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Job.objects.all()
        user = self.request.user
        
        # Role-specific filters FIRST (most important)
        if user.role == 'CONSUMER':
            # Consumers should ALWAYS see only their own jobs
            queryset = queryset.filter(consumer=user)
            
            # Then apply optional filters
            status_filter = self.request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            job_type = self.request.query_params.get('job_type', None)
            if job_type:
                queryset = queryset.filter(job_type=job_type)
        
        elif user.role in ['MASON', 'TRADER']:
            # Show only OPEN jobs for providers
            queryset = queryset.filter(status='OPEN')
            
            # Get location from query params (live location) or fall back to user's stored location
            latitude = self.request.query_params.get('latitude')
            longitude = self.request.query_params.get('longitude')
            
            if latitude and longitude:
                try:
                    latitude = float(latitude)
                    longitude = float(longitude)
                except (ValueError, TypeError):
                    latitude = user.latitude
                    longitude = user.longitude
            else:
                latitude = user.latitude
                longitude = user.longitude
            
            # Filter by location if coordinates available
            if latitude and longitude:
                radius_km = self.request.query_params.get('radius', 50)  # Default 50km
                try:
                    radius_km = float(radius_km)
                except ValueError:
                    radius_km = 50
                
                # Filter jobs by distance (for production, use PostGIS)
                nearby_jobs = []
                for job in queryset:
                    # Skip jobs without valid location data
                    if not job.latitude or not job.longitude:
                        continue
                    
                    try:
                        distance = calculate_distance(
                            latitude, longitude,
                            job.latitude, job.longitude
                        )
                        if distance <= radius_km:
                            nearby_jobs.append(job.id)
                    except (ValueError, TypeError):
                        # Skip jobs with invalid coordinates
                        continue
                
                # Only show nearby jobs if any found, otherwise show empty list
                if nearby_jobs:
                    queryset = queryset.filter(id__in=nearby_jobs)
                else:
                    queryset = queryset.none()  # Return empty queryset
            # If no location available, show all open jobs (no location filter)
            
            # Apply optional filters
            job_type = self.request.query_params.get('job_type', None)
            if job_type:
                queryset = queryset.filter(job_type=job_type)
        
        return queryset.order_by('-created_at')


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific job
    """
    
    queryset = Job.objects.all()
    serializer_class = JobDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Only job owner can update or delete
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsJobOwner()]
        return [IsAuthenticated()]


class MyJobsView(generics.ListAPIView):
    """
    List jobs created by the current consumer
    """
    
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated, IsConsumer]
    
    def get_queryset(self):
        return Job.objects.filter(consumer=self.request.user).order_by('-created_at')


class NearbyJobsView(APIView):
    """
    Get jobs near the user's location
    For masons and traders
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get location from query params (live location) or fall back to user's stored location
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        
        # Convert to float if provided
        if latitude and longitude:
            try:
                latitude = float(latitude)
                longitude = float(longitude)
            except (ValueError, TypeError):
                latitude = None
                longitude = None
        
        # Fall back to user's stored location if not provided in query
        if not latitude or not longitude:
            latitude = user.latitude
            longitude = user.longitude
        
        # If still no location available, return message
        if not latitude or not longitude:
            return Response({
                'results': [],
                'message': 'Please update your location in profile to see nearby jobs'
            }, status=status.HTTP_200_OK)
        
        radius_km = request.query_params.get('radius', 50)
        try:
            radius_km = float(radius_km)
        except ValueError:
            radius_km = 50
        
        # Get open jobs
        jobs = Job.objects.filter(status='OPEN')
        
        # Calculate distances and filter
        nearby_jobs = []
        for job in jobs:
            # Skip jobs without valid location data
            if not job.latitude or not job.longitude:
                continue
            
            try:
                distance = calculate_distance(
                    latitude, longitude,
                    job.latitude, job.longitude
                )
                if distance <= radius_km:
                    job_data = JobListSerializer(job).data
                    job_data['distance_km'] = round(distance, 2)
                    nearby_jobs.append(job_data)
            except (ValueError, TypeError) as e:
                # Skip jobs with invalid coordinates
                continue
        
        # Sort by distance
        nearby_jobs.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'count': len(nearby_jobs),
            'results': nearby_jobs
        })


class JobStatusUpdateView(APIView):
    """
    Update job status
    Only job owner can update
    """
    
    permission_classes = [IsAuthenticated, IsConsumer]
    
    def patch(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, consumer=request.user)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        
        if new_status not in ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']:
            return Response({
                'error': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = new_status
        job.save()
        
        return Response({
            'message': 'Job status updated successfully',
            'job': JobDetailSerializer(job).data
        })
