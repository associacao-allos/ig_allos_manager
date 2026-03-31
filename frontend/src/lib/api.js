const BASE = '/api';

function getAuthHeader() {
  const creds = localStorage.getItem('allos_credentials');
  if (!creds) return {};
  return { Authorization: `Basic ${creds}` };
}

export function setCredentials(username, password) {
  const encoded = btoa(`${username}:${password}`);
  localStorage.setItem('allos_credentials', encoded);
  localStorage.setItem('allos_user', username);
}

export function getUser() {
  return localStorage.getItem('allos_user');
}

export function logout() {
  localStorage.removeItem('allos_credentials');
  localStorage.removeItem('allos_user');
}

export function isLoggedIn() {
  return !!localStorage.getItem('allos_credentials');
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    logout();
    window.location.reload();
    throw new Error('Não autorizado');
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  listPosts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') query.set(k, v);
    });
    const qs = query.toString();
    return request(`/posts${qs ? `?${qs}` : ''}`);
  },
  getPost: (id) => request(`/posts/${id}`),
  createPost: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id, data) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) => request(`/posts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
