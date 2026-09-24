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


    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def create(self, description: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update(self, todo_id: str, description: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete(self, todo_id: str) -> bool:
        pass


class MongoTodoRepository(TodoRepositoryInterface):


    def __init__(self, db: Database, collection_name: str = 'todos'):
        self.db = db
        self.collection: Collection = db[collection_name]

    @staticmethod
    def _serialize_todo(doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": str(doc.get("_id")),
            "description": doc.get("description", ""),
            "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
            "completed": doc.get("completed", False)
        }

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            cursor = self.collection.find().sort("created_at", 1)
            todos = [self._serialize_todo(doc) for doc in cursor]
            return todos
        except PyMongoError as exc:
            logger.error(f"Error fetching todos from MongoDB: {exc}", exc_info=True)
            raise

    def create(self, description: str) -> Dict[str, Any]:
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

    def update(self, todo_id: str, description: str) -> Optional[Dict[str, Any]]:
        try:
            result = self.collection.find_one_and_update(
                {"_id": ObjectId(todo_id)},
                {"$set": {"description": description.strip(), "updated_at": datetime.utcnow()}},
                return_document=True
            )
            if result:
                return self._serialize_todo(result)
            return None
        except Exception as exc:
            logger.error(f"Error updating todo {todo_id} in MongoDB: {exc}", exc_info=True)
            raise

    def delete(self, todo_id: str) -> bool:
        try:
            result = self.collection.delete_one({"_id": ObjectId(todo_id)})
            return result.deleted_count > 0
        except Exception as exc:
            logger.error(f"Error deleting todo from MongoDB: {exc}", exc_info=True)
            raise
