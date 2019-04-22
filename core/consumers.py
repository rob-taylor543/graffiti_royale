from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Room, Profile
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

class PlayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'play'
        self.room_group_name = 'draw_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        path = text_data_json['path']
        color = text_data_json['color']
        username = text_data_json['username']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'coord',
                'path': path,
                'color': color,
                'username': username
            }
        )

    async def coord(self, event):
        path = event['path']
        color = event['color']
        username = event['username']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'path': path,
            'color': color,
            'username': username
        }))

class UsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'play-users'
        self.room_group_name = 'draw_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        enter = text_data_json['enter']
        username = text_data_json['username']
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.profile.guest = True
            user.profile.save()
        room, _ = Room.objects.get_or_create(name=self.room_name)
        if enter:
            room.users.add(user)
        else:
            room.users.remove(user)
            if text_data_json['guest']:
                user.delete()
        users = {person.username:[person.profile.guest, []] for person in room.users.all()}

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_users',
                'users': users
            }
        )

    async def send_users(self, event):
        users = event['users']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'users': users
        }))
