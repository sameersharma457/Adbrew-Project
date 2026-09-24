from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging, os
from pymongo import MongoClient

from .repository import MongoTodoRepository
from .services import TodoService, ValidationError

logger = logging.getLogger(__name__)

# MongoDB connection configuration with fallbacks for development flexibility
mongo_host = os.environ.get("MONGO_HOST", "mongo")
mongo_port = os.environ.get("MONGO_PORT", "27017")
mongo_uri = f"mongodb://{mongo_host}:{mongo_port}"

# Maintain existing 'db' instance as specified in assignment requirements
db = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)['test_db']

# Dependency injection: instantiate repository and service
todo_repository = MongoTodoRepository(db)
todo_service = TodoService(todo_repository)


class TodoListView(APIView):
    """
    API endpoint for listing and creating Todo items.
    Follows RESTful conventions and clean separation of concerns.
    """

    def get(self, request):
        """
        GET /todos/
        Returns a list of all TODO items from MongoDB.
        """
        try:
            todos = todo_service.get_all_todos()
            return Response(todos, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.error(f"Error handling GET /todos: {exc}", exc_info=True)
            return Response(
                {"error": "Failed to retrieve TODO items from database."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        POST /todos/
        Accepts a TODO item and persists it into MongoDB.
        """
        try:
            created_todo = todo_service.create_todo(request.data)
            return Response(created_todo, status=status.HTTP_201_CREATED)
        except ValidationError as val_err:
            logger.warning(f"Validation error in POST /todos: {val_err}")
            return Response(
                {"error": str(val_err)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as exc:
            logger.error(f"Error handling POST /todos: {exc}", exc_info=True)
            return Response(
                {"error": "Failed to create TODO item in database."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
