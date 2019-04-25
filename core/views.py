from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
from .models import Room
import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import random

# Chooses a random word from our Words.csv file
def get_random_word():
    with open("Words.csv") as word_list:
        lines = [line.strip() for line in word_list]
    return random.choice(lines).lower()


# Create your views here.

def homepage(request):
    return render(request, 'homepage.html', context={})

def tutorial(request):
    return render(request, 'tutorial.html', context={})

def waiting_room(request, roompk, username):
    username = username
    room = Room.objects.get(pk=roompk)
    random_word = get_random_word()

    return render(request, 'waiting_room.html', context = {
        "username": username,
        "roompk": room.pk,
        "random_word": random_word,
    })

def play(request, roompk, username):
    room = get_object_or_404(Room, pk=roompk)
    room_data = "{"+room.JSON+"}"
    room_data = json.dumps(room_data)
    return render(request, 'play.html', context = {"room_data":room_data, "roompk":roompk})
    
def make_guest(request):
    return render(request, 'make_guest.html', context={})

def check_guest_name(request):
    data = json.loads(request.body)
    username = data['username']
    room, _ = Room.objects.get_or_create(full=False)
    if username not in room.JSON:
        return JsonResponse({"url": f"waiting-room/{room.pk}/{data['username']}"})
    return JsonResponse({"message": 'Username already in use.'})

def get_serviceworker(request):
    return render(request, 'sw.js', content_type='application/javascript', context={})
