"""
User models for Mistribazar
Defines User, ContractorProfile, TraderProfile, and MistriProfile
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class UserManager(BaseUserManager):
    """Custom user manager for phone-based authentication"""
    
    def create_user(self, phone, name, password=None, **extra_fields):
        if not phone:
            raise ValueError('Phone number is required')
        
        user = self.model(phone=phone, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with role-based access
    Roles: CONSUMER, CONTRACTOR, TRADER, MISTRI
    """
    
    class Role(models.TextChoices):
        CONSUMER = 'CONSUMER', 'Consumer'
        CONTRACTOR = 'CONTRACTOR', 'Contractor'
        TRADER = 'TRADER', 'Trader'
        MISTRI = 'MISTRI', 'Mistri'
    
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.CONSUMER)
    
    # Location (latitude, longitude)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Rating (average rating from jobs)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    
    language = models.CharField(max_length=50, default='English')
    
    # Auth fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['role']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.role}"


class ContractorProfile(models.Model):
    """
    Extended profile for Contractor users
    Handles large construction projects (no skills field)
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contractor_profile')
    
    # Business information
    company_name = models.CharField(max_length=255, blank=True)
    
    experience_years = models.PositiveIntegerField(default=0)
    
    # Pricing range (for bidding)
    min_project_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Minimum project value in local currency",
        null=True,
        blank=True
    )
    
    completed_projects = models.PositiveIntegerField(default=0)
    
    # Profile status
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contractor_profiles'
    
    def __str__(self):
        return f"Contractor: {self.user.name}"


class MistriProfile(models.Model):
    """
    Extended profile for Mistri users (skilled workers)
    Handles small jobs and repairs (has skills field)
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mistri_profile')
    
    # Skills (comma-separated or JSON field)
    skills = models.TextField(help_text="Comma-separated skills e.g., bricklaying, plastering, tiling, carpentry")
    
    # Pricing
    daily_rate = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Daily rate in local currency"
    )
    
    experience_years = models.PositiveIntegerField(default=0)
    
    # Availability dates
    available_dates = models.TextField(
        blank=True,
        help_text="JSON or comma-separated available date ranges"
    )
    
    completed_jobs = models.PositiveIntegerField(default=0)
    
    # Notification preferences
    sms_notifications = models.BooleanField(default=True, help_text="Receive SMS for nearby jobs")
    call_notifications = models.BooleanField(default=False, help_text="Receive calls for nearby jobs")
    
    # Profile status
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mistri_profiles'
    
    def __str__(self):
        return f"Mistri: {self.user.name}"


class TraderProfile(models.Model):
    """
    Extended profile for Trader users
    Stores trader/material supplier information
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trader_profile')
    
    # Materials they supply
    materials = models.TextField(help_text="Comma-separated materials e.g., cement, bricks, sand")
    
    # Delivery information
    delivery_radius_km = models.PositiveIntegerField(
        default=10,
        help_text="Delivery radius in kilometers"
    )
    
    avg_delivery_time = models.CharField(
        max_length=50,
        default="2-3 days",
        help_text="Average delivery time"
    )
    
    # Business information
    business_name = models.CharField(max_length=255, blank=True)
    completed_orders = models.PositiveIntegerField(default=0)
    
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trader_profiles'
    
    def __str__(self):
        return f"Trader: {self.user.name}"
