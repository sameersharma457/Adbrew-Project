import React, { useState } from 'react';

/**
 * TodoItem component represents an individual TODO entry in the list.
 * Supports viewing, inline editing, and deletion.
 */
export function TodoItem({ todo, onEdit, onDelete }) {
  const description = typeof todo === 'string' ? todo : (todo.description || todo.todo || todo.title || '');
  const id = typeof todo === 'object' ? (todo.id || todo._id) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(description);

  const handleSave = async () => {
    if (!editText.trim()) return;
    if (onEdit && id) {
      await onEdit(id, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(description);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={`todo-item ${isEditing ? 'editing' : ''}`}>
      {isEditing ? (
        <div className="todo-edit-mode">
          <input
            type="text"
            className="todo-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="todo-edit-actions">
            <button type="button" className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="todo-text">{description}</span>
          <div className="todo-item-actions">
            {id && onEdit && (
              <button
                type="button"
                className="edit-todo-btn"
                title="Edit TODO"
                onClick={() => {
                  setEditText(description);
                  setIsEditing(true);
                }}
              >
                ✏️
              </button>
            )}
            {id && onDelete && (
              <button
                type="button"
                className="delete-todo-btn"
                title="Delete TODO"
                onClick={() => onDelete(id)}
              >
                🗑️
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
