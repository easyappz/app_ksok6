import datetime
import jwt
from django.conf import settings
from .models import Member

JWT_ALGORITHM = 'HS256'
JWT_EXP_MINUTES = 60 * 24 * 7  # 7 days

def generate_jwt(member: Member) -> str:
    payload = {
        'sub': member.id,
        'username': member.username,
        'type': 'access',
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXP_MINUTES),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def decode_jwt(token: str) -> Member:
    data = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    member_id = data.get('sub')
    return Member.objects.get(id=member_id)
