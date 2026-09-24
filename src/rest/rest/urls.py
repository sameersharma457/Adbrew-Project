from django.urls import re_path
from .views import TodoListView

urlpatterns = [
    re_path(r'^todos/?$', TodoListView.as_view(), name='todos'),
]
