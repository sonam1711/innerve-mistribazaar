"""
Room Visualizer - AI Image-to-Image Generation
Uses external API for visualization with file upload support
"""
import requests
import base64
import io
from PIL import Image
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile


class RoomVisualizer:
    """
    AI-powered room visualization
    Supports both URL and file upload for images
    """
    
    @staticmethod
    def process_image_file(image_file):
        """
        Process uploaded image file to base64
        
        Args:
            image_file: Django UploadedFile object
        
        Returns:
            base64 encoded image string
        """
        try:
            # Open image with PIL
            img = Image.open(image_file)
            
            # Resize if too large (max 1024x1024)
            max_size = 1024
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save to bytes
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            buffer.seek(0)
            
            # Encode to base64
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            return image_base64
        
        except Exception as e:
            raise ValueError(f"Failed to process image: {str(e)}")
    
    @staticmethod
    def generate_visualization(image_input, prompt, style='realistic', is_file=False):
        """
        Generate room visualization using AI
        
        Args:
            image_input: Either URL string or base64 encoded image
            prompt: Text description of desired changes
            style: Visualization style (realistic, modern, traditional)
            is_file: Whether image_input is a file (base64) or URL
        
        Returns:
            dict with generated_image_url/base64, status, message
        """
        
        api_url = getattr(settings, 'IMAGE_TO_IMAGE_API_URL', None)
        api_key = getattr(settings, 'IMAGE_TO_IMAGE_API_KEY', None)
        
        if not api_url or not api_key:
            # Return mock response for development
            return {
                'status': 'success',
                'message': 'Visualization generated (mock mode - API not configured)',
                'original_image': image_input if not is_file else 'data:image/jpeg;base64,' + image_input[:50] + '...',
                'transformed_image': image_input if not is_file else 'data:image/jpeg;base64,' + image_input[:50] + '...',
                'prompt': prompt,
                'style': style,
                'note': 'To enable real AI generation, configure IMAGE_TO_IMAGE_API_URL and IMAGE_TO_IMAGE_API_KEY in settings'
            }
        
        # Construct full prompt
        full_prompt = f"{prompt}. Style: {style}. Professional interior design visualization."
        
        try:
            # Example API call structure (adjust based on actual API)
            if is_file:
                payload = {
                    'image': image_input,  # base64 encoded
                    'prompt': full_prompt,
                    'style': style,
                    'strength': 0.75,  # How much to change (0-1)
                }
            else:
                payload = {
                    'image_url': image_input,
                    'prompt': full_prompt,
                    'style': style,
                    'strength': 0.75,
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
            
            # For MVP, return mock response with original image
            # Replace this with actual API call
            if is_file:
                return {
                    'status': 'success',
                    'generated_image': 'data:image/jpeg;base64,' + image_input,
                    'original_image': 'data:image/jpeg;base64,' + image_input,
                    'prompt': full_prompt,
                    'style': style,
                    'message': 'Visualization generated successfully (mock mode)',
                    'disclaimer': 'This is an indicative visualization. Actual results may vary.',
                    'note': 'Configure IMAGE_TO_IMAGE_API_URL and IMAGE_TO_IMAGE_API_KEY for real AI generation'
                }
            else:
                return {
                    'status': 'success',
                    'generated_image_url': image_input,
                    'original_image_url': image_input,
                    'prompt': full_prompt,
                    'style': style,
                    'message': 'Visualization generated successfully (mock mode)',
                    'disclaimer': 'This is an indicative visualization. Actual results may vary.',
                    'note': 'Configure IMAGE_TO_IMAGE_API_URL and IMAGE_TO_IMAGE_API_KEY for real AI generation'
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
