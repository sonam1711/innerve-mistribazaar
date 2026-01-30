"""
Recommender System - Rule-based logic
Ranks contractors/traders based on explainable criteria
"""
from math import radians, cos, sin, asin, sqrt


class Recommender:
    """
    Rule-based recommendation system
    Scores providers based on:
    - Rating (40%)
    - Price competitiveness (30%)
    - Distance (20%)
    - Availability (10%)
    """
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance in kilometers using Haversine formula"""
        if not all([lat1, lon1, lat2, lon2]):
            return 999999  # Very high distance if coordinates missing
        
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        
        return km
    
    @staticmethod
    def normalize_score(value, min_val, max_val, reverse=False):
        """
        Normalize value to 0-1 range
        If reverse=True, lower values get higher scores
        """
        if max_val == min_val:
            return 0.5
        
        normalized = (value - min_val) / (max_val - min_val)
        
        if reverse:
            normalized = 1 - normalized
        
        return max(0, min(1, normalized))
    
    @staticmethod
    def score_providers(bids, job):
        """
        Score and rank providers based on bids
        
        Args:
            bids: List of bid objects
            job: Job object
        
        Returns:
            List of bids with scores and reasons
        """
        if not bids:
            return []
        
        # Extract values for normalization
        ratings = [bid.bidder.rating for bid in bids]
        prices = [float(bid.bid_amount) for bid in bids]
        distances = [
            Recommender.calculate_distance(
                job.latitude, job.longitude,
                bid.bidder.latitude, bid.bidder.longitude
            ) for bid in bids
        ]
        
        min_rating, max_rating = min(ratings), max(ratings)
        min_price, max_price = min(prices), max(prices)
        min_distance, max_distance = min(distances), max(distances)
        
        scored_bids = []
        
        for i, bid in enumerate(bids):
            # Calculate individual scores
            rating_score = Recommender.normalize_score(
                ratings[i], min_rating, max_rating, reverse=False
            )
            
            # Lower price is better
            price_score = Recommender.normalize_score(
                prices[i], min_price, max_price, reverse=True
            )
            
            # Shorter distance is better
            distance_score = Recommender.normalize_score(
                distances[i], min_distance, max_distance, reverse=True
            )
            
            # Availability score
            # Availability (if profile exists)
            if hasattr(bid.bidder, 'contractor_profile'):
                availability_score = 1.0 if bid.bidder.contractor_profile.is_available else 0.5
            elif hasattr(bid.bidder, 'trader_profile'):
                availability_score = 1.0 if bid.bidder.trader_profile.is_available else 0.5
            else:
                availability_score = 0.5
            if hasattr(bid.bidder, 'trader_profile'):
                availability_score = 1.0 if bid.bidder.trader_profile.is_available else 0.5
            
            # Weighted total score
            total_score = (
                rating_score * 0.4 +
                price_score * 0.3 +
                distance_score * 0.2 +
                availability_score * 0.1
            )
            
            # Determine recommendation reason
            reason = Recommender.get_recommendation_reason(
                rating_score, price_score, distance_score, availability_score
            )
            
            scored_bids.append({
                'bid': bid,
                'score': round(total_score * 100, 2),  # Convert to 0-100 scale
                'rating_score': round(rating_score * 100, 2),
                'price_score': round(price_score * 100, 2),
                'distance_score': round(distance_score * 100, 2),
                'availability_score': round(availability_score * 100, 2),
                'distance_km': round(distances[i], 2),
                'reason': reason
            })
        
        # Sort by total score (descending)
        scored_bids.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_bids
    
    @staticmethod
    def get_recommendation_reason(rating_score, price_score, distance_score, availability_score):
        """
        Generate human-readable recommendation reason
        """
        scores = {
            'Highest rated': rating_score,
            'Best value': price_score,
            'Nearest': distance_score,
            'Available now': availability_score
        }
        
        # Find top reason
        top_reason = max(scores, key=scores.get)
        
        # If multiple high scores, combine reasons
        high_scores = [k for k, v in scores.items() if v > 0.7]
        
        if len(high_scores) > 1:
            return ' & '.join(high_scores[:2])
        
        return top_reason
