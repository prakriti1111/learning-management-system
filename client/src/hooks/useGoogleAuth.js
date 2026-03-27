import { useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useGoogleAuth({ onSuccess, onError, role = 'child' } = {}) {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Called by Google SDK after the user picks an account
  const handleCredentialResponse = useCallback(async (response) => {
    try {
      const { data } = await api.post('/auth/google', {
        credential: response.credential,
        role,
      });
      // Store token — same flow as JWT login
      localStorage.setItem('lb_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      onSuccess?.(data.user, data.token);
    } catch (err) {
      const msg = err.response?.data?.error || 'Google sign-in failed. Please try again.';
      onError?.(msg);
    }
  }, [role, onSuccess, onError]);

  // Render a Google button into a container element
  const renderGoogleButton = useCallback((container) => {
    if (!container) return;
    if (container.dataset.rendered) return;
    if (!CLIENT_ID) {
      container.innerHTML = '<p style="font-size:12px;color:#999;text-align:center">Google OAuth not configured</p>';
      return;
    }
    // Wait for Google SDK to load (it's loaded async from index.html)
    function tryInit() {
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id:         CLIENT_ID,
        callback:          handleCredentialResponse,
        auto_select:       false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(container, {
        theme:     'outline',
        size:      'large',
        width:     '250',
        text:      'continue_with',
        shape:     'rectangular',
        logo_alignment: 'left',
      });

      container.dataset.rendered = "true";
    }
    tryInit();
  }, [CLIENT_ID, handleCredentialResponse]);

  return { renderGoogleButton };
}