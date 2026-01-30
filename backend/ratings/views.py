"""
Views for Rating management
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Rating
from .serializers import RatingSerializer, RatingListSerializer
from users.permissions import IsConsumer


class RatingCreateView(generics.CreateAPIView):
    """
    Create a rating (Consumer only, after job completion)
    """
    
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated, IsConsumer]
    
    def perform_create(self, serializer):
        serializer.save(rated_by=self.request.user)


class RatingListView(generics.ListAPIView):
    """
    List ratings
    """
    
    serializer_class = RatingListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by rated user
        rated_to_id = self.request.query_params.get('rated_to', None)
        if rated_to_id:
            return Rating.objects.filter(rated_to_id=rated_to_id).order_by('-created_at')
        
        # Show ratings given by current user
        return Rating.objects.filter(rated_by=user).order_by('-created_at')


class UserRatingsView(generics.ListAPIView):
    """
    Get all ratings for a specific user (mason/trader)
    """
    
    serializer_class = RatingListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Rating.objects.filter(rated_to_id=user_id).order_by('-created_at')


class RatingDetailView(generics.RetrieveAPIView):
    """
    Get a specific rating
    """
    
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
