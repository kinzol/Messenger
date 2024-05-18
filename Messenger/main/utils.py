from .models import *

background_styles = ["style-blue.css",
                     "style-green.css",
                     "style-pink.css",
                     "style-black.css"]


class DataMixin:

    def get_user_context(self, **kwargs):
        context = kwargs
        profile = self.request.user
        notification_count = ProfileNotification.objects.filter(profile=profile, read=False)[:21].count()

        # chats = Chat.objects.filter(users=profile)
        # interlocutors = User.objects.filter(chat_participants__in=chats).exclude(id=profile).distinct()

        # user_chats = Chat.objects.filter(users__id=profile)
        #
        # # Получить всех пользователей из этих чатов, исключая текущего пользователя
        # second_users = User.objects.filter(chat_participants__in=user_chats).exclude(id=profile).distinct()

        # print(second_users)

        context['user_profile'] = profile
        context['background_style'] = background_styles[profile.profile.background_style]
        context['notification_count'] = notification_count

        return context
