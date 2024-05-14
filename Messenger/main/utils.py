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

        context['user_profile'] = profile
        context['background_style'] = background_styles[profile.profile.background_style]
        context['notification_count'] = notification_count

        return context
