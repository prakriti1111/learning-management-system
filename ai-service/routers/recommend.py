from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ProgressDoc(BaseModel):
    skillNodeId:   str
    masteryScore:  float = 0.0
    nextReviewAt:  Optional[str] = None
    difficulty:    int = 1
    correctStreak: int = 0
    sm2Interval:   int = 1
    sm2EaseFactor: float = 2.5

class RecommendRequest(BaseModel):
    studentId:    str
    progressDocs: List[ProgressDoc] = []

def get_target_difficulty(mastery: float, current_diff: int) -> int:
    if mastery < 0.40: return max(1, current_diff - 1)
    if mastery > 0.75: return min(5, current_diff + 1)
    return current_diff

@router.post("")
async def recommend(req: RecommendRequest):
    now_ms = datetime.utcnow().timestamp() * 1000
    due, zpd = [], []
    for p in req.progressDocs:
        next_ms = 0
        if p.nextReviewAt:
            try:
                dt = datetime.fromisoformat(p.nextReviewAt.replace("Z", "+00:00"))
                next_ms = dt.timestamp() * 1000
            except Exception:
                pass
        if next_ms and next_ms <= now_ms:
            due.append(p)
        elif 0.35 <= p.masteryScore < 0.78:
            zpd.append(p)

    target, reason = None, "new"
    if due:
        target = sorted(due, key=lambda x: x.masteryScore)[0]
        reason = "review"
    elif zpd:
        target = sorted(zpd, key=lambda x: -x.masteryScore)[0]
        reason = "zpd"

    return {
        "reason": reason,
        "targetSkillNodeId":  target.skillNodeId if target else None,
        "targetDifficulty":   get_target_difficulty(target.masteryScore, target.difficulty) if target else 1,
        "currentMastery":     target.masteryScore if target else 0.0,
    }