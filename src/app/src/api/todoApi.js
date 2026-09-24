/**
 * API service for communicating with the Django TODO backend.
 * Abstraction layer to isolate network requests from UI components.
 */

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

  // Normalize response data: ensure it is always returned as an array
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.todos)) {
    return data.todos;
  }
  return [];
}

/**
 * Create a new TODO item on the backend.
 * @param {string} description - The description of the TODO.
 * @returns {Promise<Object>} The created todo item.
 */
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

/**
 * Delete a TODO item on the backend.
 * @param {string} id - The ID of the TODO to delete.
 * @returns {Promise<boolean>}
 */
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

/**
 * Update an existing TODO item description on the backend.
 * @param {string} id - The ID of the TODO.
 * @param {string} description - The new description.
 * @returns {Promise<Object>}
 */
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


