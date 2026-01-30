"""
URL configuration for AI engine
"""
from django.urls import path
from .views import (
    BudgetEstimateView, DirectBudgetEstimateView,
    RecommendProvidersView, VisualizeRoomView,
    VisualizationStylesView, CreateJobFromVisualizationView,
    HouseDesignView
)

urlpatterns = [
    # Budget estimation
    path('budget/conversation/', BudgetEstimateView.as_view(), name='budget-conversation'),
    path('budget/estimate/', DirectBudgetEstimateView.as_view(), name='budget-estimate'),
    
    # Recommendations
    path('recommend/<int:job_id>/', RecommendProvidersView.as_view(), name='recommend-providers'),
    
    # Room visualization
    path('visualize/', VisualizeRoomView.as_view(), name='visualize-room'),
    path('visualize/styles/', VisualizationStylesView.as_view(), name='visualization-styles'),
    path('visualize/create-job/', CreateJobFromVisualizationView.as_view(), name='create-job-from-visualization'),
    
    # House Designer (NEW)
    path('house-design/', HouseDesignView.as_view(), name='house-design'),
]
