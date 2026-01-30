"""
Rating models for Mistribazar
Defines rating and review system
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from jobs.models import Job


class Rating(models.Model):
    """
    Ratings given after job completion
    Consumer rates the contractor/mistri/trader
    """
    
    id = models.BigAutoField(primary_key=True)
    
    # Job that was completed
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='rating')
    
    # Who is being rated (contractor, mistri, or trader)
    rated_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ratings_received',
        limit_choices_to={'role__in': ['CONTRACTOR', 'MISTRI', 'TRADER']}
    )
    
    # Who gave the rating (consumer)
    rated_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ratings_given',
        limit_choices_to={'role': 'CONSUMER'}
    )
    
    # Rating (1-5)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Review text
    review = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ratings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['rated_to']),
            models.Index(fields=['job']),
        ]
    
    def __str__(self):
        return f"Rating for {self.rated_to.name}: {self.rating}/5"
    
    def save(self, *args, **kwargs):
        """
        Override save to update user's average rating
        """
        super().save(*args, **kwargs)
        
        # Calculate average rating for the user
        from django.db.models import Avg
        avg_rating = Rating.objects.filter(rated_to=self.rated_to).aggregate(Avg('rating'))['rating__avg']
        
        if avg_rating:
            self.rated_to.rating = round(avg_rating, 2)
            self.rated_to.save()
