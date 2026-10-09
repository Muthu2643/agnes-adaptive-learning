import os
import sys
import uvicorn

backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app

if __name__ == "__main__":
    print("=" * 65)
    print("Starting Agnes 3.0 Flash Educational Platform...")
    print("Functional Website URL: http://localhost:8000")
    print("Interactive API Documentation: http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run(app, host="127.0.0.1", port=8000)
