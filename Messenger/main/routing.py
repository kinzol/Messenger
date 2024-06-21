from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<slug:user_uuid>/', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/call/', consumers.CallConsumer.as_asgi()),
    path('ws/live/<slug:user_live>/', consumers.LiveConsumer.as_asgi()),
]
