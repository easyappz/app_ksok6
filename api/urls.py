from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    CreateGameView, OpenGamesView, JoinGameView, GameDetailView, MoveView, CloseGameView,
    HistoryView, LeaderboardView,
)

urlpatterns = [
    # auth
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', MeView.as_view(), name='auth-me'),

    # games
    path('games/create', CreateGameView.as_view(), name='game-create'),
    path('games/open', OpenGamesView.as_view(), name='games-open'),
    path('games/<int:game_id>', GameDetailView.as_view(), name='game-detail'),
    path('games/<int:game_id>/join', JoinGameView.as_view(), name='game-join'),
    path('games/<int:game_id>/move', MoveView.as_view(), name='game-move'),
    path('games/<int:game_id>/close', CloseGameView.as_view(), name='game-close'),

    # history & leaderboard
    path('history', HistoryView.as_view(), name='history'),
    path('leaderboard', LeaderboardView.as_view(), name='leaderboard'),
]
