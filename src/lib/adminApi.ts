// Simple fetch wrapper for the Admin portal that automatically uses same-origin cookies
export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'API request failed');
    }
    return res.json();
  },
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'API request failed');
    }
    return res.json();
  },
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'API request failed');
    }
    return res.json();
  },
  patch: async (endpoint: string, body: any) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'API request failed');
    }
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'API request failed');
    }
    return res.json();
  },
};
