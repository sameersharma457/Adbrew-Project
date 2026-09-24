import React from 'react';

/**
 * TodoItem component represents an individual TODO entry in the list.
 */
export function TodoItem({ todo }) {
  // Support both object format { id, description } and plain string format
  const description = typeof todo === 'string' ? todo : (todo.description || todo.todo || todo.title || '');

  return (
    <li className="todo-item">
      <span className="todo-text">{description}</span>
    </li>
  );
}

export default TodoItem;
