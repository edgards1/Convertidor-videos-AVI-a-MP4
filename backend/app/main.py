import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.convert import router as convert_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s"
)

app = FastAPI(title="SSD AVI to MP4 Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(convert_router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}
