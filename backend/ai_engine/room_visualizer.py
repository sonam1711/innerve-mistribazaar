"""
Room Visualizer - AI Image-to-Image Generation
Uses external API for visualization
"""
import requests
from django.conf import settings


class RoomVisualizer:
    """
    AI-powered room visualization
    Sends image + prompt to external image-to-image API
    """
    
    @staticmethod
    def generate_visualization(image_url, prompt, style='realistic'):
        """
        Generate room visualization using AI
        
        Args:
            image_url: URL of the current room image
            prompt: Text description of desired changes
            style: Visualization style (realistic, modern, traditional)
        
        Returns:
            dict with generated_image_url, status, message
        """
        
        api_url = settings.IMAGE_TO_IMAGE_API_URL
        api_key = settings.IMAGE_TO_IMAGE_API_KEY
        
        if not api_url or not api_key:
            return {
                'status': 'error',
                'message': 'Image generation API is not configured. Please add API credentials.'
            }
        
        # Construct full prompt
        full_prompt = f"{prompt}. Style: {style}. Professional interior design visualization."
        
        try:
            # Example API call structure (adjust based on actual API)
            payload = {
                'image_url': image_url,
                'prompt': full_prompt,
                'style': style,
                'strength': 0.75,  # How much to change (0-1)
            }
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            # Make API request
            # NOTE: This is a placeholder - adjust based on actual API
            # Common APIs: Stability AI, Replicate, OpenAI DALL-E, etc.
            
            """
            Example for Stability AI:
            response = requests.post(
                'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image',
                headers=headers,
                json=payload,
                timeout=60
            )
            """
            
            # For MVP, return mock response
            # Replace this with actual API call
            return {
                'status': 'success',
                'generated_image_url': image_url,  # Placeholder - replace with actual generated URL
                'original_image_url': image_url,
                'prompt': full_prompt,
                'message': 'Visualization generated successfully',
                'disclaimer': 'This is an indicative visualization. Actual results may vary.',
                'note': 'Please configure IMAGE_TO_IMAGE_API settings for real image generation'
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'status': 'error',
                'message': f'Failed to generate visualization: {str(e)}'
            }
    
    @staticmethod
    def get_supported_styles():
        """
        Return list of supported visualization styles
        """
        return [
            {'value': 'realistic', 'label': 'Realistic'},
            {'value': 'modern', 'label': 'Modern'},
            {'value': 'traditional', 'label': 'Traditional'},
            {'value': 'minimalist', 'label': 'Minimalist'},
            {'value': 'industrial', 'label': 'Industrial'},
            {'value': 'contemporary', 'label': 'Contemporary'},
        ]
    
    @staticmethod
    def validate_prompt(prompt):
        """
        Validate and sanitize user prompt
        """
        if not prompt or len(prompt.strip()) < 10:
            return False, "Prompt must be at least 10 characters long"
        
        if len(prompt) > 500:
            return False, "Prompt must be less than 500 characters"
        
        # Basic sanitization (remove harmful content)
        blocked_words = ['nsfw', 'nude', 'explicit']
        prompt_lower = prompt.lower()
        
        for word in blocked_words:
            if word in prompt_lower:
                return False, "Prompt contains inappropriate content"
        
        return True, "Valid prompt"
    
    @staticmethod
    def create_job_from_visualization(visualization_data, user, location):
        """
        Convert a visualization into a job request
        
        Args:
            visualization_data: Dict with visualization details
            user: User object (consumer)
            location: Dict with latitude, longitude, address
        
        Returns:
            dict with job details ready for creation
        """
        return {
            'consumer': user,
            'job_type': 'RENOVATION',
            'title': f"Room Renovation - {visualization_data.get('prompt', 'As Visualized')[:50]}",
            'description': f"Please renovate the room as shown in the visualization.\n\nRequirements: {visualization_data.get('prompt', '')}",
            'latitude': location.get('latitude'),
            'longitude': location.get('longitude'),
            'address': location.get('address', ''),
            'status': 'OPEN',
            # Budget can be estimated using BudgetEstimator
            'images': [
                visualization_data.get('original_image_url'),
                visualization_data.get('generated_image_url')
            ]
        }
