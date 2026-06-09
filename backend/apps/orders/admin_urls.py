from django.urls import path

from . import admin_views

urlpatterns = [
    path('', admin_views.admin_orders, name='admin_orders'),
    path('<int:order_id>/', admin_views.admin_order_detail, name='admin_order_detail'),
]
