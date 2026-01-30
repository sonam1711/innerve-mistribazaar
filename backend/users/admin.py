from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, WorkerProfile, TraderProfile, ConstructorProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'role', 'phone', 'rating', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'name', 'phone', 'supabase_id')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'supabase_id')}),
        ('Personal Info', {'fields': ('name', 'phone', 'role', 'language')}),
        ('Location', {'fields': ('latitude', 'longitude')}),
        ('Stats', {'fields': ('rating',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'phone', 'supabase_id'),
        }),
    )
    
    readonly_fields = ('supabase_id', 'rating', 'created_at')


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'daily_rate', 'experience_years', 'completed_jobs', 'is_verified')
    list_filter = ('is_verified', 'is_available')
    search_fields = ('user__name', 'skills')
    readonly_fields = ('completed_jobs',)


@admin.register(TraderProfile)
class TraderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'delivery_radius_km', 'completed_orders', 'is_verified')
    list_filter = ('is_verified', 'is_available')
    search_fields = ('user__name', 'business_name', 'materials')
    readonly_fields = ('completed_orders',)


@admin.register(ConstructorProfile)
class ConstructorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'team_size', 'experience_years', 'completed_projects', 'is_verified')
    list_filter = ('is_verified', 'is_available')
    search_fields = ('user__name', 'company_name', 'specializations')
    readonly_fields = ('completed_projects',)
