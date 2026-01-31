"""
AI Engine Views - API endpoints for AI features
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import FileResponse, Http404
import os
from .budget_estimator import BudgetEstimator
from .recommender import Recommender
from .room_visualizer import RoomVisualizer
from .house_designer import HouseDesigner
from .blender_script_generator import get_blender_generator
from bids.models import Bid
from jobs.models import Job


class BudgetEstimateView(APIView):
    """
    Conversational budget estimation endpoint
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle budget estimation request
        
        Expects:
        - step: Current step number
        - data: Dictionary with collected data
        """
        
        step = request.data.get('step', 1)
        data = request.data.get('data', {})
        
        # Get next question or final estimate
        result = BudgetEstimator.conversational_flow(step, data)
        
        return Response(result, status=status.HTTP_200_OK)
    
    def get(self, request):
        """
        Get initial question to start flow
        """
        result = BudgetEstimator.conversational_flow(1, {})
        return Response(result, status=status.HTTP_200_OK)


class DirectBudgetEstimateView(APIView):
    """
    Direct budget estimation (skip conversational flow)
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Calculate budget estimate directly
        
        Expects:
        - work_type
        - area_sqft
        - quality (optional)
        - city_tier (optional)
        - urgency (optional)
        """
        
        work_type = request.data.get('work_type')
        area_sqft = request.data.get('area_sqft')
        
        if not work_type or not area_sqft:
            return Response({
                'error': 'work_type and area_sqft are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            area_sqft = float(area_sqft)
        except ValueError:
            return Response({
                'error': 'area_sqft must be a number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        quality = request.data.get('quality', 'standard')
        city_tier = request.data.get('city_tier', 'tier2')
        urgency = request.data.get('urgency', 'normal')
        
        estimate = BudgetEstimator.estimate_budget(
            work_type=work_type,
            area_sqft=area_sqft,
            quality=quality,
            city_tier=city_tier,
            urgency=urgency
        )
        
        return Response(estimate, status=status.HTTP_200_OK)


class RecommendProvidersView(APIView):
    """
    Get recommended providers for a job based on bids
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, job_id):
        """
        Get scored and ranked providers for a job
        """
        
        try:
            job = Job.objects.get(pk=job_id, consumer=request.user)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all bids for this job
        bids = Bid.objects.filter(job=job, status='PENDING')
        
        if not bids:
            return Response({
                'message': 'No bids available yet',
                'recommendations': []
            }, status=status.HTTP_200_OK)
        
        # Score and rank providers
        recommendations = Recommender.score_providers(bids, job)
        
        # Format response
        formatted_recommendations = []
        for rec in recommendations:
            from bids.serializers import BidSerializer
            formatted_recommendations.append({
                'bid': BidSerializer(rec['bid']).data,
                'score': rec['score'],
                'scores': {
                    'rating': rec['rating_score'],
                    'price': rec['price_score'],
                    'distance': rec['distance_score'],
                    'availability': rec['availability_score'],
                },
                'distance_km': rec['distance_km'],
                'reason': rec['reason']
            })
        
        return Response({
            'job_id': job_id,
            'total_bids': len(recommendations),
            'recommendations': formatted_recommendations
        }, status=status.HTTP_200_OK)


class VisualizeRoomView(APIView):
    """
    Generate room visualization using AI
    Supports both URL and file upload
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Generate visualization
        
        Expects:
        - image_url: URL of current room image (OR)
        - image_file: Uploaded image file
        - prompt: Description of desired changes
        - style: Visualization style (optional)
        """
        
        image_url = request.data.get('image_url')
        image_file = request.FILES.get('image_file')
        prompt = request.data.get('prompt')
        style = request.data.get('style', 'realistic')
        
        # Must have either URL or file
        if not (image_url or image_file) or not prompt:
            return Response({
                'error': 'Either image_url or image_file, and prompt are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate prompt
        is_valid, message = RoomVisualizer.validate_prompt(prompt)
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process based on input type
        try:
            if image_file:
                # Process uploaded file
                image_base64 = RoomVisualizer.process_image_file(image_file)
                result = RoomVisualizer.generate_visualization(
                    image_base64, prompt, style, is_file=True
                )
            else:
                # Use URL
                result = RoomVisualizer.generate_visualization(
                    image_url, prompt, style, is_file=False
                )
            
            if result['status'] == 'error':
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to process request: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VisualizationStylesView(APIView):
    """
    Get supported visualization styles
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        styles = RoomVisualizer.get_supported_styles()
        return Response({
            'styles': styles
        }, status=status.HTTP_200_OK)


class CreateJobFromVisualizationView(APIView):
    """
    Convert visualization into a job request
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Create job from visualization
        
        Expects:
        - visualization_data: Visualization details
        - location: Dict with latitude, longitude, address
        - budget_min: Minimum budget
        - budget_max: Maximum budget
        """
        
        visualization_data = request.data.get('visualization_data')
        location = request.data.get('location')
        budget_min = request.data.get('budget_min')
        budget_max = request.data.get('budget_max')
        
        if not all([visualization_data, location, budget_min, budget_max]):
            return Response({
                'error': 'visualization_data, location, and budget are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create job
        job_data = RoomVisualizer.create_job_from_visualization(
            visualization_data, request.user, location
        )
        
        # Add budget
        job_data['budget_min'] = budget_min
        job_data['budget_max'] = budget_max
        
        from jobs.serializers import JobSerializer
        serializer = JobSerializer(data=job_data, context={'request': request})
        
        if serializer.is_valid():
            job = serializer.save(consumer=request.user)
            return Response({
                'message': 'Job created successfully from visualization',
                'job': JobSerializer(job).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HouseDesignView(APIView):
    """
    AI House Designer - Conversational house design generation
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle house design conversation
        
        Expects:
        - step: Current step number or 'complete'
        - data: Dictionary with collected data
        """
        
        try:
            step = request.data.get('step', 1)
            data = request.data.get('data', {})
            
            # Validate input
            if not isinstance(data, dict):
                return Response({
                    'success': False,
                    'error': 'Invalid data format. Expected dictionary.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get next question or final design
            result = HouseDesigner.conversational_flow(step, data)
            
            # Check if there was an error
            if isinstance(result, dict) and result.get('success') == False:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to process answer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """
        Get initial question to start house design flow
        """
        result = HouseDesigner.conversational_flow(1, {})
        return Response(result, status=status.HTTP_200_OK)


class Generate3DHouseView(APIView):
    """
    Generate 3D house model using Gemini API
    Returns Blender Python script based on 12-question survey
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Generate Blender Python script from house survey data
        
        Expects JSON with 12 survey answers:
        {
            "plot_length": 20,
            "plot_width": 15,
            "num_floors": 2,
            "num_bedrooms": 3,
            "num_bathrooms": 2,
            "kitchen_type": "Modern open kitchen",
            "living_areas": ["Living room", "Dining room"],
            "outdoor_spaces": ["Balcony", "Terrace"],
            "parking_spaces": 2,
            "architectural_style": "Modern",
            "special_features": ["Solar panels", "Rainwater harvesting"],
            "roof_type": "Flat",
            "additional_requirements": "Vastu compliant layout"
        }
        
        Returns:
        {
            "success": true,
            "script": "... Blender Python code ...",
            "filename": "house_model_abc123.py",
            "download_url": "/api/ai/3d-house/download/house_model_abc123.py"
        }
        """
        try:
            # Validate required fields
            required_fields = [
                'plot_length', 'plot_width', 'num_floors', 
                'num_bedrooms', 'num_bathrooms', 'kitchen_type',
                'architectural_style'
            ]
            
            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                return Response({
                    'success': False,
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate Blender script using Gemini
            house_data = request.data
            
            # Get the generator instance (lazy initialization)
            blender_gen = get_blender_generator()
            script = blender_gen.generate_script(house_data)
            
            # Save the script
            filename = f"house_model_{request.user.id}_{house_data.get('plot_length')}x{house_data.get('plot_width')}.py"
            file_path = blender_gen.save_script(script, filename)
            
            # Return script and download URL
            return Response({
                'success': True,
                'script': script,
                'filename': os.path.basename(file_path),
                'download_url': f'/api/ai/3d-house/download/{os.path.basename(file_path)}',
                'message': 'Blender script generated successfully'
            }, status=status.HTTP_200_OK)
        
        except ValueError as e:
            import traceback
            traceback.print_exc()  # Print full traceback to console
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            import traceback
            traceback.print_exc()  # Print full traceback to console
            return Response({
                'success': False,
                'error': f'Failed to generate 3D model: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Download3DHouseScriptView(APIView):
    """
    Download generated Blender script
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, filename):
        """
        Download a generated Blender Python script
        """
        try:
            from django.conf import settings
            
            # Sanitize filename to prevent directory traversal
            filename = os.path.basename(filename)
            
            # Ensure it's a .py file
            if not filename.endswith('.py'):
                raise Http404("Invalid file type")
            
            # Construct file path
            file_path = os.path.join(settings.MEDIA_ROOT, 'blender_scripts', filename)
            
            # Check if file exists
            if not os.path.exists(file_path):
                raise Http404("File not found")
            
            # Return file for download
            response = FileResponse(
                open(file_path, 'rb'),
                content_type='text/x-python'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
        
        except Http404:
            raise
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to download file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

