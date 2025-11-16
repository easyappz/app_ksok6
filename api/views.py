from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer, LoginSerializer, MemberSerializer
from .models import Member
from .utils import generate_jwt


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = Member(username=serializer.validated_data['username'])
        member.set_password(serializer.validated_data['password'])
        member.save()
        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            member = Member.objects.get(username=serializer.validated_data['username'])
        except Member.DoesNotExist:
            return Response({'detail': 'Неверный логин или пароль'}, status=status.HTTP_400_BAD_REQUEST)
        if not member.check_password(serializer.validated_data['password']):
            return Response({'detail': 'Неверный логин или пароль'}, status=status.HTTP_400_BAD_REQUEST)
        token = generate_jwt(member)
        return Response({'access': token, 'member': MemberSerializer(member).data}, status=status.HTTP_200_OK)


class MeView(APIView):
    def get(self, request):
        return Response(MemberSerializer(request.user).data, status=status.HTTP_200_OK)
