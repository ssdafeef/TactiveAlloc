from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Construction Equipment Allocation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import api
app.include_router(api.router)

@app.on_event("startup")
def seed_default_users_on_startup():
    try:
        import seed
        seed.seed_db()
    except Exception as exc:
        print(f"Startup seed skipped: {exc}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Equipment Allocation API is running"}
