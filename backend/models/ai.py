from typing import Tuple
from schemas import GameState, AiResponse


def rule_based_ai(state: GameState) -> Tuple[float, float]:
    """
    Rule-based AI that actively hits the puck back.
    
    Strategy:
    1. If puck is in AI's court, position to hit it back aggressively
    2. If puck is moving towards AI, intercept and aim for human's goal
    3. If puck is moving away, position defensively
    4. Account for difficulty (speed, noise, delay)
    """
    puck = state.puck
    ai_paddle = state.ai_paddle
    table_width = state.table_width
    table_height = state.table_height
    
    center_line_y = table_height / 2
    paddle_radius = ai_paddle.radius
    
    # Check if puck is in AI's court (top half)
    puck_in_ai_court = puck.y < center_line_y
    
    # Calculate distance to puck
    distance_to_puck = ((puck.x - ai_paddle.x) ** 2 + (puck.y - ai_paddle.y) ** 2) ** 0.5
    
    # Check if puck is idle (very slow or stopped)
    puck_speed = (puck.vx ** 2 + puck.vy ** 2) ** 0.5
    puck_is_idle = puck_speed < 20  # Consider idle if speed < 20
    
    # If puck is moving towards AI (upward) or in AI's court
    if puck.vy < 0 or puck_in_ai_court:
        # Aggressive mode: Try to hit the puck back
        
        if puck_is_idle and puck_in_ai_court:
            # Puck is idle in AI's court - actively hit it!
            import random
            
            # Add human-like variation based on difficulty
            if state.difficulty == "easy":
                human_error = random.uniform(-25, 25)
            elif state.difficulty == "medium":
                human_error = random.uniform(-15, 15)
            else:  # hard
                human_error = random.uniform(-8, 8)
            
            # Aim slightly behind puck to push it forward
            target_x = puck.x + human_error
            
            # Position paddle to hit puck downward (behind and slightly above)
            hit_offset_y = 25 + random.uniform(-10, 10)  # Variable hit position
            target_y = puck.y - hit_offset_y
            
            # Ensure we're in valid range
            target_x = max(
                paddle_radius,
                min(table_width - paddle_radius, target_x)
            )
            target_y = max(
                paddle_radius,
                min(center_line_y - paddle_radius, target_y)
            )
        elif puck.vy != 0:
            # Calculate intercept point - try to hit puck when it's in optimal position
            # Aim to hit puck in the upper part of AI's court for better angle
            optimal_hit_y = center_line_y * 0.3  # Upper part of AI's court
            
            # Calculate time to reach optimal hit position
            if puck.y < optimal_hit_y:
                # Puck already past optimal position, chase it
                intercept_y = puck.y
                t_intercept = 0
            else:
                intercept_y = optimal_hit_y
                t_intercept = (intercept_y - puck.y) / puck.vy if puck.vy != 0 else 0
            
            # Predict puck X position at intercept point
            predicted_x = puck.x + puck.vx * t_intercept
            
            # If puck is very close, try to hit it directly
            distance_to_puck = ((puck.x - ai_paddle.x) ** 2 + (puck.y - ai_paddle.y) ** 2) ** 0.5
            if distance_to_puck < 150:  # Close enough to hit
                # Aim slightly ahead of puck to hit it with force
                predicted_x = puck.x + puck.vx * 0.1  # Small prediction ahead
            
            target_x = max(
                paddle_radius,
                min(table_width - paddle_radius, predicted_x)
            )
            target_y = max(
                paddle_radius,
                min(center_line_y - paddle_radius, intercept_y)
            )
        else:
            # Puck not moving vertically, align with puck and try to hit it
            target_x = max(
                paddle_radius,
                min(table_width - paddle_radius, puck.x)
            )
            # Position slightly above puck to hit it downward
            target_y = max(
                paddle_radius,
                min(center_line_y - paddle_radius, puck.y - 30)
            )
    else:
        # Defensive mode: Puck moving away, position defensively
        # Predict where puck might come back
        if puck.vy > 0:
            # Puck moving down, position in center for defense
            target_x = table_width / 2
            target_y = center_line_y * 0.4  # Slightly forward in court
        else:
            # Puck moving up but not in court yet, prepare to intercept
            if puck.vy != 0:
                intercept_y = center_line_y * 0.3
                t_intercept = (intercept_y - puck.y) / puck.vy
                predicted_x = puck.x + puck.vx * t_intercept
                target_x = max(
                    paddle_radius,
                    min(table_width - paddle_radius, predicted_x)
                )
                target_y = intercept_y
            else:
                target_x = table_width / 2
                target_y = center_line_y / 2
    
    # Apply difficulty modifiers - make easy actually easy!
    difficulty_config = {
        "easy": {
            "speed_multiplier": 0.4,  # Much slower - was 0.6
            "noise_range": 50.0,  # More error - was 30.0
            "reaction_delay": 0.2,  # Slower reaction - was 0.1
            "human_like_variation": 40.0,  # More variation - was 20.0
            "aggression": 0.6,  # Less aggressive
        },
        "medium": {
            "speed_multiplier": 0.7,  # Moderate speed - was 0.85
            "noise_range": 20.0,  # Some error - was 10.0
            "reaction_delay": 0.1,  # Moderate reaction - was 0.05
            "human_like_variation": 20.0,  # Some variation - was 12.0
            "aggression": 0.85,  # Moderate aggression
        },
        "hard": {
            "speed_multiplier": 1.0,  # Full speed
            "noise_range": 5.0,  # Minimal error - was 2.0
            "reaction_delay": 0.0,  # Instant reaction
            "human_like_variation": 8.0,  # Less variation - was 5.0
            "aggression": 1.0,  # Full aggression
        },
    }
    
    config = difficulty_config[state.difficulty]
    
    # Apply speed multiplier to target (slower AI moves slower)
    # This affects how fast AI paddle moves, not just noise
    import random
    
    # Add human-like noise (random error) - more variation for realism
    noise = random.uniform(-config["noise_range"], config["noise_range"])
    human_variation = random.uniform(-config["human_like_variation"], config["human_like_variation"])
    
    # Apply noise and variation
    target_x += noise + human_variation * 0.3
    
    # For easy mode, make AI less aggressive - sometimes miss optimal position
    if state.difficulty == "easy" and random.random() < 0.3:  # 30% chance to be less accurate
        target_x += random.uniform(-30, 30)
    
    # Clamp final target to table bounds
    target_x = max(
        paddle_radius,
        min(table_width - paddle_radius, target_x)
    )
    
    return target_x, target_y


def model_based_ai(state: GameState) -> Tuple[float, float]:
    """
    Model-based AI stub.
    
    TODO: Replace with actual ML model inference:
    1. Convert game state to feature vector
    2. Load PyTorch/ONNX model
    3. Run inference
    4. Convert output to target position
    
    For now, falls back to rule-based AI.
    """
    # Stub implementation - currently uses rule-based
    # In production, this would:
    # - Convert state to feature vector (normalized positions, velocities, etc.)
    # - Load trained model: model = torch.load('ai_model.pth')
    # - Run inference: target = model(feature_vector)
    # - Return target position
    
    return rule_based_ai(state)


def compute_ai_move(state: GameState) -> AiResponse:
    """
    Main entry point for AI move computation.
    Routes to rule-based or model-based AI based on state.ai_mode.
    """
    if state.ai_mode == "model_based":
        target_x, target_y = model_based_ai(state)
    else:
        target_x, target_y = rule_based_ai(state)
    
    return AiResponse(target_x=target_x, target_y=target_y)

