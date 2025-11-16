from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework import exceptions
from .utils import decode_jwt


class JWTMemberAuthentication(BaseAuthentication):
    def authenticate(self, request):
        raw = get_authorization_header(request)
        if not raw:
            return None
        try:
            auth = raw.decode('utf-8')
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        parts = auth.split(' ')
        if len(parts) != 2 or parts[0] != 'Bearer':
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        token = parts[1].strip()
        if not token:
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        try:
            member = decode_jwt(token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid or expired token')
        return (member, None)
