"""
Bid models for Mistribazar
Defines bidding system
"""
from django.db import models
from django.core.validators import MinValueValidator
from users.models import User
from jobs.models import Job


class Bid(models.Model):
    """
    Bids submitted by masons/traders on jobs
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'
    
    id = models.BigAutoField(primary_key=True)
    
    # Job being bid on
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    
    # Bidder (mason or trader)
    bidder = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='bids_submitted',
        limit_choices_to={'role__in': ['MASON', 'TRADER']}
    )
    
    # Bid details
    bid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    estimated_days = models.PositiveIntegerField(
        help_text="Estimated days to complete the job"
    )
    
    message = models.TextField(
        blank=True,
        help_text="Additional message or proposal details"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bids'
        ordering = ['bid_amount', '-created_at']  # Sort by price, then newest
        unique_together = ['job', 'bidder']  # One bid per user per job
        indexes = [
            models.Index(fields=['job']),
            models.Index(fields=['bidder']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Bid by {self.bidder.name} on {self.job.title}: {self.bid_amount}"
