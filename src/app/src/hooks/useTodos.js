import { useState, useEffect, useCallback } from 'react';
import {
  getTodos,
  createTodo as apiCreateTodo,
  deleteTodo as apiDeleteTodo,
  updateTodo as apiUpdateTodo
} from '../api/todoApi';


export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (description) => {
    if (!description || !description.trim()) {
      setSubmitError('Please enter a TODO description.');
      return false;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await apiCreateTodo(description.trim());
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

  const editTodo = useCallback(async (id, newDescription) => {
    if (!newDescription || !newDescription.trim()) {
      return false;
    }
    try {
      await apiUpdateTodo(id, newDescription.trim());
      await fetchTodos();
      return true;
    } catch (err) {
      console.error('Error editing todo:', err);
      setError(err.message || 'Failed to update TODO.');
      return false;
    }
  }, [fetchTodos]);

  const deleteTodo = useCallback(async (id) => {
    try {
      await apiDeleteTodo(id);
      await fetchTodos();
      return true;
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err.message || 'Failed to delete TODO.');
      return false;
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
    editTodo,
    deleteTodo,
  };
}

export default useTodos;
