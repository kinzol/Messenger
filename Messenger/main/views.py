import uuid
import datetime

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.db.models import Exists, OuterRef
from django.http import Http404
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DetailView

from .forms import *
from .utils import *


class HomeView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Feed')
        return {**context, **c_def}


class SettingsView(DataMixin, LoginRequiredMixin, UpdateView):
    model = Profile
    form_class = SettingsForm
    template_name = 'main/settings.html'
    login_url = 'login'

    def get_object(self, queryset=None):
        return self.request.user.profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Settings')
        return {**context, **c_def}

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


class SearchView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/search.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Search')
        return {**context, **c_def}


# Profile View
class ProfileView(DataMixin, LoginRequiredMixin, DetailView):
    template_name = 'main/profile.html'
    model = User
    login_url = 'login'

    def get_object(self, queryset=None):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            return user
        else:
            raise Http404('Username not provided in URL')

    def get_posts(self):
        user = self.get_object()
        posts = (Post.objects.filter(author=user)
                 .order_by('-pk')
                 .select_related('author')
                 .annotate(like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
                           bookmark_exists=Exists(
                               PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk'))))[:12])
        return posts

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.get_object()

        posts = self.get_posts()
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()
        is_following = ProfileFollow.objects.filter(profile=user, user=self.request.user).exists()

        for post in posts:
            post.tags = post.tags.split(' ')
            post.like = post.like_exists
            post.bookmark = post.bookmark_exists

        c_def = self.get_user_context(title=f'{self.request.user.username} - Profile', posts=posts,
                                      is_follower=is_follower, is_following=is_following)
        return {**context, **c_def}


class ProfileNotificationView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/notifications.html'
    login_url = 'login'

    def get_object(self):
        notifications = PostComment.objects.filter(user=self.request.user).order_by('-pk')[:12]
        return notifications

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Notifications', notifications=self.get_object())
        return {**context, **c_def}


class ListFollowersView(DataMixin, LoginRequiredMixin, ListView):
    model = User
    template_name = 'main/users-list-followers.html'
    login_url = 'login'

    def get_object(self):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            followers = ProfileFollow.objects.filter(profile=user)[:25]
            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

            if user.profile.private and not is_follower and user != self.request.user:
                raise Http404('This page is not available')

            return [user, followers]
        else:
            raise Http404('Username not provided in URL')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user, users = self.get_object()
        c_def = self.get_user_context(title=f'{self.kwargs.get("username")} - Followers', user=user, users=users)
        return {**context, **c_def}


class ListFollowingView(DataMixin, LoginRequiredMixin, ListView):
    model = User
    template_name = 'main/users-list-following.html'
    login_url = 'login'

    def get_object(self):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            following = ProfileFollow.objects.filter(user=user)[:25]
            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

            if user.profile.private and not is_follower and user != self.request.user:
                raise Http404('This page is not available')

            return [user, following]
        else:
            raise Http404('Username not provided in URL')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user, users = self.get_object()
        c_def = self.get_user_context(title=f'{self.kwargs.get("username")} - Following', user=user, users=users)
        return {**context, **c_def}


# Post View
class PostView(DataMixin, LoginRequiredMixin, DetailView):
    model = Post
    template_name = 'main/post.html'
    login_url = 'login'

    def get_object(self, queryset=None):
        post_id = self.kwargs.get('pk')
        if post_id:
            post = Post.objects.filter(pk=post_id).annotate(
                like_exists=Exists(PostLike.objects.filter(user=self.request.user, post_id=OuterRef('pk'))),
                bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post_id=OuterRef('pk'))),
            ).first()

            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=post.author).exists()
            if post.author.profile.private and not is_follower and post.author != self.request.user:
                raise Http404('This page is not available')

            post.tags = post.tags.split(' ')
            post.comments = PostComment.objects.filter(post_id=post.pk)
            return post
        else:
            raise Http404('Id not provided in URL')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.get_object()
        c_def = self.get_user_context(title=f'{post.author.username} - Post', post=post)
        return {**context, **c_def}


class PostLikesView(DataMixin, LoginRequiredMixin, ListView):
    model = User
    template_name = 'main/users-list-like.html'
    login_url = 'login'

    def get_object(self):
        post_id = self.kwargs.get('pk')
        if post_id:
            post = Post.objects.get(pk=post_id)
            users = PostLike.objects.filter(post=post_id)[:25]
            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=post.author).exists()

            if post.author.profile.private and not is_follower and post.author != self.request.user:
                raise Http404('This page is not available')

            return users
        else:
            raise Http404('Username not provided in URL')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Post likes', users=self.get_object())
        return {**context, **c_def}


class PostCreateView(DataMixin, LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostCreateForm
    template_name = 'main/create-post.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Create post')
        return {**context, **c_def}

    def form_valid(self, form):
        post = Post.objects.create(
            author=self.request.user,
            content=form.cleaned_data.get('content'),
            tags=form.cleaned_data.get('tags')
        )

        files = self.request.FILES.getlist('files_content')

        for file in files:
            PostFile.objects.create(
                post=post,
                file=file)

        return redirect('profile', username=self.request.user.username)


# Activities
class ActivityView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/activity.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Activity')
        return {**context, **c_def}


class ActivityLikesView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-like.html'
    login_url = 'login'

    def get_object(self):
        posts = PostLike.objects.filter(user=self.request.user).order_by('-pk')[:12]
        return posts

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Activity likes', posts=self.get_object(), type='likes')
        return {**context, **c_def}


class ActivityBookmarksView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-like.html'
    login_url = 'login'

    def get_object(self):
        posts = PostBookmark.objects.filter(user=self.request.user).order_by('-pk')[:12]
        return posts

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Activity bookmarks', posts=self.get_object(), type='bookmarks')
        return {**context, **c_def}


class ActivityCommentsView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-comment.html'
    login_url = 'login'

    def get_object(self):
        comments = PostComment.objects.filter(user=self.request.user).order_by('-pk')[:12]
        return comments

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Comment history', comments=self.get_object())
        return {**context, **c_def}


class ActivityStoriesView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-stories.html'
    login_url = 'login'

    def get_object(self):
        comments = PostComment.objects.filter(user=self.request.user).order_by('-pk')[:12]
        return comments

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Stories history', comments=self.get_object())
        return {**context, **c_def}


# Authentication
class LoginUserView(LoginView):
    form_class = LoginUserForm
    template_name = 'main/login.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = {'title': 'Login'}
        return {**context, **c_def}

    def get_success_url(self):
        return reverse_lazy('home')


class RegisterUserView(CreateView):
    form_class = RegisterUserForm
    template_name = 'main/register.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = {'title': 'Registration'}
        return {**context, **c_def}

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
