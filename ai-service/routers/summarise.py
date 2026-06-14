
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os, json
from openai import OpenAI

router = APIRouter()

class SummariseRequest(BaseModel):
    childName:        str
    age:              int = 9
    gradeLevel:       int = 3
    strongAreas:      List[str] = []
    weakAreas:        List[str] = []
    sessionsThisWeek: int = 0
    avgScore:         int = 0
    achievements:     List[str] = []
    language:         str = "en"

@router.post("")
async def summarise(req: SummariseRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"summary": f"{req.childName} is working hard this week!", "tips": [], "encouragement": "Keep it up!"}
    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        lang_label = "Hindi" if req.language == "hi" else "English"
        strong_str = ", ".join(req.strongAreas) if req.strongAreas else "still exploring"
        weak_str   = ", ".join(req.weakAreas)   if req.weakAreas   else "nothing specific"
        ach_str    = ", ".join(req.achievements) if req.achievements else "none this week"

        prompt = f"""Write a warm weekly learning report in {lang_label} for a parent.

Child: {req.childName}, Age: {req.age}, Grade: {req.gradeLevel}
Strong subjects: {strong_str}
Needs work on: {weak_str}
Sessions this week: {req.sessionsThisWeek}
Average score: {req.avgScore}%
Achievements: {ach_str}

Respond with ONLY valid JSON (no markdown, no backticks, no extra text):
{{"summary":"2-3 warm parent-friendly sentences","tips":["practical home tip 1","tip 2","tip 3"],"encouragement":"one warm sentence"}}"""

        res = client.chat.completions.create(
            model="llama-3.1-8b-instant", max_tokens=500, temperature=0.65,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = res.choices[0].message.content.strip()
        raw = raw.replace("```json","").replace("```","").strip()
        parsed = json.loads(raw)
        return {"summary": parsed.get("summary",""), "tips": parsed.get("tips",[]), "encouragement": parsed.get("encouragement","")}
    except json.JSONDecodeError:
        return {"summary": raw, "tips": [], "encouragement": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
