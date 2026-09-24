import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as todoApi from './api/todoApi';

// Mock the API layer to isolate frontend unit testing
jest.mock('./api/todoApi');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders headers and initial elements', async () => {
    todoApi.getTodos.mockResolvedValueOnce([
      { id: '1', description: 'Sample Item 1' },
      { id: '2', description: 'Sample Item 2' }
    ]);

    render(<App />);

    expect(screen.getByText(/List of TODOs/i)).toBeInTheDocument();
    expect(screen.getByText(/Create a ToDo/i)).toBeInTheDocument();
    expect(screen.getByText(/ToDo:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add ToDo!/i })).toBeInTheDocument();

    // Verify fetched todos appear
    await waitFor(() => {
      expect(screen.getByText('Sample Item 1')).toBeInTheDocument();
      expect(screen.getByText('Sample Item 2')).toBeInTheDocument();
    });
  });

  test('submitting empty input shows validation message', async () => {
    todoApi.getTodos.mockResolvedValueOnce([]);

    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /Add ToDo!/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter a TODO description/i)).toBeInTheDocument();
    expect(todoApi.createTodo).not.toHaveBeenCalled();
  });

  test('successfully submits a new todo and refreshes list', async () => {
    todoApi.getTodos
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: '101', description: 'New Todo Added' }]);
    todoApi.createTodo.mockResolvedValueOnce({ id: '101', description: 'New Todo Added' });

    render(<App />);

    const input = screen.getByPlaceholderText(/What needs to be done\?/i);
    const submitBtn = screen.getByRole('button', { name: /Add ToDo!/i });

    fireEvent.change(input, { target: { value: 'New Todo Added' } });
    expect(input.value).toBe('New Todo Added');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalledWith('New Todo Added');
      expect(screen.getByText('New Todo Added')).toBeInTheDocument();
    });
  });
});
