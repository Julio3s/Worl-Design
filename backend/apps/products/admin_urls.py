from django.urls import path

from . import views

urlpatterns = [
    path('', views.admin_products, name='admin_products'),
    path('<int:pk>/', views.admin_product_detail, name='admin_product_detail'),
    path('<int:pk>/hard-delete/', views.admin_product_hard_delete, name='admin_product_hard_delete'),
]
