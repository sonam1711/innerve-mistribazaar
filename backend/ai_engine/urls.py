"""
URL configuration for AI engine
"""
from django.urls import path
from .views import (
    BudgetEstimateView, DirectBudgetEstimateView,
    RecommendProvidersView, VisualizeRoomView,
    VisualizationStylesView, CreateJobFromVisualizationView,
    HouseDesignView, Generate3DHouseView, Download3DHouseScriptView
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
    
    # House Designer (conversational)
    path('house-design/', HouseDesignView.as_view(), name='house-design'),
    
    # 3D House Designer with Blender (NEW - Gemini powered)
    path('3d-house/generate/', Generate3DHouseView.as_view(), name='3d-house-generate'),
    path('3d-house/download/<str:filename>/', Download3DHouseScriptView.as_view(), name='3d-house-download'),
]
