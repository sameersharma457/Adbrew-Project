import React, { useState } from 'react';

/**
 * TodoForm component handles user input for creating a new TODO item.
 * Implements controlled inputs, validation, and submission states.
 */
export function TodoForm({ onSubmit, submitting, submitError, clearSubmitError }) {
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setDescription(e.target.value);
    if (localError) setLocalError('');
    if (submitError && clearSubmitError) clearSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = description.trim();
    if (!trimmed) {
      setLocalError('Please enter a TODO description.');
      return;
    }

    const success = await onSubmit(trimmed);
    if (success) {
      setDescription('');
      setLocalError('');
    }
  };

  const errorMessage = localError || submitError;

  return (
    <div className="todo-form-container">
      <h1>Create a ToDo</h1>
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="form-group">
          <label htmlFor="todo">ToDo: </label>
          <input
            id="todo"
            name="todo"
            type="text"
            placeholder="What needs to be done?"
            value={description}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="off"
            className="todo-input"
          />
        </div>

        {errorMessage && (
          <div className="form-error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <div style={{ marginTop: '5px' }}>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add ToDo!'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TodoForm;
