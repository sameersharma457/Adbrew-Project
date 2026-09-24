

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetch all TODO items from the backend.
 * @returns {Promise<Array>} Array of todo objects.
 */
export async function getTodos() {
  const response = await fetch(`${API_BASE_URL}/todos/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch todos: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.todos)) {
    return data.todos;
  }
  return [];
}


export async function createTodo(description) {
  const response = await fetch(`${API_BASE_URL}/todos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create todo: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}


export async function deleteTodo(id) {
  const response = await fetch(`${API_BASE_URL}/todos/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete todo: ${response.status} ${response.statusText}`);
  }

  return true;
}


export async function updateTodo(id, description) {
  const response = await fetch(`${API_BASE_URL}/todos/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update todo: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}


