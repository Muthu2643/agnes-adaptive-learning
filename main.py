import os
import sys
from fastapi.middleware.cors import CORSMiddleware

# Add the backend directory to Python's module path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import your real application
from app.main import app

# Ensure CORS allows your Vercel frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)