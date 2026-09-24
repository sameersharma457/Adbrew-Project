import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)


class TodoRepositoryInterface(ABC):
    """
    Abstract interface for Todo data persistence.
    Follows Dependency Inversion Principle (DIP) to decouple business logic from storage implementation.
    """

    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]:
        """Retrieve all todos."""
        pass

    @abstractmethod
    def create(self, description: str) -> Dict[str, Any]:
        """Create and persist a new todo."""
        pass


class MongoTodoRepository(TodoRepositoryInterface):
    """
    MongoDB implementation of the TodoRepositoryInterface.
    Encapsulates all database queries and Mongo-specific data transformations.
    """

    def __init__(self, db: Database, collection_name: str = 'todos'):
        self.db = db
        self.collection: Collection = db[collection_name]

    @staticmethod
    def _serialize_todo(doc: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert MongoDB document to a JSON-serializable dictionary.
        Maps MongoDB's `_id` to a string `id`.
        """
        return {
            "id": str(doc.get("_id")),
            "description": doc.get("description", ""),
            "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
            "completed": doc.get("completed", False)
        }

    def get_all(self) -> List[Dict[str, Any]]:
        """
        Fetch all todos sorted by created_at in ascending order (or descending).
        """
        try:
            cursor = self.collection.find().sort("created_at", 1)
            todos = [self._serialize_todo(doc) for doc in cursor]
            return todos
        except PyMongoError as exc:
            logger.error(f"Error fetching todos from MongoDB: {exc}", exc_info=True)
            raise

    def create(self, description: str) -> Dict[str, Any]:
        """
        Insert a new todo document into MongoDB and return the serialized document.
        """
        try:
            todo_document = {
                "description": description.strip(),
                "completed": False,
                "created_at": datetime.utcnow()
            }
            result = self.collection.insert_one(todo_document)
            todo_document["_id"] = result.inserted_id
            return self._serialize_todo(todo_document)
        except PyMongoError as exc:
            logger.error(f"Error creating todo in MongoDB: {exc}", exc_info=True)
            raise
