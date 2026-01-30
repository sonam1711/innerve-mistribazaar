"""
Job models for Mistribazar
Defines Job postings
"""
from django.db import models
from django.core.validators import MinValueValidator
from users.models import User


class Job(models.Model):
    """
    Job posting by customers
    For constructor jobs (large projects) or worker jobs (freelance work)
    """
    
    class JobType(models.TextChoices):
        CONSTRUCTOR_JOB = 'CONSTRUCTOR_JOB', 'Constructor Job (Large Project)'
        WORKER_JOB = 'WORKER_JOB', 'Worker Job (Freelance Work)'
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    id = models.BigAutoField(primary_key=True)
    
    # Customer who posted the job
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='jobs_posted',
        limit_choices_to={'role': 'CUSTOMER'}
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
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['status']),
            models.Index(fields=['job_type']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.customer.name}"


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
