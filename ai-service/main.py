"""
LearnBright AI Microservice
Run: uvicorn main:app --reload --port 8000
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import chat, recommend, grade, transcribe, summarise

app = FastAPI(title="LearnBright AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,       prefix="/chat",       tags=["chatbot"])
app.include_router(recommend.router,  prefix="/recommend",  tags=["recommender"])
app.include_router(grade.router,      prefix="/grade",      tags=["grader"])
app.include_router(transcribe.router, prefix="/transcribe", tags=["voice"])
app.include_router(summarise.router,  prefix="/summarise",  tags=["reports"])

@app.get("/health")
def health():
    return {"status": "ok"}