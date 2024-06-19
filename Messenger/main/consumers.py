import asyncio
import base64
import json

from asgiref.sync import sync_to_async, async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone

from .models import *

from .utils import encrypt_message

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Messenger.settings')
django.setup()

call_state = []


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_uuid = self.scope['url_route']['kwargs']['user_uuid']
        self.room_group_name = f'chat_{self.user_uuid}'
        self.user = await database_sync_to_async(
            lambda: User.objects.filter(username=self.scope['user']).select_related('profile').first()
        )()
        chats = await database_sync_to_async(
            lambda: list(self.user.profile.chats.all().select_related('profile').values('profile__uuid'))
        )()

        self.user.profile.online_status = True
        await database_sync_to_async(self.user.profile.save)()

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        for chat in chats:
            await self.channel_layer.group_send(f'chat_{chat["profile__uuid"]}', {
                'send_type': 'chat_online',
                'type': 'chat.online',
                'status': 'online',
                'from_user': self.user.pk,
                'time': '',
            })

    async def disconnect(self, close_code):
        self.user.profile.last_online = timezone.now()
        self.user.profile.online_status = False
        await database_sync_to_async(self.user.profile.save)()

        await asyncio.sleep(5)
        user = await database_sync_to_async(
            lambda: User.objects.filter(username=self.scope['user']).select_related('profile').first()
        )()

        if not user.profile.online_status:
            chats = await database_sync_to_async(
                lambda: list(user.profile.chats.all().select_related('profile').values('profile__uuid'))
            )()

            for chat in chats:
                await self.channel_layer.group_send(f'chat_{chat["profile__uuid"]}', {
                    'send_type': 'chat_online',
                    'type': 'chat.online',
                    'status': 'offline',
                    'from_user': self.user.pk,
                    'time': str(self.user.profile.last_online.strftime("%Y-%m-%dT%H:%M:%S.%fZ"))
                })
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['send_type'] == 'chat_message':
            message, reply_message, to_user = None, None, None
            target_user_uuid = data.get('target_user_uuid')

            if data['type'] in ['call', 'video-call']:
                to_user = await sync_to_async(User.objects.select_related('profile').get)(username=data['to_user'])
                from_user = await sync_to_async(User.objects.select_related('profile').get)(username=data['from_user'])

            if data['new_chat']:
                if not to_user:
                    to_user = await sync_to_async(User.objects.select_related('profile').get)(pk=int(data['to_user']))
                    from_user = await (sync_to_async(User.objects.select_related('profile').get)
                                       (pk=int(data['from_user'])))

                from_user_chats = await sync_to_async(list)(from_user.profile.chats.all())

                if to_user not in from_user_chats:
                    await sync_to_async(from_user.profile.chats.add)(to_user)
                    await sync_to_async(to_user.profile.chats.add)(from_user)

            else:
                if not to_user:
                    to_user = await sync_to_async(User.objects.get)(pk=int(data['to_user']))
                    from_user = await sync_to_async(User.objects.get)(pk=int(data['from_user']))

            file_data = data['file']
            file_name = data['file_name']

            if data['message']:
                message = encrypt_message(str.encode(data['message']))

            if data['reply_message']:
                reply_message = encrypt_message(str.encode(data['reply_message']))

            new_message = await sync_to_async(ChatMessage)(
                type=data['type'],
                message=message,
                reply_id=data['reply_id'],
                reply_message=reply_message,
                call_time=data['call_time'],
                from_user=from_user,
                to_user=to_user,
                forwarded_content=data['forwarded_content'],
            )

            if file_data:
                file_content = base64.b64decode(file_data) if file_data else None
                file_name = file_name if file_content else None
                new_message.file.save(file_name, ContentFile(file_content), save=False)
            else:
                new_message.file = None

            await sync_to_async(new_message.save)()

            if target_user_uuid:
                target_group_name = f'chat_{target_user_uuid}'

                data_dict = {
                    'send_type': data['send_type'],
                    'type': 'chat.message',
                    'id': new_message.pk,
                    'type_message': data['type'],
                    'time_create': str(new_message.time_create.strftime("%Y-%m-%dT%H:%M:%S.%fZ")),
                    'read': new_message.read,
                    'reactions': [],
                    'message': data['message'],
                    'reply_id': data['reply_id'],
                    'reply_message': data['reply_message'],
                    'file': new_message.file.url if file_data else None,
                    'call_time': data['call_time'],
                    'forwarded_content': data['forwarded_content'],
                    'from_user': data['from_user'],
                    'to_user': data['to_user'],
                    'new_chat': data['new_chat'],
                }

                await self.channel_layer.group_send(self.room_group_name, data_dict)
                await self.channel_layer.group_send(target_group_name, data_dict)

        elif data['send_type'] == 'chat_read':
            target_user_uuid = data['target_user_uuid']
            target_group_name = f'chat_{target_user_uuid}'

            message = await sync_to_async(ChatMessage.objects.get)(pk=data['message_id'])
            message.read = True
            await sync_to_async(message.save)()

            await self.channel_layer.group_send(target_group_name, {
                'send_type': data['send_type'],
                'type': 'chat.read',
                'message_id': data['message_id'],
            })

        elif data['send_type'] == 'chat_typing':
            target_user_uuid = data['target_user_uuid']
            target_group_name = f'chat_{target_user_uuid}'

            await self.channel_layer.group_send(target_group_name, {
                'send_type': data['send_type'],
                'type': 'chat.typing',
                'from_user': data['from_user'],
            })

        elif data['send_type'] == 'chat_reaction_add':
            target_user_uuid = data['target_user_uuid']
            target_group_name = f'chat_{target_user_uuid}'

            chat_message = await sync_to_async(ChatMessage.objects.get)(pk=data['message_id'])
            message_reaction = await (sync_to_async(chat_message.reaction.create)
                                      (reaction=data['reaction'], user=self.user))

            reaction_dict = {
                'send_type': data['send_type'],
                'type': 'chat.reaction_add',
                'reaction': data['reaction'],
                'reaction_id': message_reaction.pk,
                'message_id': data['message_id'],
                'from_user': data['from_user'],
            }

            await self.channel_layer.group_send(target_group_name, reaction_dict)
            await self.channel_layer.group_send(self.room_group_name, reaction_dict)

        elif data['send_type'] == 'chat_reaction_remove':
            target_user_uuid = data['target_user_uuid']
            target_group_name = f'chat_{target_user_uuid}'

            chat_message = await sync_to_async(ChatMessage.objects.get)(pk=data['message_id'])
            reaction = await (sync_to_async(ChatMessageReaction.objects.select_related('user').get)
                              (pk=data['reaction_id']))
            if reaction.user == self.user:
                await sync_to_async(chat_message.reaction.remove)(reaction)

            await self.channel_layer.group_send(target_group_name, {
                'send_type': data['send_type'],
                'type': 'chat.reaction_remove',
                'reaction_id': data['reaction_id'],
                'message_id': data['message_id'],
            })

        elif data['send_type'] == 'chat_message_delete':
            target_user_uuid = data['target_user_uuid']
            target_group_name = f'chat_{target_user_uuid}'

            chat_message = await (sync_to_async(ChatMessage.objects.select_related("from_user").get)
                                  (pk=data['message_id']))

            if self.user == chat_message.from_user:
                await sync_to_async(chat_message.delete)()

            message_dict = {
                'send_type': data['send_type'],
                'type': 'chat.message_delete',
                'message_id': data['message_id'],
                'chat_id': data['chat_id'],
            }

            await self.channel_layer.group_send(target_group_name, message_dict)
            await self.channel_layer.group_send(self.room_group_name, message_dict)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'id': event['id'],
            'type': event['type_message'],
            'time_create': event['time_create'],
            'read': event['read'],
            'reactions': event['reactions'],
            'message': event['message'],
            'reply_id': event['reply_id'],
            'reply_message': event['reply_message'],
            'file': event['file'],
            'call_time': event['call_time'],
            'forwarded_content': event['forwarded_content'],
            'from_user': event['from_user'],
            'to_user': event['to_user'],
            'new_chat': event['new_chat'],
        }))

    async def chat_read(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'message_id': event['message_id']
        }))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'from_user': event['from_user']
        }))

    async def chat_online(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'status': event['status'],
            'from_user': event['from_user'],
            'time': event['time']
        }))

    async def chat_reaction_add(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'reaction': event['reaction'],
            'reaction_id': event['reaction_id'],
            'message_id': event['message_id'],
            'from_user': event['from_user'],
        }))

    async def chat_reaction_remove(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'reaction_id': event['reaction_id'],
            'message_id': event['message_id'],
        }))

    async def chat_message_delete(self, event):
        await self.send(text_data=json.dumps({
            'send_type': event['send_type'],
            'message_id': event['message_id'],
            'chat_id': event['chat_id'],
        }))


class CallConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

        self.send(text_data=json.dumps({
            'type': 'connection',
            'data': {
                'message': "Connected"
            }
        }))

    def disconnect(self, close_code):
        if self.my_name in call_state:
            call_state.remove(self.my_name)

        async_to_sync(self.channel_layer.group_discard)(
            self.my_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        eventType = text_data_json['type']

        if eventType == 'login':
            name = text_data_json['data']['name']
            self.my_name = name

            async_to_sync(self.channel_layer.group_add)(
                self.my_name,
                self.channel_name
            )

        if eventType == 'call':
            name = text_data_json['data']['name']

            if name in call_state:
                return async_to_sync(self.channel_layer.group_send)(
                    self.my_name,
                    {'type': 'call_error', 'error': 'This user is already in a call state!'}
                )

            call_state.append(name)
            call_state.append(self.my_name)

            user = User.objects.filter(username=name).select_related('profile').first()
            profile = User.objects.filter(username=self.my_name).first()
            is_follower = ProfileFollow.objects.filter(profile=profile, user=user).exists()

            if user.profile.private and not is_follower:
                return async_to_sync(self.channel_layer.group_send)(
                    self.my_name,
                    {'type': 'call_error', 'error': 'This profile is private!'}
                )

            if not user.profile.online_status:
                return async_to_sync(self.channel_layer.group_send)(
                    self.my_name,
                    {'type': 'call_error', 'error': 'User is not online!'}
                )

            async_to_sync(self.channel_layer.group_send)(
                name,
                {
                    'type': 'call_received',
                    'callFormat': text_data_json['data']['callFormat'],
                    'sourceFullName': text_data_json['data']['sourceFullName'],
                    'sourceAvatar': text_data_json['data']['sourceAvatar'],
                    'data': {
                        'caller': self.my_name,
                        'rtcMessage': text_data_json['data']['rtcMessage']
                    }
                }
            )

        if eventType == 'answer_call':
            caller = text_data_json['data']['caller']

            async_to_sync(self.channel_layer.group_send)(
                caller,
                {
                    'type': 'call_answered',
                    'data': {
                        'rtcMessage': text_data_json['data']['rtcMessage']
                    }
                }
            )

        if eventType == 'call_stop':
            name = text_data_json['data']['name']
            if name in call_state:
                call_state.remove(name)

            if self.my_name in call_state:
                call_state.remove(self.my_name)

            async_to_sync(self.channel_layer.group_send)(
                name,
                {
                    'type': 'call_stop',
                }
            )

        if eventType == 'ICEcandidate':
            user = text_data_json['data']['user']

            async_to_sync(self.channel_layer.group_send)(
                user,
                {
                    'type': 'ICEcandidate',
                    'data': {
                        'rtcMessage': text_data_json['data']['rtcMessage']
                    }
                }
            )

    def call_received(self, event):
        self.send(text_data=json.dumps({
            'type': 'call_received',
            'callFormat': event['callFormat'],
            'sourceFullName': event['sourceFullName'],
            'sourceAvatar': event['sourceAvatar'],
            'data': event['data']
        }))

    def call_answered(self, event):
        self.send(text_data=json.dumps({
            'type': 'call_answered',
            'data': event['data']
        }))

    def call_stop(self, event):
        self.send(text_data=json.dumps({
            'type': 'call_stop',
        }))

    def call_error(self, event):
        self.send(text_data=json.dumps({
            'type': 'call_error',
            'error': event['error']
        }))

    def ICEcandidate(self, event):
        self.send(text_data=json.dumps({
            'type': 'ICEcandidate',
            'data': event['data']
        }))
