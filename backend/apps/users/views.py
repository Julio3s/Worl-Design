from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django_ratelimit.decorators import ratelimit
from django.views.decorators.http import require_http_methods
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


@require_http_methods(["POST"])
@ratelimit(key='ip', rate='3/m', method='POST')
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint with rate limiting (3/minute per IP)."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'detail': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@require_http_methods(["POST"])
@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint with JWT token generation (5/minute per IP)."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """User logout endpoint. Client should discard the JWT token."""
    refresh = request.data.get('refresh')

    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            pass

    return Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT access token using refresh token."""
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({'detail': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh_token_obj = RefreshToken(refresh)
        user_id = refresh_token_obj.get('user_id')
        if not user_id:
            return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh_token_obj.blacklist()
        user = User.objects.get(pk=user_id)
        new_refresh_token = RefreshToken.for_user(user)
        return Response({
            'access': str(new_refresh_token.access_token),
            'refresh': str(new_refresh_token),
        }, status=status.HTTP_200_OK)
    except (TokenError, User.DoesNotExist):
        return Response({'detail': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
