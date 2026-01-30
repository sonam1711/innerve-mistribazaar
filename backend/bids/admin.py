from django.contrib import admin
from .models import Bid


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('job', 'bidder', 'bid_amount', 'estimated_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('job__title', 'bidder__name')
    readonly_fields = ('created_at', 'updated_at')
