import { useState } from 'react';
import api from '../api/axios';

export function useMeetingScheduler() {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  async function scheduleMeeting({ studentId, scheduledAt, type = 'google_meet', notes = '' }) {
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await api.post('/meetings', { studentId, scheduledAt, type, notes });
      setResult(data);
      return data;
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to schedule meeting';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMeetings() {
    const { data } = await api.get('/meetings');
    return data;
  }

  async function cancelMeeting(id) {
    await api.delete(`/meetings/${id}`);
  }

  return { scheduleMeeting, fetchMeetings, cancelMeeting, loading, result, error };
}