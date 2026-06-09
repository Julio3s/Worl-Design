"""
Exception handlers for API views.
"""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from django_ratelimit.exceptions import Ratelimited


def ratelimit_exception_handler(exc, context):
    """Handle rate limit exceptions by returning 429 Too Many Requests."""
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, Ratelimited):
        return Response(
            {'detail': 'Rate limit exceeded. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    return None
