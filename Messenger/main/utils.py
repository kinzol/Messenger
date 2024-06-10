from django.db.models import Subquery, OuterRef, Q, IntegerField, Max, Count

from .models import *

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import os


ENCRYPTION_KEY = str.encode('160d3247-f11c-43')
background_styles = ["style-blue.css",
                     "style-green.css",
                     "style-pink.css",
                     "style-black.css"]


class DataMixin:

    def get_user_context(self, **kwargs):
        context = kwargs
        profile = self.request.user
        notification_count = ProfileNotification.objects.filter(profile=profile, read=False)[:21].count()

        last_message = ChatMessage.objects.filter(
            (Q(from_user=OuterRef('pk')) | Q(to_user=OuterRef('pk'))) & (Q(from_user=profile) | Q(to_user=profile))
        ).order_by('-pk')[:1]

        chats = profile.profile.chats.all().annotate(
            last_message_text=Subquery(last_message.values('message')),
            last_message_type=Subquery(last_message.values('type')),
            last_message_time=Subquery(last_message.values('time_create'))
        ).order_by('-last_message_time')[:10].select_related('profile')

        unread_messages_count = ChatMessage.objects.filter(
            to_user=profile, read=False
        ).values('from_user').annotate(count=Count('pk')).values('count')

        context['user_profile'] = profile
        context['background_style'] = background_styles[profile.profile.background_style]
        context['notification_count'] = notification_count
        context['chats'] = chats
        context['user_uuid'] = profile.profile.uuid
        context['unread_messages_count'] = unread_messages_count

        return context


def encrypt_message(message, key=ENCRYPTION_KEY):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(message) + padder.finalize()

    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    return iv + ciphertext

def decrypt_message(encrypted_message, key=ENCRYPTION_KEY):
    iv = encrypted_message[:16]
    ciphertext = encrypted_message[16:]

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()

    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()

    return unpadded_data

# key = b'29d99d92-b0cc-46'
# message = b"Hello, world!"
#
# # Шифрование сообщения
# encrypted_message = encrypt_message(key, message)
# print("Зашифрованное сообщение:", encrypted_message)
#
# # Дешифрование сообщения
# decrypted_message = decrypt_message(key, encrypted_message)
# print("Расшифрованное сообщение:", decrypted_message.decode())
