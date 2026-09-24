import React from 'react';
import TodoItem from './TodoItem';

/**
 * TodoList component renders the collection of todos.
 * Handles loading, error, empty, and populated list states.
 */
export function TodoList({ todos, loading, error, onRetry, onDelete }) {
  return (
    <div className="todo-list-container">
      <h1>List of TODOs</h1>

      {loading && todos.length === 0 && (
        <div className="todo-status loading-text">Loading TODOs...</div>
      )}

      {error && (
        <div className="todo-status error-banner">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && !error && todos.length === 0 && (
        <p className="empty-message">No TODOs found. Add one below!</p>
      )}

      <ul className="todo-list">
        {todos.map((todo, index) => {
          const key = (typeof todo === 'object' && todo.id) ? todo.id : (todo._id || index);
          return <TodoItem key={key} todo={todo} onDelete={onDelete} />;
        })}
      </ul>
    </div>
  );
}

export default TodoList;
