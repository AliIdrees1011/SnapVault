import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


# ── Auto-seed default accounts on startup ─────────────────────────
def seed_defaults():
    """Creates default creator + consumer accounts if they don't exist."""
    try:
        from services import cosmos_service as db
        from passlib.context import CryptContext
        from datetime import datetime
        pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

        # Default CREATOR account
        if not db.user_by_email("creator@snapvault.com"):
            db.create_user({
                "id":            "default-creator-001",
                "username":      "Creator",
                "email":         "creator@snapvault.com",
                "password_hash": pwd.hash("Creator123!"),
                "role":          "creator",
                "created_at":    datetime.utcnow().isoformat()
            })
            print("✓ Default creator account created")

        # Default CONSUMER account
        if not db.user_by_email("consumer@snapvault.com"):
            db.create_user({
                "id":            "default-consumer-001",
                "username":      "Consumer",
                "email":         "consumer@snapvault.com",
                "password_hash": pwd.hash("Consumer123!"),
                "role":          "consumer",
                "created_at":    datetime.utcnow().isoformat()
            })
            print("✓ Default consumer account created")

    except Exception as e:
        print(f"Seed warning: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_defaults()   # runs once when app starts on Azure
    yield


# ── App ────────────────────────────────────────────────────────────
from routes import auth, photos, comments

app = FastAPI(
    title="SnapVault API",
    description="COM769 — Scalable Cloud-Native Photo Sharing",
    version="1.0.0",
    lifespan=lifespan
)

_raw     = os.getenv("ALLOWED_ORIGINS", "*")
_origins = [o.strip() for o in _raw.split(",")] if _raw != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(photos.router,   prefix="/photos",   tags=["Photos"])
app.include_router(comments.router, prefix="/comments", tags=["Comments"])

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "SnapVault API", "version": "1.0.0"}
