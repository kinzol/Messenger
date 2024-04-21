from .models import *

background_styles = ["style-blue.css",
                     "style-green.css",
                     "style-pink.css",
                     "style-black.css"]


class DataMixin:

    def get_user_context(self, **kwargs):
        context = kwargs
        profile = User.objects.get(pk=self.request.user.id)

        context['user_profile'] = profile
        context['background_style'] = background_styles[profile.profile.background_style]

        return context
