import logging
from typing import List, Dict, Any
from .repository import TodoRepositoryInterface

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Raised when request data fails business validation rules."""
    pass


class TodoService:
    """
    Business logic layer for Todo operations.
    Follows Single Responsibility Principle (SRP) and Open-Closed Principle (OCP).
    Uses Dependency Injection to accept any repository implementing TodoRepositoryInterface.
    """

    def __init__(self, repository: TodoRepositoryInterface):
        self.repository = repository

    def get_all_todos(self) -> List[Dict[str, Any]]:
        """
        Retrieve all todos from the underlying repository.
        """
        logger.info("Fetching all todos via TodoService")
        return self.repository.get_all()

    def create_todo(self, payload: Any) -> Dict[str, Any]:
        """
        Validate and create a new todo.
        Accepts dict or raw string payload.
        """
        description = None

        if isinstance(payload, dict):
            # Gracefully support multiple common field names: 'description', 'todo', 'title'
            description = payload.get('description') or payload.get('todo') or payload.get('title')
        elif isinstance(payload, str):
            description = payload

        if not description or not isinstance(description, str) or not description.strip():
            logger.warning(f"Invalid todo creation attempt with payload: {payload}")
            raise ValidationError("TODO description cannot be empty.")

        description = description.strip()
        if len(description) > 500:
            raise ValidationError("TODO description cannot exceed 500 characters.")

        logger.info(f"Creating todo: '{description}'")
        return self.repository.create(description)

    def delete_todo(self, todo_id: Any) -> bool:
        """
        Validate ID and delete a todo.
        """
        if not todo_id or not isinstance(todo_id, str) or not todo_id.strip():
            raise ValidationError("A valid TODO ID is required for deletion.")
        logger.info(f"Deleting todo with ID: {todo_id}")
        return self.repository.delete(todo_id.strip())
