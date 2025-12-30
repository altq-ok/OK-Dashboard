import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS to allow an access from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

CACHE_DIR = "~/Documents/Dev/TypeScript/shared/Cache"

@app.get("/api/health")
async def health_check():
    return {"message": "Hello from Python API!"}