import { useState, useRef } from 'react';
import api from '../api/axios';

export function useVoiceInput({ language = 'hi', onTranscript } = {}) {
  const [recording,  setRecording]  = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error,      setError]      = useState(null);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec    = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current   = [];
      recorderRef.current = rec;

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const blob   = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const { data } = await api.post('/ai/transcribe', { audioBase64: base64, language });
            setTranscript(data.transcript || '');
            onTranscript?.(data.transcript || '');
          } catch {
            setError('Voice service unavailable. Please type your answer.');
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setRecording(true);
    } catch {
      setError('Microphone permission denied. Please allow microphone access.');
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return { recording, transcript, error, startRecording, stopRecording };
}