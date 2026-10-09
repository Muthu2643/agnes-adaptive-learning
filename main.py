from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This block allows your frontend to talk to your backend safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # The "*" allows requests from ANY url (great for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello World"}