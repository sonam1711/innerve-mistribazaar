from django.contrib import admin
from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('job', 'rated_to', 'rated_by', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('job__title', 'rated_to__name', 'rated_by__name', 'review')
    readonly_fields = ('created_at', 'updated_at')
