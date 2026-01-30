# 3D House Design Feature with Gemini API and Blender

## Overview
This feature allows users to generate Blender Python (bpy) scripts for 3D house models by answering a 12-question survey. The data is processed by Google's Gemini API, which returns a valid, executable Blender script.

## Tech Stack
- **Frontend**: React (multi-step form component)
- **Backend**: Django REST Framework (API endpoint)
- **AI Engine**: Google Gemini Pro API
- **Output**: Blender Python (bpy) scripts

## Architecture

### Flow Diagram
```
User → React Form (12 Questions) → Django API → Gemini API → Blender Script → User Downloads
```

## Files Created

### Backend Files
1. **`backend/ai_engine/blender_script_generator.py`**
   - `BlenderScriptGenerator` class
   - Handles Gemini API calls with strict system prompts
   - Script sanitization and validation
   - File saving utility

2. **`backend/ai_engine/views.py`** (updated)
   - `Generate3DHouseView`: POST endpoint for script generation
   - `Download3DHouseScriptView`: GET endpoint for downloading scripts

3. **`backend/ai_engine/urls.py`** (updated)
   - `/api/ai/3d-house/generate/` - POST endpoint
   - `/api/ai/3d-house/download/<filename>/` - GET endpoint

### Frontend Files
1. **`frontend/src/pages/HouseDesigner3DPage.jsx`**
   - 12-step questionnaire component
   - Progress bar and navigation
   - Script preview and download interface

## API Endpoints

### 1. Generate 3D House Script
**Endpoint**: `POST /api/ai/3d-house/generate/`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
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
```

**Response**:
```json
{
  "success": true,
  "script": "import bpy\nimport math\n\n# Clear default scene\n...",
  "filename": "house_model_123_20x15.py",
  "download_url": "/api/ai/3d-house/download/house_model_123_20x15.py",
  "message": "Blender script generated successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Missing required fields: architectural_style"
}
```

### 2. Download Blender Script
**Endpoint**: `GET /api/ai/3d-house/download/<filename>/`

**Authentication**: Required (Bearer token)

**Response**: File download with `Content-Disposition: attachment`

## 12-Question Survey

| Step | Question | Type | Options/Format |
|------|----------|------|----------------|
| 1 | Plot Dimensions | Number inputs | Length & Width in meters |
| 2 | Number of Floors | Buttons | 1, 2, 3, 4 |
| 3 | Bedrooms | Buttons | 1-6 BHK |
| 4 | Bathrooms | Buttons | 1-5 |
| 5 | Kitchen Type | Single select | Modern, Traditional, Island, L-shaped, U-shaped |
| 6 | Living Areas | Multi-select | Living room, Dining room, Family room, etc. |
| 7 | Outdoor Spaces | Multi-select (optional) | Balcony, Terrace, Garden, etc. |
| 8 | Parking Spaces | Buttons | 0-4 |
| 9 | Architectural Style | Single select | Modern, Contemporary, Traditional, etc. |
| 10 | Special Features | Multi-select (optional) | Solar panels, Smart home, etc. |
| 11 | Roof Type | Single select | Flat, Sloped, Hip, Terrace, Green |
| 12 | Additional Requirements | Text area (optional) | Free-form text |

## Gemini System Prompt

The system prompt ensures Gemini returns ONLY valid Python code:

```
You are a Blender Python (bpy) script generator. Your ONLY job is to generate valid, executable Python code for Blender.

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
```

## Script Sanitization

The `_sanitize_script()` method performs the following:

1. **Remove Markdown**: Strips ```python``` blocks and markdown formatting
2. **Remove Conversational Text**: Removes phrases like "Here is your script:", "Here's the code:", etc.
3. **Ensure Import Statement**: Verifies script starts with `import` keyword
4. **Trim Trailing Text**: Removes non-code text after the last valid Python line

## Script Validation

The `_validate_script()` method checks:

1. Script starts with import statement
2. Contains `import bpy` (required for Blender)
3. Contains scene clearing operations (warning if missing)
4. Contains basic Blender operations (`bpy.ops.mesh.primitive`, `bpy.context`)
5. **Syntax Check**: Uses Python's `compile()` to validate syntax

## Setup Instructions

### Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install google-generativeai==0.3.2
   ```

2. **Configure Environment Variables** (`.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Get Gemini API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add to `.env` file

4. **Create Media Directory**:
   ```bash
   mkdir -p backend/media/blender_scripts
   ```

5. **Update Settings** (`backend/config/settings.py`):
   ```python
   MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
   MEDIA_URL = '/media/'
   ```

### Frontend Setup

1. **Add Route** to `src/App.jsx`:
   ```jsx
   import HouseDesigner3DPage from './pages/HouseDesigner3DPage';
   
   // In routes:
   <Route 
     path="/3d-house-designer" 
     element={
       <ProtectedRoute>
         <HouseDesigner3DPage />
       </ProtectedRoute>
     } 
   />
   ```

2. **Add Navigation Link** to customer dashboard:
   ```jsx
   <Link to="/3d-house-designer">
     <Home size={24} />
     3D House Designer
   </Link>
   ```

## Usage Flow

### For End Users

1. **Access Feature**: Navigate to `/3d-house-designer`
2. **Answer Questions**: Complete all 12 questions about house requirements
3. **Generate Script**: Click "Generate 3D Model" button
4. **Download**: Download the generated `.py` file
5. **Use in Blender**:
   - Open Blender (version 3.0+)
   - Go to Scripting workspace
   - Open the downloaded `.py` file
   - Click "Run Script"
   - View the generated 3D house model

### For Developers

**Testing the API**:
```bash
curl -X POST http://localhost:8000/api/ai/3d-house/generate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plot_length": 20,
    "plot_width": 15,
    "num_floors": 2,
    "num_bedrooms": 3,
    "num_bathrooms": 2,
    "kitchen_type": "Modern open kitchen",
    "living_areas": ["Living room"],
    "outdoor_spaces": [],
    "parking_spaces": 2,
    "architectural_style": "Modern",
    "special_features": [],
    "roof_type": "Flat",
    "additional_requirements": ""
  }'
```

## Safety Considerations

### Script Sanitization
- Removes markdown formatting that could break Python syntax
- Strips conversational text from AI responses
- Validates Python syntax before returning
- Only allows `.py` file extensions for downloads

### Security
- Authentication required for all endpoints
- Filename sanitization prevents directory traversal attacks
- Scripts saved in isolated media directory
- No code execution on server (runs only in user's Blender)

### Rate Limiting (Recommended)
Add rate limiting to prevent API abuse:
```python
from rest_framework.throttling import UserRateThrottle

class Generate3DHouseView(APIView):
    throttle_classes = [UserRateThrottle]
    throttle_scope = '3d-house-generation'
```

In `settings.py`:
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        '3d-house-generation': '5/hour',  # 5 requests per hour per user
    }
}
```

## Troubleshooting

### Common Issues

1. **Gemini API Key Not Configured**
   - Error: `GEMINI_API_KEY not configured in settings`
   - Solution: Add `GEMINI_API_KEY` to `.env` file

2. **Script Contains Markdown**
   - Error: `Script syntax error`
   - Solution: Adjust sanitization regex patterns, lower Gemini temperature

3. **Generated Script Doesn't Run in Blender**
   - Check Blender version compatibility (3.0+ recommended)
   - Verify script syntax with Python compile check
   - Review Gemini system prompt for clearer instructions

4. **File Download Fails**
   - Ensure `MEDIA_ROOT` is configured correctly
   - Check file permissions on `media/blender_scripts/` directory
   - Verify filename sanitization logic

### Debugging

Enable logging for Gemini API calls:
```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

Check generated scripts in:
```bash
backend/media/blender_scripts/
```

## Future Enhancements

1. **Preview Generation**: Use Blender headless mode to generate preview images
2. **Script Templates**: Pre-defined templates for common house types
3. **Style Transfer**: Apply different architectural styles to existing designs
4. **3D Viewer**: WebGL viewer for in-browser 3D model preview
5. **Cost Estimation**: Integrate with budget estimator for material costs
6. **Multi-language Support**: Translate UI to regional languages
7. **Save Designs**: Allow users to save and revisit previous designs
8. **Share Designs**: Generate shareable links for designs

## Performance Considerations

- **Gemini API Latency**: ~5-10 seconds per request
- **Script Size**: ~2-5 KB per generated script
- **Storage**: Periodically clean old scripts (30-day retention recommended)
- **Caching**: Consider caching identical requests (plot dimensions + features)

## Cost Analysis

**Gemini API Pricing** (as of 2024):
- Gemini Pro: Free tier available (60 requests/minute)
- Paid tier: $0.00025 per 1K characters

**Estimated Cost per Generation**:
- Average prompt: ~500 characters
- Average response: ~2000 characters
- Cost: ~$0.0006 per generation
- Monthly cost (1000 users, 2 requests each): ~$1.20

## Integration with Existing Features

### Link to Budget Estimator
After generating 3D model, suggest budget estimation:
```jsx
<Link to="/budget-estimator">
  Estimate construction costs for this design →
</Link>
```

### Link to Job Posting
After design approval, allow direct job posting:
```jsx
<button onClick={() => createJobFromDesign()}>
  Post this as a PROJECT →
</button>
```

### Save to User Profile
Store design preferences for future projects:
```python
class HouseDesignPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    design_data = models.JSONField()
    script_file = models.FileField(upload_to='blender_scripts/')
    created_at = models.DateTimeField(auto_now_add=True)
```

## Testing Checklist

- [ ] Gemini API key configured
- [ ] All 12 questions render correctly
- [ ] Form validation works (required fields)
- [ ] Progress bar updates correctly
- [ ] API endpoint returns valid Python script
- [ ] Script sanitization removes markdown
- [ ] Script validation catches syntax errors
- [ ] File download works correctly
- [ ] Script runs in Blender without errors
- [ ] Generated 3D model matches user inputs
- [ ] Authentication required for endpoints
- [ ] Error handling displays user-friendly messages
- [ ] Mobile responsive design

## References

- **Blender Python API**: https://docs.blender.org/api/current/
- **Google Gemini API**: https://ai.google.dev/docs
- **React Multi-Step Forms**: https://react.dev/learn/sharing-state-between-components
- **Django File Downloads**: https://docs.djangoproject.com/en/4.2/howto/outputting-csv/#streaming-large-csv-files

## Support

For issues or questions:
1. Check logs in `backend/logs/` (if configured)
2. Review generated scripts in `backend/media/blender_scripts/`
3. Test Gemini API directly: https://makersuite.google.com/
4. Verify Blender version compatibility

---

**Last Updated**: January 30, 2026
**Version**: 1.0
**Author**: Mistribazar Development Team
