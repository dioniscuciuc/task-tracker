const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('lattice-board-token')

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      throw new Error(payload?.message || 'Request failed.')
    }

    return payload
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('The app could not reach the server. Start the backend and try again.')
    }

    throw error
  }
}

export const api = {
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getProjects: () => request('/projects'),
  createProject: (name) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteProject: (name) =>
    request(`/projects/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),
  getTasks: () => request('/tasks'),
  createTask: (task) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  updateTask: (taskId, updates) =>
    request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
}
