from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_order, name='create_order'),
    path('mine/', views.my_orders, name='my_orders'),
    path('search/', views.search_guest_order, name='search_guest_order'),
    path('<int:order_id>/', views.order_detail, name='order_detail'),
]
