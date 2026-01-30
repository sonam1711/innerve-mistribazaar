"""
Blender Script Generator using Gemini API
Generates bpy (Blender Python) scripts for 3D house models
"""
import re
import os
import logging
from typing import Dict, Optional
from django.conf import settings
import google.generativeai as genai


logger = logging.getLogger(__name__)


class BlenderScriptGenerator:
    """
    Generate Blender Python scripts using Gemini API
    """
    
    SYSTEM_PROMPT = """You are a Blender Python (bpy) script generator. Your ONLY job is to generate valid, executable Python code for Blender.

CRITICAL RULES:
1. Return ONLY Python code - NO explanations, NO markdown, NO conversational text
2. Do NOT wrap code in ```python``` blocks or any other formatting
3. Start directly with import statements
4. The script must be completely self-contained and executable in Blender

REQUIRED SCRIPT STRUCTURE:
1. Import bpy and math at the top
2. Clear the default scene: bpy.ops.object.select_all(action='SELECT') and bpy.ops.object.delete()
3. Use bpy.ops.mesh.primitive_cube_add() for walls
4. Use bpy.ops.mesh.primitive_plane_add() for floors
5. Use standard units (meters)
6. Add comments for each major section
7. Set camera and lighting for good visualization

SCRIPT TEMPLATE TO FOLLOW:
import bpy
import math

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create floor
bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Floor"

# Create walls (example)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
wall = bpy.context.active_object
wall.scale = (10, 0.2, 3)

# Add camera
bpy.ops.object.camera_add(location=(15, -15, 10))
camera = bpy.context.active_object
camera.rotation_euler = (math.radians(60), 0, math.radians(45))
bpy.context.scene.camera = camera

# Add lighting
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))

Generate a script following this structure based on user requirements."""
    
    def __init__(self):
        """Initialize Gemini API"""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            raise ValueError("GEMINI_API_KEY not configured in settings")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_script(self, house_data: Dict) -> str:
        """
        Generate Blender Python script based on house requirements
        
        Args:
            house_data: Dictionary containing 12 survey answers
        
        Returns:
            str: Valid Blender Python script
        """
        try:
            # Format user requirements into a prompt
            user_prompt = self._format_user_prompt(house_data)
            
            # Combine system prompt and user prompt
            full_prompt = f"{self.SYSTEM_PROMPT}\n\nUSER REQUIREMENTS:\n{user_prompt}\n\nGenerate the Python script now:"
            
            # Call Gemini API
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': 0.4,  # Lower temperature for more deterministic code
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 4096,
                }
            )
            
            # Extract and sanitize the script
            script = response.text
            sanitized_script = self._sanitize_script(script)
            
            # Validate basic syntax
            if not self._validate_script(sanitized_script):
                raise ValueError("Generated script failed validation")
            
            logger.info("Successfully generated Blender script")
            return sanitized_script
        
        except Exception as e:
            logger.error(f"Error generating Blender script: {str(e)}")
            raise
    
    def _format_user_prompt(self, house_data: Dict) -> str:
        """Format house data into a descriptive prompt"""
        prompt_parts = []
        
        # Question 1: Plot dimensions
        if 'plot_length' in house_data and 'plot_width' in house_data:
            prompt_parts.append(f"Plot size: {house_data['plot_length']}m x {house_data['plot_width']}m")
        
        # Question 2: Number of floors
        if 'num_floors' in house_data:
            prompt_parts.append(f"Number of floors: {house_data['num_floors']}")
        
        # Question 3: Bedrooms
        if 'num_bedrooms' in house_data:
            prompt_parts.append(f"Bedrooms: {house_data['num_bedrooms']}")
        
        # Question 4: Bathrooms
        if 'num_bathrooms' in house_data:
            prompt_parts.append(f"Bathrooms: {house_data['num_bathrooms']}")
        
        # Question 5: Kitchen type
        if 'kitchen_type' in house_data:
            prompt_parts.append(f"Kitchen: {house_data['kitchen_type']}")
        
        # Question 6: Living areas
        if 'living_areas' in house_data:
            prompt_parts.append(f"Living areas: {', '.join(house_data['living_areas'])}")
        
        # Question 7: Outdoor spaces
        if 'outdoor_spaces' in house_data:
            prompt_parts.append(f"Outdoor spaces: {', '.join(house_data['outdoor_spaces'])}")
        
        # Question 8: Parking
        if 'parking_spaces' in house_data:
            prompt_parts.append(f"Parking spaces: {house_data['parking_spaces']}")
        
        # Question 9: Architectural style
        if 'architectural_style' in house_data:
            prompt_parts.append(f"Architectural style: {house_data['architectural_style']}")
        
        # Question 10: Special features
        if 'special_features' in house_data:
            features = house_data['special_features']
            if features:
                prompt_parts.append(f"Special features: {', '.join(features)}")
        
        # Question 11: Roof type
        if 'roof_type' in house_data:
            prompt_parts.append(f"Roof type: {house_data['roof_type']}")
        
        # Question 12: Additional requirements
        if 'additional_requirements' in house_data and house_data['additional_requirements']:
            prompt_parts.append(f"Additional requirements: {house_data['additional_requirements']}")
        
        return "\n".join(prompt_parts)
    
    def _sanitize_script(self, script: str) -> str:
        """
        Sanitize the generated script to ensure it's valid Python
        Remove markdown formatting, conversational text, etc.
        """
        # Remove markdown code blocks if present
        script = re.sub(r'^```python\s*', '', script, flags=re.MULTILINE)
        script = re.sub(r'^```\s*$', '', script, flags=re.MULTILINE)
        script = re.sub(r'```', '', script)
        
        # Remove common conversational prefixes
        conversational_patterns = [
            r'^Here is (?:the |your )?.*?script:?\s*\n',
            r'^Here\'s (?:the |your )?.*?script:?\s*\n',
            r'^This is (?:the |your )?.*?script:?\s*\n',
            r'^Below is (?:the |your )?.*?script:?\s*\n',
        ]
        
        for pattern in conversational_patterns:
            script = re.sub(pattern, '', script, flags=re.IGNORECASE | re.MULTILINE)
        
        # Ensure script starts with import statement
        if not script.strip().startswith('import'):
            # Try to find where the actual code starts
            lines = script.split('\n')
            for i, line in enumerate(lines):
                if line.strip().startswith('import'):
                    script = '\n'.join(lines[i:])
                    break
        
        # Remove trailing conversational text
        # If there's text after the last valid Python line, remove it
        lines = script.split('\n')
        last_code_line = len(lines) - 1
        for i in range(len(lines) - 1, -1, -1):
            line = lines[i].strip()
            if line and not line.startswith('#'):
                # Check if it looks like Python code
                if any(keyword in line for keyword in ['bpy.', 'import', '=', 'def ', 'class ', 'for ', 'if ', 'return']):
                    last_code_line = i
                    break
        
        script = '\n'.join(lines[:last_code_line + 1])
        
        return script.strip()
    
    def _validate_script(self, script: str) -> bool:
        """
        Validate that the script is syntactically correct Python
        and contains required Blender operations
        """
        try:
            # Check if script starts with import
            if not script.strip().startswith('import'):
                logger.error("Script doesn't start with import statement")
                return False
            
            # Check for required imports
            if 'import bpy' not in script:
                logger.error("Script missing 'import bpy'")
                return False
            
            # Check for scene clearing
            if 'bpy.ops.object.select_all' not in script or 'bpy.ops.object.delete' not in script:
                logger.warning("Script may not clear default scene")
            
            # Check for basic Blender operations
            required_operations = ['bpy.ops.mesh.primitive', 'bpy.context']
            if not any(op in script for op in required_operations):
                logger.error("Script missing basic Blender operations")
                return False
            
            # Try to compile the script (syntax check)
            compile(script, '<string>', 'exec')
            
            return True
        
        except SyntaxError as e:
            logger.error(f"Script syntax error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Script validation error: {str(e)}")
            return False
    
    def save_script(self, script: str, filename: str = None) -> str:
        """
        Save the generated script to a file
        
        Args:
            script: The Blender Python script
            filename: Optional custom filename
        
        Returns:
            str: Path to the saved file
        """
        if not filename:
            import uuid
            filename = f"house_model_{uuid.uuid4().hex[:8]}.py"
        
        # Ensure filename ends with .py
        if not filename.endswith('.py'):
            filename += '.py'
        
        # Create scripts directory if it doesn't exist
        scripts_dir = os.path.join(settings.MEDIA_ROOT, 'blender_scripts')
        os.makedirs(scripts_dir, exist_ok=True)
        
        # Save the script
        file_path = os.path.join(scripts_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(script)
        
        logger.info(f"Saved Blender script to {file_path}")
        return file_path


# Singleton instance
blender_generator = BlenderScriptGenerator()
