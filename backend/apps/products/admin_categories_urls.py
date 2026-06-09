from django.urls import path

from . import views

urlpatterns = [
    path('', views.admin_categories, name='admin_categories'),
    path('<int:pk>/', views.admin_category_detail, name='admin_category_detail'),
]
