from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from schemas import GameState, AiResponse
from models.ai import compute_ai_move
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/move", response_model=AiResponse)
async def ai_move(state: GameState) -> AiResponse:
    """
    HTTP endpoint for AI move computation.
    Receives current game state and returns target position for AI paddle.
    """
    response = compute_ai_move(state)
    return response


@router.websocket("/ws")
async def websocket_ai(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AI updates.
    Receives game state JSON messages and streams back AI target positions.
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive game state from client
            data = await websocket.receive_text()
            
            try:
                # Parse JSON to GameState
                state_dict = json.loads(data)
                state = GameState(**state_dict)
                
                # Compute AI move
                response = compute_ai_move(state)
                
                # Send response back
                await websocket.send_json({
                    "target_x": response.target_x,
                    "target_y": response.target_y,
                })
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await websocket.send_json({
                    "error": str(e)
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

