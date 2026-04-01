import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export function useAdaptiveLesson() {
  const [lesson,    setLesson]    = useState(null);
  const [reason,    setReason]    = useState('new');
  const [loading,   setLoading]   = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { data: session } = await api.post('/progress/session/start');
        if (!cancelled) setSessionId(session._id);
        const { data } = await api.get('/ai/recommend');
        if (!cancelled) { setLesson(data.lesson); setReason(data.reason || 'new'); }
      } catch (e) {
        console.error('useAdaptiveLesson init error:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  async function submitAttempt({ correct, timeTakenMs, audioUsed, answer }) {
    if (!lesson) return {};
    const { data } = await api.post('/progress/attempt', {
      lessonId:    lesson._id,
      skillNodeId: lesson.skillNodeId,
      correct:     !!correct,
      timeTakenMs: timeTakenMs || 0,
      audioUsed:   !!audioUsed,
      answer:      answer || '',
      sessionId,
    });
    try {
      const next = await api.get('/ai/recommend');
      setLesson(next.data.lesson);
      setReason(next.data.reason || 'new');
    } catch {}
    return data;
  }

  async function endSession() {
    if (sessionId) {
      try { await api.post(`/progress/session/${sessionId}/end`); } catch {}
    }
  }

  return { lesson, reason, loading, sessionId, submitAttempt, endSession };
}