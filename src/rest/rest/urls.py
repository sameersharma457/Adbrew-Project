from django.urls import path, re_path
from .views import TodoListView

urlpatterns = [
    re_path(r'^todos/?$', TodoListView.as_view(), name='todos'),
    path('todos/<str:todo_id>/', TodoListView.as_view(), name='todo-detail'),
    path('todos/<str:todo_id>', TodoListView.as_view(), name='todo-detail-no-slash'),
]
