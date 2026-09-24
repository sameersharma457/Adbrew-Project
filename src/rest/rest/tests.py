from unittest.mock import MagicMock
from bson import ObjectId
from datetime import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from .repository import MongoTodoRepository, TodoRepositoryInterface
from .services import TodoService, ValidationError


class TodoServiceTestCase(TestCase):

    def setUp(self):
        self.mock_repo = MagicMock(spec=TodoRepositoryInterface)
        self.service = TodoService(self.mock_repo)

    def test_create_todo_success(self):
        self.mock_repo.create.return_value = {
            "id": "mock_id_123",
            "description": "Test Task",
            "completed": False,
            "created_at": "2026-09-24T12:00:00"
        }
        result = self.service.create_todo({"description": "  Test Task  "})
        self.mock_repo.create.assert_called_once_with("Test Task")
        self.assertEqual(result["description"], "Test Task")

    def test_create_todo_empty_description_raises(self):
        with self.assertRaises(ValidationError):
            self.service.create_todo({"description": "   "})

    def test_create_todo_none_raises(self):
        with self.assertRaises(ValidationError):
            self.service.create_todo({})

    def test_create_todo_exceeds_length_raises(self):
        long_text = "a" * 501
        with self.assertRaises(ValidationError):
            self.service.create_todo({"description": long_text})

    def test_get_all_todos(self):
        self.mock_repo.get_all.return_value = [{"id": "1", "description": "A"}]
        todos = self.service.get_all_todos()
        self.mock_repo.get_all.assert_called_once()
        self.assertEqual(len(todos), 1)


class MongoTodoRepositoryTestCase(TestCase):
    """Unit tests for MongoTodoRepository serialization."""

    def test_serialize_todo(self):
        oid = ObjectId()
        now = datetime.utcnow()
        doc = {
            "_id": oid,
            "description": "Sample Doc",
            "completed": False,
            "created_at": now
        }
        serialized = MongoTodoRepository._serialize_todo(doc)
        self.assertEqual(serialized["id"], str(oid))
        self.assertEqual(serialized["description"], "Sample Doc")
        self.assertEqual(serialized["created_at"], now.isoformat())
        self.assertFalse(serialized["completed"])


class TodoApiIntegrationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_get_todos_endpoint(self):
        response = self.client.get('/todos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_get_todos_without_trailing_slash(self):
        response = self.client.get('/todos')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_post_todo_success(self):
        response = self.client.post('/todos/', {'description': 'API Test Todo'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['description'], 'API Test Todo')

    def test_post_todo_validation_failure(self):
        response = self.client.post('/todos/', {'description': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_delete_todo_success(self):
        # Create a todo first
        post_res = self.client.post('/todos/', {'description': 'To be deleted'}, format='json')
        todo_id = post_res.data['id']
        # Delete it
        del_res = self.client.delete(f'/todos/{todo_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_update_todo_success(self):
        # Create a todo first
        post_res = self.client.post('/todos/', {'description': 'Original Title'}, format='json')
        todo_id = post_res.data['id']
        # Update it
        put_res = self.client.put(f'/todos/{todo_id}/', {'description': 'Updated Title'}, format='json')
        self.assertEqual(put_res.status_code, status.HTTP_200_OK)
        self.assertEqual(put_res.data['description'], 'Updated Title')
