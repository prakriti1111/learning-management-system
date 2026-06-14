from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
from openai import OpenAI

router = APIRouter()

SYSTEM_PROMPT = """You are Buddy, a warm and friendly learning helper for children aged 6-12 in rural India.

RULES (always follow every single one):
- Use very simple words a 7-year-old understands. No complex vocabulary.
- Use 1-2 fun emojis per response. No more.
- Keep answers to 3-5 short sentences maximum.
- Use Indian examples: roti, cricket, mango, village, diya, bullock cart, neem tree, etc.
- For math questions: give a simple worked example with numbers.
- For science: relate to something the child can see around them.
- Always end with one short encouraging sentence.
- Never use markdown formatting, asterisks, or technical jargon.
- Respond in the same language the child writes in (Hindi or English).
- If asked something outside school subjects, gently redirect to learning."""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    language: str = "hi"

@router.post("")
async def chat(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"reply": "Hi! I am Buddy. I am not fully set up yet. Please ask your teacher for help! 🙏"}
    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        system = {"role": "system", "content": f"{SYSTEM_PROMPT}\nLanguage preference: {req.language}"}
        history = [{"role": m.role, "content": m.content} for m in req.messages[-10:]]
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=200,
            temperature=0.7,
            messages=[system] + history,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))