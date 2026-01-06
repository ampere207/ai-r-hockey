from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Air Hockey Backend",
    description="FastAPI backend for AI Air Hockey game",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"message": "AI Air Hockey Backend API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

