"""
AI Budget Estimator - Rule-based logic
Conversational flow to estimate construction budget
"""


class BudgetEstimator:
    """
    Rule-based budget estimation system
    Uses predefined rates and multipliers
    """
    
    # Base rates per square foot for different work types (in local currency)
    BASE_RATES = {
        'NEW_CONSTRUCTION': {
            'basic': 1200,      # Basic construction per sq ft
            'standard': 1800,   # Standard quality
            'premium': 2500,    # Premium quality
        },
        'RENOVATION': {
            'basic': 800,
            'standard': 1200,
            'premium': 1800,
        },
        'REPAIR': {
            'basic': 500,
            'standard': 700,
            'premium': 1000,
        },
        'PAINTING': {
            'basic': 15,        # per sq ft
            'standard': 25,
            'premium': 40,
        },
        'PLUMBING': {
            'basic': 5000,      # flat rate for bathroom
            'standard': 8000,
            'premium': 15000,
        },
        'ELECTRICAL': {
            'basic': 3000,      # per room
            'standard': 5000,
            'premium': 8000,
        },
        'FLOORING': {
            'basic': 80,        # per sq ft
            'standard': 150,
            'premium': 300,
        },
        'ROOFING': {
            'basic': 100,       # per sq ft
            'standard': 180,
            'premium': 300,
        }
    }
    
    # City multipliers (cost of living adjustment)
    CITY_MULTIPLIERS = {
        'tier1': 1.5,   # Metro cities (Mumbai, Delhi, Bangalore)
        'tier2': 1.2,   # Tier 2 cities
        'tier3': 1.0,   # Tier 3 cities and rural
    }
    
    # Urgency multipliers
    URGENCY_MULTIPLIERS = {
        'immediate': 1.3,    # Within 1 week
        'urgent': 1.15,      # Within 2-4 weeks
        'normal': 1.0,       # 1-3 months
        'flexible': 0.95,    # Can wait longer
    }
    
    @staticmethod
    def estimate_budget(work_type, area_sqft, quality='standard', city_tier='tier2', urgency='normal'):
        """
        Calculate budget estimate based on parameters
        
        Args:
            work_type: Type of work (NEW_CONSTRUCTION, RENOVATION, etc.)
            area_sqft: Area in square feet
            quality: Quality level (basic, standard, premium)
            city_tier: City tier (tier1, tier2, tier3)
            urgency: Urgency level (immediate, urgent, normal, flexible)
        
        Returns:
            dict with budget_min, budget_max, breakdown
        """
        
        # Get base rate
        if work_type not in BudgetEstimator.BASE_RATES:
            work_type = 'RENOVATION'  # Default
        
        base_rate = BudgetEstimator.BASE_RATES[work_type].get(quality, BudgetEstimator.BASE_RATES[work_type]['standard'])
        
        # Calculate base cost
        base_cost = base_rate * area_sqft
        
        # Apply multipliers
        city_multiplier = BudgetEstimator.CITY_MULTIPLIERS.get(city_tier, 1.0)
        urgency_multiplier = BudgetEstimator.URGENCY_MULTIPLIERS.get(urgency, 1.0)
        
        total_cost = base_cost * city_multiplier * urgency_multiplier
        
        # Add buffer range (±15%)
        budget_min = total_cost * 0.85
        budget_max = total_cost * 1.15
        
        # Required skills based on work type
        required_skills = BudgetEstimator.get_required_skills(work_type)
        
        return {
            'budget_min': round(budget_min, 2),
            'budget_max': round(budget_max, 2),
            'estimated_cost': round(total_cost, 2),
            'breakdown': {
                'base_rate_per_sqft': base_rate,
                'total_area_sqft': area_sqft,
                'base_cost': round(base_cost, 2),
                'city_multiplier': city_multiplier,
                'urgency_multiplier': urgency_multiplier,
            },
            'required_skills': required_skills,
            'estimated_duration_days': BudgetEstimator.estimate_duration(work_type, area_sqft),
            'disclaimer': 'This is an indicative budget estimate. Actual costs may vary based on material choices, site conditions, and contractor rates.'
        }
    
    @staticmethod
    def get_required_skills(work_type):
        """
        Return required skills for a work type
        """
        skill_mapping = {
            'NEW_CONSTRUCTION': ['masonry', 'carpentry', 'plumbing', 'electrical', 'painting'],
            'RENOVATION': ['masonry', 'carpentry', 'painting', 'plumbing'],
            'REPAIR': ['masonry', 'plastering'],
            'PAINTING': ['painting'],
            'PLUMBING': ['plumbing'],
            'ELECTRICAL': ['electrical'],
            'FLOORING': ['tiling', 'flooring'],
            'ROOFING': ['roofing', 'waterproofing'],
        }
        return skill_mapping.get(work_type, ['general masonry'])
    
    @staticmethod
    def estimate_duration(work_type, area_sqft):
        """
        Estimate project duration in days
        """
        # Simple rule: larger area = more days
        if work_type in ['NEW_CONSTRUCTION']:
            days = (area_sqft / 100) * 30  # 30 days per 100 sqft
        elif work_type in ['RENOVATION', 'REPAIR']:
            days = (area_sqft / 100) * 15
        else:
            days = (area_sqft / 100) * 7
        
        return max(7, int(days))  # Minimum 7 days
    
    @staticmethod
    def conversational_flow(step, data):
        """
        Manage conversational flow for budget estimation
        
        Args:
            step: Current step number
            data: Dictionary with collected data so far
        
        Returns:
            dict with question, options, and next_step
        """
        
        flow = {
            1: {
                'question': 'What type of work do you need?',
                'options': [
                    {'value': 'NEW_CONSTRUCTION', 'label': 'New Construction'},
                    {'value': 'RENOVATION', 'label': 'Renovation'},
                    {'value': 'REPAIR', 'label': 'Repair'},
                    {'value': 'PAINTING', 'label': 'Painting'},
                    {'value': 'PLUMBING', 'label': 'Plumbing'},
                    {'value': 'ELECTRICAL', 'label': 'Electrical'},
                    {'value': 'FLOORING', 'label': 'Flooring'},
                    {'value': 'ROOFING', 'label': 'Roofing'},
                ],
                'field': 'work_type',
                'next_step': 2
            },
            2: {
                'question': 'What is the approximate area in square feet?',
                'input_type': 'number',
                'field': 'area_sqft',
                'next_step': 3
            },
            3: {
                'question': 'What quality level do you prefer?',
                'options': [
                    {'value': 'basic', 'label': 'Basic (Budget-friendly)'},
                    {'value': 'standard', 'label': 'Standard (Good quality)'},
                    {'value': 'premium', 'label': 'Premium (High-end)'},
                ],
                'field': 'quality',
                'next_step': 4
            },
            4: {
                'question': 'Which city/area is this for?',
                'options': [
                    {'value': 'tier1', 'label': 'Metro City (Mumbai, Delhi, Bangalore, etc.)'},
                    {'value': 'tier2', 'label': 'Tier 2 City (Pune, Jaipur, Lucknow, etc.)'},
                    {'value': 'tier3', 'label': 'Tier 3 City / Rural'},
                ],
                'field': 'city_tier',
                'next_step': 5
            },
            5: {
                'question': 'How urgent is this project?',
                'options': [
                    {'value': 'immediate', 'label': 'Immediate (Within 1 week)'},
                    {'value': 'urgent', 'label': 'Urgent (2-4 weeks)'},
                    {'value': 'normal', 'label': 'Normal (1-3 months)'},
                    {'value': 'flexible', 'label': 'Flexible (Can wait)'},
                ],
                'field': 'urgency',
                'next_step': 'complete'
            }
        }
        
        if step == 'complete':
            # Generate estimate
            estimate = BudgetEstimator.estimate_budget(
                work_type=data.get('work_type'),
                area_sqft=float(data.get('area_sqft', 100)),
                quality=data.get('quality', 'standard'),
                city_tier=data.get('city_tier', 'tier2'),
                urgency=data.get('urgency', 'normal')
            )
            return {
                'status': 'complete',
                'estimate': estimate
            }
        
        return flow.get(step, flow[1])
