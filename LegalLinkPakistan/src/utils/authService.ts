// ==========================================
// IMPORTS & CONFIGURATION
// ==========================================
import axios from 'axios';

const BACKEND_BASE_URL = 'https://mug-work-public.ngrok-free.dev/api/auth';

// ==========================================
// AUTHENTICATION UTILITY HELPERS
// ==========================================
export const getAuthHeaders = (token?: string) => {
  return {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
};
