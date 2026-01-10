from pydantic import BaseModel, Field
from typing import Literal


class Vector2(BaseModel):
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")


class PaddleState(BaseModel):
    x: float = Field(..., description="Paddle center X position")
    y: float = Field(..., description="Paddle center Y position")
    radius: float = Field(..., description="Paddle radius (circular paddles)")


class PuckState(BaseModel):
    x: float = Field(..., description="Puck center X position")
    y: float = Field(..., description="Puck center Y position")
    vx: float = Field(..., description="Puck velocity X component")
    vy: float = Field(..., description="Puck velocity Y component")
    radius: float = Field(..., description="Puck radius")


class GameState(BaseModel):
    puck: PuckState = Field(..., description="Current puck state")
    human_paddle: PaddleState = Field(..., description="Human player paddle state")
    ai_paddle: PaddleState = Field(..., description="AI paddle state")
    table_width: float = Field(..., description="Table width")
    table_height: float = Field(..., description="Table height")
    difficulty: Literal["easy", "medium", "hard"] = Field(
        default="medium", description="AI difficulty level"
    )
    ai_mode: Literal["rule_based", "model_based"] = Field(
        default="rule_based", description="AI mode"
    )


class AiResponse(BaseModel):
    target_x: float = Field(..., description="Target X position for AI paddle center")
    target_y: float = Field(..., description="Target Y position for AI paddle center")

