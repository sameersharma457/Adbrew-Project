import React, { useState } from 'react';


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
                className="action-btn edit-icon-btn"
                title="Edit this TODO"
                aria-label="Edit"
                onClick={() => {
                  setEditText(description);
                  setIsEditing(true);
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            )}
            {id && onDelete && (
              <button
                type="button"
                className="action-btn delete-icon-btn"
                title="Delete this TODO"
                aria-label="Delete"
                onClick={() => onDelete(id)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
