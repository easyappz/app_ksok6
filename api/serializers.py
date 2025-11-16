from rest_framework import serializers
from .models import Member, Game

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

class GameSerializer(serializers.ModelSerializer):
    creator = MemberSerializer(read_only=True)
    opponent = MemberSerializer(read_only=True)
    board_list = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'creator', 'opponent', 'status', 'board', 'board_list', 'next_turn', 'moves', 'winner', 'created_at', 'updated_at']

    def get_board_list(self, obj):
        return list(obj.board)

class OpenGameSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'creator_name', 'created_at']

class HistoryItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    opponent = serializers.CharField()
    result = serializers.CharField()
    played_at = serializers.DateTimeField()
