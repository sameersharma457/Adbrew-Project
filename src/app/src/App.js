import React from 'react';
import './App.css';
import { useTodos } from './hooks/useTodos';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';

/**
 * Main application component.
 * Integrates TodoList and TodoForm components driven by the useTodos hook.
 */
export function App() {
  const {
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
  } = useTodos();

  return (
    <div className="App">
      <main className="todo-app-card">
        <TodoList
          todos={todos}
          loading={loading}
          error={error}
          onRetry={fetchTodos}
          onEdit={editTodo}
          onDelete={deleteTodo}
        />
        <TodoForm
          onSubmit={addTodo}
          submitting={submitting}
          submitError={submitError}
          clearSubmitError={setSubmitError}
        />
      </main>
    </div>
  );
}

export default App;
