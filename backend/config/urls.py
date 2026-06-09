"""
URL Configuration for WORLD DESIGN project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from apps.orders.admin_views import admin_customers
from apps.orders.stats_views import admin_stats

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/admin/products/', include('apps.products.admin_urls')),
    path('api/admin/categories/', include('apps.products.admin_categories_urls')),
    path('api/admin/stats/', admin_stats, name='admin_stats'),
    path('api/admin/orders/', include('apps.orders.admin_urls')),
    path('api/admin/customers/', admin_customers, name='admin_customers'),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
