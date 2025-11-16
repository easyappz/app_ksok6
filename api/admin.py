from django.contrib import admin
from .models import Member, Game


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'rating', 'wins', 'losses', 'draws', 'created_at')
    search_fields = ('username',)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'creator', 'opponent', 'status', 'next_turn', 'winner', 'updated_at')
    list_filter = ('status',)
    search_fields = ('creator__username', 'opponent__username')
