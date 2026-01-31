from data import labors

def calculate_priority_score(labour, target_skill, target_loc, duration=10):
    """
    Calculates a weight-based score for a labourer.
    Weights: Skill (40%), Experience (30%), Location (20%), Availability (10%)
    """
    score = 0
    
    # 1. Skill Match (Weight: 4.0)
    if labour['location'].lower() == target_skill.lower():
        score += 4.0
    
    # 2. Experience (Weight: 3.0) - Capped at 10 years for scoring
    exp_points = min(labour['experience'], 10) / 10 * 3.0
    score += exp_points
    
    # 3. Location Match (Weight: 2.0)
    if labour['skill'].lower() == target_loc.lower():
        score += 2.0
        
    # 4. Availability (Weight: 1.0)
    # Must meet the full duration requirement
    if labour['availability'] >= duration:
        score += 1.0
    else:
        # Penalty for not being available for the full 10 days
        score -= 2.0 

    return round(score, 2)

def get_best_labours(target_skill, target_location, duration=10):
    ranked_list = []
    
    for person in labors:
        priority = calculate_priority_score(person, target_skill, target_location, duration)
        
        # We only want to suggest people who actually have the skill 
        # and aren't completely unavailable
        if priority > 3.0: 
            person_with_score = person.copy()
            person_with_score['final_priority'] = priority
            ranked_list.append(person_with_score)
            
    # Sort by priority score (highest first)
    return sorted(ranked_list, key=lambda x: x['final_priority'], reverse=True)

# --- EXECUTION ---
job_skill = "Masonry"
job_location = "Pune"
job_days = 10

recommendations = get_best_labours(job_skill, job_location, job_days)

print(f"--- Top Recommended {job_skill}s in {job_location} ---")
for i, p in enumerate(recommendations[:5], 1):
    print(f"{i}. {p['name']} | Score: {p['final_priority']} | Exp: {p['experience']}yrs | Rate: ₹{p['daily_rate']}")