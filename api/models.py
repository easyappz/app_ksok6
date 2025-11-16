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
