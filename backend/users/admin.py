from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, MasonProfile, TraderProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'name', 'role', 'rating', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('phone', 'name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {'fields': ('name', 'role', 'language')}),
        ('Location', {'fields': ('latitude', 'longitude')}),
        ('Stats', {'fields': ('rating',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(MasonProfile)
class MasonProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'daily_rate', 'experience_years', 'completed_jobs', 'is_verified')
    list_filter = ('is_verified', 'is_available')
    search_fields = ('user__name', 'skills')


@admin.register(TraderProfile)
class TraderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'delivery_radius_km', 'completed_orders', 'is_verified')
    list_filter = ('is_verified', 'is_available')
    search_fields = ('user__name', 'business_name', 'materials')
