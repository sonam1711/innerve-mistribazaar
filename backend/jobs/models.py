"""
Job models for Mistribazar
Defines Job postings
"""
from django.db import models
from django.core.validators import MinValueValidator
from users.models import User


class Job(models.Model):
    """
    Job posting by consumers
    Can be bid on by masons and traders
    """
    
    class JobType(models.TextChoices):
        REPAIR = 'REPAIR', 'Repair'
        CONSTRUCTION = 'CONSTRUCTION', 'Construction'
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open for Bidding'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    id = models.BigAutoField(primary_key=True)
    
    # Consumer who posted the job
    consumer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='jobs_posted',
        limit_choices_to={'role': 'CONSUMER'}
    )
    
    # Job details
    job_type = models.CharField(max_length=20, choices=JobType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Budget range
    budget_min = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    budget_max = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Selected provider (mason/trader who won the bid)
    selected_provider = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='jobs_won'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['consumer']),
            models.Index(fields=['status']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.consumer.name}"


class JobImage(models.Model):
    """
    Images attached to a job
    Supports multiple images per job
    """
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'job_images'
        ordering = ['uploaded_at']
    
    def __str__(self):
        return f"Image for {self.job.title}"
