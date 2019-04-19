from django.contrib import admin
from .models import Room, Profile

# Register your models here.

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    pass

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass
