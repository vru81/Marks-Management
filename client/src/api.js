const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status);
  }

  return data;
}

export function registerTeacher(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginTeacher(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getCurrentTeacher(token) {
  return request('/api/auth/me', {
    headers: authHeaders(token)
  });
}

export function getAssignableStudents(token, assignment, subject) {
  const params = new URLSearchParams({
    class: assignment.class,
    division: assignment.division,
    subject
  });

  return request(`/api/me/students?${params.toString()}`, {
    headers: authHeaders(token)
  });
}

export function getMarks(token, assignment, subject) {
  const params = new URLSearchParams({
    class: assignment.class,
    division: assignment.division,
    subject
  });

  return request(`/api/me/marks?${params.toString()}`, {
    headers: authHeaders(token)
  });
}

export function saveMark(token, payload) {
  return request('/api/me/marks', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
