import uuid
import datetime

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.http import Http404
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DetailView

from .forms import *
from .utils import *


class Home(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Feed')
        return dict(list(context.items()) + list(c_def.items()))


class Profile(DataMixin, LoginRequiredMixin, DetailView):
    template_name = 'main/profile.html'
    model = User
    login_url = 'login'

    def get_object(self, queryset=None):
        username = self.kwargs.get('username') # получаем значение из URL
        if username:
            try:
                user = User.objects.get(username=username)
                return user
            except User.DoesNotExist:
                raise Http404("User does not exist")
        else:
            # Если username отсутствует в URL, генерируем 404 ошибку
            raise Http404("Username not provided in URL")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Profile')
        return dict(list(context.items()) + list(c_def.items()))


class Settings(DataMixin, LoginRequiredMixin, UpdateView):
    model = Profile
    form_class = SettingsForm
    template_name = 'main/settings.html'
    login_url = 'login'

    def get_object(self, queryset=None):
        return self.request.user.profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Settings')
        return dict(list(context.items()) + list(c_def.items()))

    def form_valid(self, form):
        username = form.cleaned_data.get('username')
        check_profile = User.objects.filter(username=username)

        if not check_profile:
            user = User.objects.get(pk=self.request.user.id)
            delta = timezone.now() - user.profile.username_change_time
            if delta >= datetime.timedelta(days=14):
                user.profile.username_change_time = timezone.now()
                user.username = username
                user.save()

        form.save()
        return redirect('settings')


class LoginUser(LoginView):
    form_class = LoginUserForm
    template_name = 'main/login.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = {'title': 'Login'}
        return dict(list(context.items()) + list(c_def.items()))

    def get_success_url(self):
        return reverse_lazy('home')


class RegisterUser(CreateView):
    form_class = RegisterUserForm
    template_name = 'main/register.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = {'title': 'Registration'}
        return dict(list(context.items()) + list(c_def.items()))

    def form_valid(self, form):
        user = form.save()
        username = f'{form.cleaned_data.get("name")} {form.cleaned_data.get("surname")}'
        time_now = datetime.datetime.now()

        Profile.objects.create(uuid=str(uuid.uuid4())[:16], full_name=username, user=user,
                               username_change_time=time_now, last_online=time_now)

        login(self.request, user)
        return redirect('home')


@login_required(login_url='login')
def logout_user(request):
    logout(request)
    return redirect('login')
