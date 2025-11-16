from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'rating', 'wins', 'losses', 'draws', 'created_at']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=6, max_length=128)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError('Пользователь с таким логином уже существует')
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
