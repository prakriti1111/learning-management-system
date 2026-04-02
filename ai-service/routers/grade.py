from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import threading

router = APIRouter()

_model = None
_lock  = threading.Lock()

def get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                from sentence_transformers import SentenceTransformer
                # Downloads ~420MB multilingual model on first run
                # Supports: Hindi, English, Tamil, Telugu, Bengali + 40 more languages
                _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model

class GradeRequest(BaseModel):
    studentAnswer: str
    correctAnswer: str
    subject:       Optional[str] = "general"

@router.post("")
async def grade(req: GradeRequest):
    student = req.studentAnswer.strip()
    correct = req.correctAnswer.strip()

    if not student:
        return {"isCorrect": False, "confidence": 0.0, "feedback": "Please write an answer first! ✏️"}

    # Fast exact match
    if student.lower() == correct.lower():
        return {"isCorrect": True, "confidence": 1.0, "feedback": "Perfect answer! ⭐"}

    try:
        model = get_model()
        from sentence_transformers import util
        emb_s = model.encode(student, convert_to_tensor=True)
        emb_c = model.encode(correct, convert_to_tensor=True)
        score = float(util.cos_sim(emb_s, emb_c))
        is_correct = score >= 0.70
        if score >= 0.85:   feedback = "Excellent! You really understand this! 🌟"
        elif score >= 0.70: feedback = "Great job! That is correct! 🎉"
        elif score >= 0.55: feedback = "You are on the right track! Almost there. Try again."
        elif score >= 0.40: feedback = "Getting closer! Think about it a bit more."
        else:               feedback = "Hmm, not quite. Let us try again — you can do it! 💪"
        return {"isCorrect": is_correct, "confidence": round(score, 3), "feedback": feedback}
    except Exception as e:
        # Fallback if model not loaded
        is_correct = student.lower() == correct.lower()
        return {"isCorrect": is_correct, "confidence": 1.0 if is_correct else 0.0, "feedback": "Answer checked!"}