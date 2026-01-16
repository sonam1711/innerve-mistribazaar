from django.contrib import admin
from .models import Job, JobImage


class JobImageInline(admin.TabularInline):
    model = JobImage
    extra = 1


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'consumer', 'job_type', 'status', 'budget_min', 'budget_max', 'created_at')
    list_filter = ('job_type', 'status', 'created_at')
    search_fields = ('title', 'description', 'consumer__name')
    inlines = [JobImageInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(JobImage)
class JobImageAdmin(admin.ModelAdmin):
    list_display = ('job', 'caption', 'uploaded_at')
    search_fields = ('job__title', 'caption')
