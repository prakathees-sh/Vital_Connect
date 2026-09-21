from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import (
    auth, districts, donors, requests,
    chain_rescue, inventory, chat, certificates,
    ml, admin, notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all database tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Emergency Blood Coordination Platform for Tamil Nadu",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For seamless development and local Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under API v1
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(districts.router, prefix=api_v1)
app.include_router(donors.router, prefix=api_v1)
app.include_router(requests.router, prefix=api_v1)
app.include_router(chain_rescue.router, prefix=api_v1)
app.include_router(inventory.router, prefix=api_v1)
app.include_router(chat.router, prefix=api_v1)
app.include_router(certificates.router, prefix=api_v1)
app.include_router(ml.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)
app.include_router(notifications.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Connecting people, hospitals, and blood sources when every second matters.",
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "vital-connect-backend"}
