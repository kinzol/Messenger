import asyncio
import base64
import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.files.base import ContentFile
from django.utils import timezone

from .models import *

from .utils import encrypt_message

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Messenger.settings')
django.setup()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_uuid = self.scope['url_route']['kwargs']['user_uuid']
        self.room_group_name = f'chat_{self.user_uuid}'
        self.user = await sync_to_async(
            lambda: User.objects.filter(username=self.scope['user']).select_related('profile').first())()
        chats = await (sync_to_async(list)
                       (self.user.profile.chats.all().select_related('profile').values('profile__uuid')))

        self.user.profile.online_status = True
        await sync_to_async(self.user.profile.save)()

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        for chat in chats:
            await self.channel_layer.group_send(f'chat_{chat['profile__uuid']}', {
                'send_type': 'chat_online',
                'type': 'chat.online',
                'status': 'online',
                'from_user': self.user.pk,
                'time': '',
            })

    async def disconnect(self, close_code):
        self.user.profile.last_online = timezone.now()
        self.user.profile.online_status = False
        await sync_to_async(self.user.profile.save)()

        await asyncio.sleep(5)
        user = await sync_to_async(
            lambda: User.objects.filter(username=self.scope['user']).select_related('profile').first())()

        if not user.profile.online_status:
            chats = await (sync_to_async(list)
                           (user.profile.chats.all().select_related('profile').values('profile__uuid')))

            for chat in chats:
                await self.channel_layer.group_send(f'chat_{chat['profile__uuid']}', {
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
            message, reply_message = None, None
            target_user_uuid = data.get('target_user_uuid')

            file_data = data['file']
            file_name = data['file_name']

            from_user = await sync_to_async(User.objects.get)(pk=int(data['from_user']))
            to_user = await sync_to_async(User.objects.get)(pk=int(data['to_user']))

            if data['message']:
                message = encrypt_message(str.encode(data['message']))

            if data['reply_message']:
                reply_message = encrypt_message(str.encode(data['reply_message']))

            new_message = await sync_to_async(ChatMessage)(
                type=data['type'],
                message=message,
                reply_id=data['reply_id'],
                reply_message=reply_message,
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
                    'call_time': None,
                    'forwarded_content': data['forwarded_content'],
                    'from_user': data['from_user'],
                    'to_user': data['to_user'],
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
