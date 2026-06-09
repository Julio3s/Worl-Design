from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.initiate_payment, name='initiate_payment'),
    path('webhook/', views.payment_webhook, name='payment_webhook'),
]
