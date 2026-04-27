/** HTTP client with JWT for SFMS API */

function getToken() {
  return localStorage.getItem('sfms_token');
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  const token = getToken();
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) opts.body = body;

  const resp = await fetch(path, opts);
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || 'Request error' };
  }

  if (!resp.ok) {
    const msg = data?.message || `Error ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}
