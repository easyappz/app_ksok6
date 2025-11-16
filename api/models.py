from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    rating = models.IntegerField(default=1200)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password: str):
        self.password = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username


class Game(models.Model):
    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_FINISHED = 'finished'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_FINISHED, 'Finished'),
        (STATUS_CLOSED, 'Closed'),
    ]

    creator = models.ForeignKey(Member, related_name='created_games', on_delete=models.CASCADE)
    opponent = models.ForeignKey(Member, related_name='joined_games', on_delete=models.SET_NULL, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    board = models.CharField(max_length=9, default='---------')  # 9 cells: '-' empty, 'X' or 'O'
    next_turn = models.CharField(max_length=1, default='X')  # 'X' or 'O'
    moves = models.JSONField(default=list)  # list of {index, symbol}

    winner = models.ForeignKey(Member, related_name='won_games', null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game #{self.id} ({self.status})"

    @property
    def is_full(self):
        return self.opponent is not None

    def as_board_list(self):
        return list(self.board)
