import React from 'react';

/**
 * TodoItem component represents an individual TODO entry in the list.
 */
export function TodoItem({ todo, onDelete }) {
  const description = typeof todo === 'string' ? todo : (todo.description || todo.todo || todo.title || '');
  const id = typeof todo === 'object' ? (todo.id || todo._id) : null;

  return (
    <li className="todo-item">
      <span className="todo-text">{description}</span>
      {id && onDelete && (
        <button
          type="button"
          className="delete-todo-btn"
          title="Delete TODO"
          onClick={() => onDelete(id)}
        >
          ✕
        </button>
      )}
    </li>
  );
}

export default TodoItem;
