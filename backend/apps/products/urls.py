from django.urls import path

from . import views

urlpatterns = [
    path('categories/', views.list_categories, name='list_categories'),
    path('', views.list_products, name='list_products'),
    path('featured/', views.featured_products, name='featured_products'),
    path('<slug:slug>/', views.product_detail, name='product_detail'),
]
