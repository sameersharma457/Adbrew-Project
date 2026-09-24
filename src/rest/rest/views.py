from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging, os
from pymongo import MongoClient

from .repository import MongoTodoRepository
from .services import TodoService, ValidationError

logger = logging.getLogger(__name__)

mongo_host = os.environ.get("MONGO_HOST", "mongo")
mongo_port = os.environ.get("MONGO_PORT", "27017")
mongo_uri = f"mongodb://{mongo_host}:{mongo_port}"

db = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)['test_db']

todo_repository = MongoTodoRepository(db)
todo_service = TodoService(todo_repository)


class TodoListView(APIView):

    def get(self, request):
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

    def put(self, request, todo_id=None):
        target_id = todo_id or request.query_params.get('id') or (request.data.get('id') if isinstance(request.data, dict) else None)
        try:
            updated_todo = todo_service.update_todo(target_id, request.data)
            return Response(updated_todo, status=status.HTTP_200_OK)
        except ValidationError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.error(f"Error handling PUT /todos: {exc}", exc_info=True)
            return Response(
                {"error": "Failed to update TODO item in database."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, todo_id=None):
        target_id = todo_id or request.query_params.get('id') or (request.data.get('id') if isinstance(request.data, dict) else None)
        try:
            success = todo_service.delete_todo(target_id)
            if success:
                return Response({"message": "TODO deleted successfully."}, status=status.HTTP_200_OK)
            return Response({"error": "TODO item not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.error(f"Error handling DELETE /todos: {exc}", exc_info=True)
            return Response(
                {"error": "Failed to delete TODO item."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
