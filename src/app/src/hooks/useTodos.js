import { useState, useEffect, useCallback } from 'react';
import { getTodos, createTodo as apiCreateTodo } from '../api/todoApi';

/**
 * Custom React Hook for managing TODO state, operations, and lifecycle.
 * Encapsulates data fetching, optimistic UI updates, loading states, and error handling.
 */
export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err.message || 'Failed to load TODOs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Submit new todo and refresh the list
  const addTodo = useCallback(async (description) => {
    if (!description || !description.trim()) {
      setSubmitError('Please enter a TODO description.');
      return false;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await apiCreateTodo(description.trim());
      // Re-fetch todos from backend to reflect MongoDB state
      await fetchTodos();
      return true;
    } catch (err) {
      console.error('Error creating todo:', err);
      setSubmitError(err.message || 'Failed to create TODO. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    submitting,
    submitError,
    setSubmitError,
    fetchTodos,
    addTodo,
  };
}
