"""
AI Engine Views - API endpoints for AI features
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .budget_estimator import BudgetEstimator
from .recommender import Recommender
from .room_visualizer import RoomVisualizer
from .house_designer import HouseDesigner
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

