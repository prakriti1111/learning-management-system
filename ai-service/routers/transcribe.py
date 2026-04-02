from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64, tempfile, os, threading

router = APIRouter()

_whisper = None
_lock    = threading.Lock()

def get_whisper():
    global _whisper
    if _whisper is None:
        with _lock:
            if _whisper is None:
                import whisper
                # 'small' model = 244MB, good accuracy for Indian languages
                # Options: tiny(75MB), base(142MB), small(244MB), medium(769MB)
                _whisper = whisper.load_model("small")
    return _whisper

LANG_MAP = {"hi":"hi","en":"en","ta":"ta","te":"te","bn":"bn"}

class TranscribeRequest(BaseModel):
    audioBase64: str
    language:    str = "hi"

@router.post("")
async def transcribe(req: TranscribeRequest):
    try:
        audio_bytes = base64.b64decode(req.audioBase64)
        lang        = LANG_MAP.get(req.language, "hi")
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            model  = get_whisper()
            result = model.transcribe(tmp_path, language=lang, fp16=False)
            return {"transcript": result["text"].strip(), "language": result.get("language", lang)}
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
