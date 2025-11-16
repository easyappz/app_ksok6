from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .utils import decode_jwt


class JWTMemberAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get('Authorization')
        if not auth:
            return None
        parts = auth.split(' ')
        if len(parts) != 2 or parts[0] != 'Bearer':
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        token = parts[1]
        try:
            member = decode_jwt(token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid or expired token')
        return (member, None)
