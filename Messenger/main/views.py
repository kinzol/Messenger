from django.views.generic import TemplateView

class Home(TemplateView):
    template_name = 'main/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Добавьте нужные данные в контекст


        context['var1'] = f'https://django-bleach.readthedocs.io/en/latest/usage.html#in-your-templates'
        return context