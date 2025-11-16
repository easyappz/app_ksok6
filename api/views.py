from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .serializers import (
    RegisterSerializer, LoginSerializer, MemberSerializer,
    GameSerializer, OpenGameSerializer, HistoryItemSerializer
)
from .models import Member, Game
from .utils import generate_jwt
from .game_logic import check_winner
from .elo import calculate_elo

@method_decorator(csrf_exempt, name='dispatch')
class CsrfExemptAPIView(APIView):
    pass

# Auth Views
class RegisterView(CsrfExemptAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = Member(username=serializer.validated_data['username'])
        member.set_password(serializer.validated_data['password'])
        member.save()
        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)

class LoginView(CsrfExemptAPIView):
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

class MeView(CsrfExemptAPIView):
    def get(self, request):
        return Response(MemberSerializer(request.user).data, status=status.HTTP_200_OK)

# Game Views
class CreateGameView(CsrfExemptAPIView):
    def post(self, request):
        game = Game.objects.create(creator=request.user, status=Game.STATUS_OPEN, board='---------', next_turn='X', moves=[])
        return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)

class OpenGamesView(CsrfExemptAPIView):
    def get(self, request):
        games = Game.objects.filter(status=Game.STATUS_OPEN).order_by('-created_at')
        data = OpenGameSerializer(games, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class JoinGameView(CsrfExemptAPIView):
    def post(self, request, game_id: int):
        game = get_object_or_404(Game, id=game_id)
        if game.status != Game.STATUS_OPEN:
            return Response({'detail': 'Игра недоступна для подключения'}, status=status.HTTP_400_BAD_REQUEST)
        if game.creator_id == request.user.id:
            return Response({'detail': 'Нельзя подключиться к собственной игре'}, status=status.HTTP_400_BAD_REQUEST)
        game.opponent = request.user
        game.status = Game.STATUS_IN_PROGRESS
        game.save()
        return Response(GameSerializer(game).data, status=status.HTTP_200_OK)

class GameDetailView(CsrfExemptAPIView):
    def get(self, request, game_id: int):
        game = get_object_or_404(Game, id=game_id)
        # Only creator or opponent can view non-open games
        if game.status != Game.STATUS_OPEN and request.user.id not in [game.creator_id, game.opponent_id]:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        return Response(GameSerializer(game).data, status=status.HTTP_200_OK)

class MoveView(CsrfExemptAPIView):
    def post(self, request, game_id: int):
        game = get_object_or_404(Game, id=game_id)
        if game.status != Game.STATUS_IN_PROGRESS:
            return Response({'detail': 'Игра не в активном состоянии'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.id not in [game.creator_id, game.opponent_id]:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        index = request.data.get('index')
        try:
            index = int(index)
        except (TypeError, ValueError):
            return Response({'detail': 'Некорректный индекс хода'}, status=status.HTTP_400_BAD_REQUEST)
        if index < 0 or index > 8:
            return Response({'detail': 'Индекс вне диапазона'}, status=status.HTTP_400_BAD_REQUEST)
        cells = list(game.board)
        if cells[index] != '-':
            return Response({'detail': 'Клетка уже занята'}, status=status.HTTP_400_BAD_REQUEST)
        # Determine symbol by player
        symbol = 'X' if request.user.id == game.creator_id else 'O'
        if game.next_turn != symbol:
            return Response({'detail': 'Сейчас не ваш ход'}, status=status.HTTP_400_BAD_REQUEST)
        # Make move
        cells[index] = symbol
        game.board = ''.join(cells)
        game.moves.append({'index': index, 'symbol': symbol})
        winner = check_winner(game.board)
        if winner is None:
            game.next_turn = 'O' if game.next_turn == 'X' else 'X'
        else:
            game.status = Game.STATUS_FINISHED
            # Update ratings and stats
            if winner == 'draw':
                # draw
                if game.creator:
                    game.creator.draws += 1
                if game.opponent:
                    game.opponent.draws += 1
                new_a, new_b = calculate_elo(game.creator.rating, game.opponent.rating, 0.5)
                game.creator.rating = new_a
                game.opponent.rating = new_b
            else:
                game.winner = game.creator if winner == 'X' else game.opponent
                if winner == 'X':
                    game.creator.wins += 1
                    game.opponent.losses += 1
                    new_a, new_b = calculate_elo(game.creator.rating, game.opponent.rating, 1.0)
                    game.creator.rating = new_a
                    game.opponent.rating = new_b
                else:
                    game.opponent.wins += 1
                    game.creator.losses += 1
                    new_b, new_a = calculate_elo(game.opponent.rating, game.creator.rating, 1.0)
                    # note swap back
                    game.creator.rating = new_a
                    game.opponent.rating = new_b
            game.creator.save()
            game.opponent.save()
        game.save()
        return Response(GameSerializer(game).data, status=status.HTTP_200_OK)

class CloseGameView(CsrfExemptAPIView):
    def post(self, request, game_id: int):
        game = get_object_or_404(Game, id=game_id)
        if request.user.id not in [game.creator_id, game.opponent_id]:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        if game.status != Game.STATUS_FINISHED:
            return Response({'detail': 'Игра должна быть завершена, чтобы закрыть её'}, status=status.HTTP_400_BAD_REQUEST)
        game.status = Game.STATUS_CLOSED
        game.save()
        return Response({'detail': 'Игра закрыта'}, status=status.HTTP_200_OK)

class HistoryView(CsrfExemptAPIView):
    def get(self, request):
        user = request.user
        games = Game.objects.filter(
            Q(creator=user) | Q(opponent=user),
            status__in=[Game.STATUS_FINISHED, Game.STATUS_CLOSED]
        ).order_by('-updated_at')
        data = []
        for g in games:
            opponent = g.opponent.username if g.creator_id == user.id else g.creator.username
            if g.winner_id is None:
                result = 'Ничья'
            else:
                result = 'Победа' if g.winner_id == user.id else 'Поражение'
            data.append({
                'id': g.id,
                'opponent': opponent,
                'result': result,
                'played_at': g.updated_at,
            })
        return Response(HistoryItemSerializer(data, many=True).data, status=status.HTTP_200_OK)

class LeaderboardView(CsrfExemptAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        members = Member.objects.all().order_by('-rating', '-wins')[:50]
        return Response(MemberSerializer(members, many=True).data, status=status.HTTP_200_OK)
