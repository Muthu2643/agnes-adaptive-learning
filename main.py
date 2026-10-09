import os
import sys
from fastapi.middleware.cors import CORSMiddleware

# Point Python to the backend directory
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import your real application routes
from app.main import app

# Allow your Vercel frontend to access these routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)