"""
AI House Designer - Conversational house design generation
Generates house layouts, floor plans, and AI-generated visualizations
"""
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import textwrap


class HouseDesigner:
    """
    Conversational AI for designing house layouts based on customer needs
    """
    
    # Design conversation flow
    QUESTIONS = {
        1: {
            'question': 'What type of property are you planning to build?',
            'field': 'property_type',
            'input_type': 'choice',
            'options': ['Single Family Home', 'Villa', 'Apartment', 'Duplex', 'Farmhouse', 'Commercial Building'],
            'next_step': 2
        },
        2: {
            'question': 'What is your total plot area? (in square feet)',
            'field': 'plot_area',
            'input_type': 'number',
            'next_step': 3
        },
        3: {
            'question': 'How many bedrooms do you need?',
            'field': 'bedrooms',
            'input_type': 'choice',
            'options': ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'],
            'next_step': 4
        },
        4: {
            'question': 'How many bathrooms do you need?',
            'field': 'bathrooms',
            'input_type': 'number',
            'next_step': 5
        },
        5: {
            'question': 'Do you need a kitchen?',
            'field': 'kitchen',
            'input_type': 'choice',
            'options': ['Open Kitchen', 'Closed Kitchen', 'Modular Kitchen', 'No Kitchen'],
            'next_step': 6
        },
        6: {
            'question': 'What additional rooms would you like? (Select all that apply)',
            'field': 'additional_rooms',
            'input_type': 'multi_choice',
            'options': ['Living Room', 'Dining Room', 'Study Room', 'Prayer Room', 'Home Office', 'Guest Room', 'Servant Quarter', 'Store Room'],
            'next_step': 7
        },
        7: {
            'question': 'Do you need outdoor spaces?',
            'field': 'outdoor_spaces',
            'input_type': 'multi_choice',
            'options': ['Balcony', 'Terrace', 'Garden', 'Parking (Car)', 'Parking (Bike)', 'Lawn', 'Swimming Pool'],
            'next_step': 8
        },
        8: {
            'question': 'How many floors would you like?',
            'field': 'floors',
            'input_type': 'choice',
            'options': ['Ground Floor Only', 'Ground + 1st Floor', 'Ground + 2 Floors', 'Ground + 3+ Floors'],
            'next_step': 9
        },
        9: {
            'question': 'What is your preferred architectural style?',
            'field': 'style',
            'input_type': 'choice',
            'options': ['Modern', 'Contemporary', 'Traditional Indian', 'Minimalist', 'Colonial', 'Mediterranean', 'Eco-Friendly/Sustainable'],
            'next_step': 10
        },
        10: {
            'question': 'What is your budget range for construction?',
            'field': 'budget_range',
            'input_type': 'choice',
            'options': ['Below 20 Lakhs', '20-40 Lakhs', '40-60 Lakhs', '60 Lakhs - 1 Crore', 'Above 1 Crore'],
            'next_step': 11
        },
        11: {
            'question': 'Any special requirements or preferences?',
            'field': 'special_requirements',
            'input_type': 'text',
            'placeholder': 'E.g., Vastu compliant, wheelchair accessible, solar panels, rainwater harvesting',
            'next_step': 'complete'
        }
    }
    
    @staticmethod
    def conversational_flow(step, data):
        """
        Handle conversational flow for house design
        
        Args:
            step (int or str): Current step number or 'complete'
            data (dict): Collected data so far
        
        Returns:
            dict: Next question or final design
        """
        
        # Convert step to int if it's a string number
        if isinstance(step, str) and step.isdigit():
            step = int(step)
        
        if step == 'complete' or (isinstance(step, int) and step > len(HouseDesigner.QUESTIONS)):
            # Generate final design
            try:
                return HouseDesigner.generate_design(data)
            except Exception as e:
                return {
                    'success': False,
                    'error': f'Failed to generate design: {str(e)}'
                }
        
        # Get next question
        question_data = HouseDesigner.QUESTIONS.get(step)
        
        if question_data:
            return {
                'step': step,
                'question': question_data['question'],
                'field': question_data['field'],
                'input_type': question_data['input_type'],
                'options': question_data.get('options', []),
                'placeholder': question_data.get('placeholder', ''),
                'next_step': question_data['next_step'],
                'total_steps': len(HouseDesigner.QUESTIONS)
            }
        
        return {
            'success': False,
            'error': f'Invalid step: {step}'
        }
    
    @staticmethod
    def generate_design(data):
        """
        Generate house design based on collected data
        
        Args:
            data (dict): All collected user inputs
        
        Returns:
            dict: Complete house design with layout, rooms, specifications
        """
        
        property_type = data.get('property_type', 'Single Family Home')
        plot_area = float(data.get('plot_area', 1000))
        bedrooms = data.get('bedrooms', '2 BHK')
        bathrooms = int(data.get('bathrooms', 2))
        kitchen = data.get('kitchen', 'Closed Kitchen')
        additional_rooms = data.get('additional_rooms', [])
        outdoor_spaces = data.get('outdoor_spaces', [])
        floors = data.get('floors', 'Ground Floor Only')
        style = data.get('style', 'Modern')
        budget_range = data.get('budget_range', '20-40 Lakhs')
        special_requirements = data.get('special_requirements', '')
        
        # Parse bedroom count
        bedroom_count = int(bedrooms.split()[0])
        
        # Calculate areas based on plot size
        total_built_area = HouseDesigner.calculate_built_area(plot_area, floors)
        
        # Generate room layout
        room_layout = HouseDesigner.create_room_layout(
            bedroom_count, bathrooms, kitchen, additional_rooms, 
            outdoor_spaces, total_built_area
        )
        
        # Calculate floor-wise distribution
        floor_distribution = HouseDesigner.distribute_floors(
            room_layout, floors, total_built_area
        )
        
        # Generate design recommendations
        recommendations = HouseDesigner.generate_recommendations(
            property_type, style, special_requirements, plot_area
        )
        
        # Estimate construction cost
        construction_estimate = HouseDesigner.estimate_construction_cost(
            total_built_area, style, budget_range
        )
        
        # Generate floor plan image
        floor_plan_image = HouseDesigner.generate_floor_plan_image(
            data, room_layout, floor_distribution
        )
        
        # Generate 3D visualization prompt
        visualization_prompt = HouseDesigner.generate_3d_visualization_prompt(
            data, room_layout
        )
        
        return {
            'success': True,
            'design': {
                'property_type': property_type,
                'plot_area_sqft': plot_area,
                'total_built_area_sqft': total_built_area,
                'bedrooms': bedroom_count,
                'bathrooms': bathrooms,
                'floors': floors,
                'style': style,
                'room_layout': room_layout,
                'floor_distribution': floor_distribution,
                'construction_estimate': construction_estimate,
                'recommendations': recommendations,
                'special_features': special_requirements,
                'floor_plan_image': floor_plan_image,  # Base64 encoded PNG
                'visualization_prompt': visualization_prompt  # For AI image generation
            },
            'summary': HouseDesigner.generate_summary(data, total_built_area),
            'next_steps': [
                'Review the generated design layout',
                'Consult with an architect to create detailed floor plans',
                'Get approval from local authorities',
                'Post a job on Mistribazar to find construction professionals'
            ]
        }
    
    @staticmethod
    def calculate_built_area(plot_area, floors):
        """Calculate total built-up area based on plot area and floors"""
        floor_count_map = {
            'Ground Floor Only': 1,
            'Ground + 1st Floor': 2,
            'Ground + 2 Floors': 3,
            'Ground + 3+ Floors': 4
        }
        
        floor_count = floor_count_map.get(floors, 1)
        
        # Assume 60-70% coverage per floor
        coverage_ratio = 0.65
        built_area_per_floor = plot_area * coverage_ratio
        
        return built_area_per_floor * floor_count
    
    @staticmethod
    def create_room_layout(bedrooms, bathrooms, kitchen, additional_rooms, outdoor_spaces, total_area):
        """Generate room-wise area allocation"""
        
        # Standard room sizes (in sq ft)
        room_sizes = {
            'Master Bedroom': 200,
            'Bedroom': 150,
            'Bathroom': 50,
            'Kitchen': 120,
            'Living Room': 250,
            'Dining Room': 150,
            'Study Room': 100,
            'Prayer Room': 80,
            'Home Office': 120,
            'Guest Room': 120,
            'Servant Quarter': 100,
            'Store Room': 60,
            'Balcony': 60,
            'Terrace': 200,
            'Garden': 300,
            'Parking': 150
        }
        
        layout = []
        
        # Add bedrooms
        if bedrooms > 0:
            layout.append({'room': 'Master Bedroom', 'area': room_sizes['Master Bedroom'], 'count': 1})
        if bedrooms > 1:
            layout.append({'room': 'Bedroom', 'area': room_sizes['Bedroom'], 'count': bedrooms - 1})
        
        # Add bathrooms
        layout.append({'room': 'Bathroom', 'area': room_sizes['Bathroom'], 'count': bathrooms})
        
        # Add kitchen
        if kitchen != 'No Kitchen':
            layout.append({'room': kitchen, 'area': room_sizes['Kitchen'], 'count': 1})
        
        # Add additional rooms
        if isinstance(additional_rooms, list):
            for room in additional_rooms:
                if room in room_sizes:
                    layout.append({'room': room, 'area': room_sizes[room], 'count': 1})
        
        # Add outdoor spaces
        if isinstance(outdoor_spaces, list):
            for space in outdoor_spaces:
                if 'Parking' in space:
                    layout.append({'room': space, 'area': room_sizes['Parking'], 'count': 1})
                elif space in room_sizes:
                    layout.append({'room': space, 'area': room_sizes[space], 'count': 1})
        
        # Add common areas (always include)
        if 'Living Room' not in [item['room'] for item in layout]:
            layout.append({'room': 'Living Room', 'area': room_sizes['Living Room'], 'count': 1})
        
        # Calculate total and add circulation space (30%)
        total_room_area = sum(item['area'] * item['count'] for item in layout)
        circulation_area = total_room_area * 0.3
        layout.append({'room': 'Circulation (Corridors, Stairs, Lobby)', 'area': circulation_area, 'count': 1})
        
        return layout
    
    @staticmethod
    def distribute_floors(room_layout, floors_config, total_area):
        """Distribute rooms across different floors"""
        
        floor_count_map = {
            'Ground Floor Only': 1,
            'Ground + 1st Floor': 2,
            'Ground + 2 Floors': 3,
            'Ground + 3+ Floors': 4
        }
        
        floor_count = floor_count_map.get(floors_config, 1)
        
        if floor_count == 1:
            return {
                'Ground Floor': 'All rooms on single floor'
            }
        
        # Typical distribution
        distribution = {}
        
        if floor_count >= 2:
            distribution['Ground Floor'] = 'Living Room, Dining Room, Kitchen, Guest Room, 1 Bathroom, Parking, Garden'
            distribution['1st Floor'] = 'All Bedrooms, Remaining Bathrooms, Study Room, Balconies'
        
        if floor_count >= 3:
            distribution['2nd Floor'] = 'Additional Bedrooms, Home Office, Prayer Room, Terrace'
        
        if floor_count >= 4:
            distribution['3rd Floor'] = 'Servant Quarter, Store Room, Terrace Garden, Open Space'
        
        return distribution
    
    @staticmethod
    def estimate_construction_cost(built_area, style, budget_range):
        """Estimate construction costs"""
        
        # Cost per sq ft based on style
        cost_per_sqft = {
            'Modern': 2000,
            'Contemporary': 2200,
            'Traditional Indian': 1800,
            'Minimalist': 1600,
            'Colonial': 2500,
            'Mediterranean': 2400,
            'Eco-Friendly/Sustainable': 2300
        }
        
        base_cost_per_sqft = cost_per_sqft.get(style, 2000)
        
        # Calculate costs
        construction_cost = built_area * base_cost_per_sqft
        material_cost = construction_cost * 0.55
        labor_cost = construction_cost * 0.35
        other_costs = construction_cost * 0.10
        
        return {
            'total_estimated_cost': int(construction_cost),
            'cost_per_sqft': base_cost_per_sqft,
            'breakdown': {
                'material_cost': int(material_cost),
                'labor_cost': int(labor_cost),
                'other_costs': int(other_costs)
            },
            'timeline_months': int((built_area / 500) * 2),  # Rough estimate
            'budget_match': budget_range
        }
    
    @staticmethod
    def generate_recommendations(property_type, style, special_requirements, plot_area):
        """Generate design recommendations"""
        
        recommendations = []
        
        # Vastu recommendations
        if 'vastu' in special_requirements.lower():
            recommendations.append('Main entrance should face East or North for positive energy')
            recommendations.append('Kitchen should be in Southeast corner')
            recommendations.append('Master bedroom in Southwest corner')
            recommendations.append('Avoid toilets in Northeast direction')
        
        # Sustainable features
        if 'eco' in special_requirements.lower() or 'sustainable' in special_requirements.lower():
            recommendations.append('Install solar panels on rooftop for electricity')
            recommendations.append('Set up rainwater harvesting system')
            recommendations.append('Use eco-friendly building materials like fly ash bricks')
            recommendations.append('Install LED lighting throughout')
        
        # General recommendations
        if plot_area < 1000:
            recommendations.append('Consider vertical expansion to maximize space')
            recommendations.append('Use space-saving furniture and built-in storage')
        
        if style == 'Modern' or style == 'Contemporary':
            recommendations.append('Large windows for natural light')
            recommendations.append('Open floor plan for living areas')
            recommendations.append('Neutral color palette with accent walls')
        
        if style == 'Traditional Indian':
            recommendations.append('Central courtyard for ventilation')
            recommendations.append('Traditional jali work for privacy and aesthetics')
            recommendations.append('Use of natural materials like wood and stone')
        
        # Accessibility
        if 'wheelchair' in special_requirements.lower() or 'accessible' in special_requirements.lower():
            recommendations.append('Ramps instead of stairs at entrance')
            recommendations.append('Wide doorways (minimum 36 inches)')
            recommendations.append('Ground floor bedroom and bathroom')
        
        if not recommendations:
            recommendations = [
                'Ensure proper ventilation in all rooms',
                'Adequate natural lighting through windows',
                'Separate wet and dry areas',
                'Future-proof electrical and plumbing layouts',
                'Energy-efficient appliances and fixtures'
            ]
        
        return recommendations
    
    @staticmethod
    def generate_summary(data, total_area):
        """Generate human-readable summary"""
        
        return f"Your {data.get('property_type', 'home')} design includes {data.get('bedrooms', '2 BHK')} with {data.get('bathrooms', 2)} bathrooms in a {data.get('style', 'Modern')} style. Total built-up area is approximately {int(total_area)} sq ft on a {data.get('plot_area', '1000')} sq ft plot. The design incorporates {data.get('kitchen', 'kitchen')}, and spans across {data.get('floors', 'ground floor')}."
    
    @staticmethod
    def generate_floor_plan_image(data, room_layout, floor_distribution):
        """
        Generate a simple floor plan visualization as base64 image
        
        Args:
            data: Design data dictionary
            room_layout: List of rooms with areas
            floor_distribution: Floor-wise room distribution
        
        Returns:
            base64 encoded PNG image string
        """
        try:
            # Create image (1200x1400 pixels)
            width, height = 1200, 1400
            img = Image.new('RGB', (width, height), color='#f5f5f5')
            draw = ImageDraw.Draw(img)
            
            # Colors
            bg_color = '#ffffff'
            header_color = '#FBBF24'  # Amber
            text_color = '#1a120b'
            room_color = '#FEF3C7'  # Light amber
            border_color = '#F59E0B'  # Dark amber
            
            # Draw header background
            draw.rectangle([0, 0, width, 120], fill=header_color)
            
            # Title
            title = f"{data.get('property_type', 'House')} - {data.get('bedrooms', '2 BHK')}"
            title_font_size = 40
            # Use default font (PIL's built-in)
            try:
                title_font = ImageFont.truetype("arial.ttf", title_font_size)
            except:
                title_font = ImageFont.load_default()
            
            # Get text bounding box for centering
            title_bbox = draw.textbbox((0, 0), title, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            draw.text(((width - title_width) / 2, 30), title, fill=text_color, font=title_font)
            
            # Subtitle
            subtitle = f"Plot: {data.get('plot_area', 'N/A')} sq ft | Style: {data.get('style', 'Modern')}"
            try:
                subtitle_font = ImageFont.truetype("arial.ttf", 20)
            except:
                subtitle_font = ImageFont.load_default()
            
            subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
            draw.text(((width - subtitle_width) / 2, 80), subtitle, fill=text_color, font=subtitle_font)
            
            # Content area
            y_offset = 150
            padding = 40
            
            # Draw floor distribution
            try:
                section_font = ImageFont.truetype("arial.ttf", 28)
                room_font = ImageFont.truetype("arial.ttf", 18)
            except:
                section_font = ImageFont.load_default()
                room_font = ImageFont.load_default()
            
            for floor_name, rooms_str in floor_distribution.items():
                # Floor header
                draw.text((padding, y_offset), floor_name, fill=text_color, font=section_font)
                y_offset += 40
                
                # Wrap room text
                wrapped_rooms = textwrap.wrap(rooms_str, width=80)
                for line in wrapped_rooms:
                    draw.rectangle(
                        [padding, y_offset, width - padding, y_offset + 30],
                        fill=room_color,
                        outline=border_color,
                        width=2
                    )
                    draw.text((padding + 15, y_offset + 5), line, fill=text_color, font=room_font)
                    y_offset += 35
                
                y_offset += 20
            
            # Room layout table
            y_offset += 20
            draw.text((padding, y_offset), "Room Layout", fill=text_color, font=section_font)
            y_offset += 50
            
            # Table headers
            col_widths = [400, 200, 200]
            headers = ["Room", "Area (sq ft)", "Count"]
            x_pos = padding
            
            # Header row
            for i, header in enumerate(headers):
                draw.rectangle(
                    [x_pos, y_offset, x_pos + col_widths[i], y_offset + 35],
                    fill=header_color,
                    outline=border_color,
                    width=2
                )
                draw.text((x_pos + 15, y_offset + 8), header, fill=text_color, font=room_font)
                x_pos += col_widths[i]
            
            y_offset += 35
            
            # Room rows
            for room in room_layout[:12]:  # Limit to 12 rooms to fit
                x_pos = padding
                row_data = [
                    room['room'],
                    str(int(room['area'])),
                    str(room['count'])
                ]
                
                for i, data_text in enumerate(row_data):
                    draw.rectangle(
                        [x_pos, y_offset, x_pos + col_widths[i], y_offset + 30],
                        fill=bg_color,
                        outline=border_color,
                        width=1
                    )
                    draw.text((x_pos + 15, y_offset + 5), data_text, fill=text_color, font=room_font)
                    x_pos += col_widths[i]
                
                y_offset += 30
            
            # Footer
            y_offset += 40
            footer_text = "Generated by Mistribazar AI House Designer"
            try:
                footer_font = ImageFont.truetype("arial.ttf", 16)
            except:
                footer_font = ImageFont.load_default()
            
            footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
            footer_width = footer_bbox[2] - footer_bbox[0]
            draw.text(((width - footer_width) / 2, height - 50), footer_text, fill='#666666', font=footer_font)
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            
            return image_base64
            
        except Exception as e:
            # If image generation fails, return None
            print(f"Floor plan image generation failed: {str(e)}")
            return None
    
    @staticmethod
    def generate_3d_visualization_prompt(data, room_layout):
        """
        Generate a detailed prompt for AI image generation (Stable Diffusion, DALL-E, etc.)
        
        Returns:
            String prompt for AI image generation
        """
        property_type = data.get('property_type', 'house')
        style = data.get('style', 'Modern')
        bedrooms = data.get('bedrooms', '2 BHK')
        floors = data.get('floors', 'Ground Floor Only')
        
        # Create descriptive prompt
        prompt = f"Professional architectural visualization of a {style.lower()} style {property_type.lower()}, "
        prompt += f"{bedrooms} configuration, "
        prompt += f"exterior view, "
        prompt += f"{floors.lower()}, "
        prompt += "realistic rendering, high quality, detailed architecture, "
        
        # Add style-specific details
        if style == 'Modern':
            prompt += "clean lines, large glass windows, minimalist design, contemporary facade, "
        elif style == 'Traditional Indian':
            prompt += "traditional indian architecture, ornate details, warm colors, terracotta, "
        elif style == 'Contemporary':
            prompt += "contemporary architecture, mixed materials, geometric shapes, "
        elif style == 'Vastu Compliant':
            prompt += "traditional vastu architecture, symmetrical design, "
        
        prompt += "professional photography, architectural digest, sunny day, landscaped garden"
        
        return prompt
