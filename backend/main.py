import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from routes.posts import router as posts_router

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="Allos Editorial", version="1.0.0")

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
security = HTTPBasic()
AUTH_USERS = {
    "victor": os.getenv("AUTH_USER_VICTOR", ""),
    "arthur": os.getenv("AUTH_USER_ARTHUR", ""),
}


def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    expected_password = AUTH_USERS.get(credentials.username)
    if not expected_password or not secrets.compare_digest(
        credentials.password.encode(), expected_password.encode()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Posts routes (protected)
app.include_router(posts_router, dependencies=[Depends(verify_credentials)])

# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(frontend_dist / "index.html"))
