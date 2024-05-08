import json
import random
import uuid
import datetime
from itertools import chain
from random import shuffle, sample, choice

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.db import connection
from django.db.models import Exists, OuterRef, Q, F, Case, When, BooleanField, Subquery, Prefetch, Max, Count, Window
from django.db.models.functions import RowNumber, Random
from django.http import Http404, JsonResponse
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DetailView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .forms import *
from .utils import *
from .serializers import *


class HomeView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'
    login_url = 'login'

    def exist_my_stories(self):
        recent_time = timezone.now() - datetime.timedelta(days=1)
        story = Story.objects.filter(author=self.request.user, time_create__gte=recent_time).first()
        return story

    def fetch_followed_stories(self):
        user_following = ProfileFollow.objects.filter(user=self.request.user).values('profile')
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('author'))
        latest_story = Story.objects.filter(author=OuterRef('author')).order_by('-pk')
        is_viewer = Story.objects.filter(viewers=self.request.user, id=OuterRef('id'))

        stories = Story.objects.filter(
            id__in=Subquery(latest_story.values('id')[:1]),
            author__in=Subquery(user_following),
            time_create__gte=timezone.now() - datetime.timedelta(days=1)
        ).annotate(
            is_private=Exists(Profile.objects.filter(user=OuterRef('author'), private=True)),
            is_follower=Exists(is_follower),
            is_viewed=Exists(is_viewer)
        ).filter(
            (Q(is_private=False) | Q(is_follower=True)) & Q(is_viewed=False)
        ).select_related('author__profile')[:21]

        if len(stories) < 21:
            viewed_stories = Story.objects.filter(
                id__in=Subquery(latest_story.values('id')[:1]),
                author__in=Subquery(user_following),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ).annotate(
                is_private=Exists(Profile.objects.filter(user=OuterRef('author'), private=True)),
                is_follower=Exists(is_follower),
                is_viewed=Exists(is_viewer)
            ).filter(
                (Q(is_private=False) | Q(is_follower=True)) & Q(is_viewed=True)
            ).select_related('author__profile')[:21]

            stories = chain(stories, viewed_stories)
            return [stories, True]
        else:
            return [stories, False]

    def get_recommendations(self):
        posts = Post.objects.filter(author=OuterRef('profile')).order_by().values('author')
        user_following = ProfileFollow.objects.filter(user=self.request.user).annotate(
            num_posts=Subquery(posts.annotate(c=Count('id')).values('c')))
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('profile'))

        user_following = user_following.filter(num_posts__gte=2).annotate(
            is_private=Exists(Profile.objects.filter(user=OuterRef('profile'), private=True)),
            is_follower=Exists(is_follower),
        ).filter(
            Q(is_private=False) | Q(is_follower=True)
        ).order_by('pk')[:1].values_list('profile', flat=True)
        print(user_following)

        latest_post = Post.objects.filter(author=OuterRef('author')).order_by('?')[:10]

        posts = Post.objects.filter(
            id__in=Subquery(latest_post.values('id')),
            author__in=Subquery(user_following),
        ).order_by('?').select_related('author__profile')

        recommendation = ''
        return posts

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        stories, is_viewed_stories = self.fetch_followed_stories()
        recommendation = self.get_recommendations()
        c_def = self.get_user_context(title=f'Feed', exist_my_stories=self.exist_my_stories(),
                                      stories=stories, is_viewed_stories=is_viewed_stories,
                                      recommendations=recommendation)
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
        check_profile = User.objects.filter(username=username).first()

        if not check_profile:
            user = self.request.user

            delta = timezone.now() - user.profile.username_change_time
            if delta >= datetime.timedelta(days=14):
                user.profile.username_change_time = timezone.now()
                user.username = username
                user.save()
            else:
                days_left = datetime.timedelta(days=14) - delta
                if days_left.days >= 1:
                    day_type = 'days' if days_left.days > 1 else 'day'
                    return JsonResponse({'status': False, 'error': 'username',
                                         'message': f'Next username change in {days_left.days} {day_type}.'})
                else:
                    return JsonResponse({'status': False, 'error': 'username',
                                         'message': 'The next user name change will be available within 24 hours.'})
        else:
            if check_profile != self.request.user:
                return JsonResponse({'status': False, 'error': 'username',
                                     'message': 'This Username is already taken!'})

        form.save()
        return JsonResponse({'status': True})


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
        notifications = ProfileNotification.objects.filter(profile=self.request.user).order_by('-pk')[:12]
        return notifications

    def get_context_data(self, **kwargs):
        read_notifications = ProfileNotification.objects.filter(profile=self.request.user, read=False)

        for notification in read_notifications:
            notification.read = True
            notification.save()

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
            followers = ProfileFollow.objects.filter(profile=user)[:12]
            follow = ProfileFollow.objects.filter(user=self.request.user, profile__in=[f.user for f in followers])
            follow_set = set(f.profile for f in follow)

            for follower in followers:
                follower.is_follow = follower.user in follow_set

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
            following = ProfileFollow.objects.filter(user=user)[:12]
            follow = ProfileFollow.objects.filter(user=self.request.user, profile__in=[f.profile for f in following])
            follow_set = set(f.profile for f in follow)

            for follow in following:
                follow.is_follow = follow.profile in follow_set

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
            post.comments = PostComment.objects.filter(post_id=post.pk).order_by('-pk')[:12]
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
            users = PostLike.objects.filter(post=post_id)[:12]
            follow = ProfileFollow.objects.filter(user=self.request.user, profile__in=[f.user for f in users])
            follow_set = set(f.profile for f in follow)

            for user in users:
                user.is_follow = user.user in follow_set

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

        profile = self.request.user.profile
        profile.amount_article = profile.amount_article + 1
        profile.save()

        return redirect('profile', username=self.request.user.username)


# Story
class StoryCreateView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/create-story.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Create story')
        return {**context, **c_def}


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


# API
class PostAPIView(APIView):

    def get(self, request, *args, **kwargs):
        outset = int(request.GET.get('outset'))
        author = int(request.GET.get('author'))

        user = User.objects.get(pk=author)
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

        if user.profile.private and not is_follower and user != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        posts = (Post.objects.filter(author=author)
                 .order_by('-pk')
                 .select_related('author')
                 .annotate(like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
                           bookmark_exists=Exists(
                               PostBookmark.objects.filter(user=self.request.user,
                                                           post=OuterRef('pk'))))[outset:outset+12])

        for post in posts:
            post.author_full_name = post.author.profile.full_name
            post.author_verify = post.author.profile.verify
            post.author_avatar = post.author.profile.avatar
            post.author_background_avatar = post.author.profile.background_avatar

        return Response({'posts': PostSerializer(posts, many=True).data})

    def delete(self, request, *args, **kwargs):
        post_id = int(request.data.get('post_id'))
        post = Post.objects.get(pk=post_id)

        if post.author == self.request.user:
            post.delete()
            return Response({'status': True})

        return Response({'status': False})


class PostFileAPIView(APIView):

    def get(self, request, *args, **kwargs):
        post = int(request.GET.get('post_id'))
        files = PostFile.objects.filter(post=post)

        if len(files) > 0:
            user = files[0].post.author
            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

            if user.profile.private and not is_follower and user != self.request.user:
                raise PermissionDenied({'error': 'Forbidden'})

        for file in files:
            file.extension = file.get_extension()

        return Response({'files': PostFileSerializer(files, many=True).data})


class PostCommentAPIView(APIView):

    def get(self, request, *args, **kwargs):
        post_author = request.GET.get('post_author')
        post_id = int(request.GET.get('post_id'))
        outset = int(request.GET.get('outset'))
        post_author = User.objects.get(pk=post_author)
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=post_author).exists()

        if post_author.profile.private and not is_follower and post_author != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        comments = PostComment.objects.filter(post=post_id).order_by('-pk')[outset:outset+12]

        for comment in comments:
            comment.username = comment.user.username
            comment.full_name = comment.user.profile.full_name
            comment.avatar = comment.user.profile.avatar
            comment.verify = comment.user.profile.verify

        return Response({'comments': PostCommentSerializer(comments, many=True).data})

    def post(self, request, *args, **kwargs):
        data = request.data
        post_id = int(data.get('post_id'))
        post_author = int(data.get('post_author'))
        content = data.get('content')
        user = User.objects.get(pk=post_author)
        post = Post.objects.get(pk=post_id)
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

        if user.profile.private and not is_follower and user != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        new_comment = PostComment.objects.create(post=post, user=self.request.user, content=content)
        if user != self.request.user:
            ProfileNotification.objects.get_or_create(profile=user, user=self.request.user,
                                                      type='comment', type_id=post_id)

        post.amount_comments = post.amount_comments + 1
        post.save()

        return Response({'status': True, 'comment_pk': new_comment.pk})

    def delete(self, request, *args, **kwargs):
        data = request.data
        comment_id = int(data.get('comment_id'))
        post_id = int(data.get('post_id'))

        comment = PostComment.objects.get(pk=comment_id)
        if comment.user == self.request.user:
            post = Post.objects.get(pk=post_id)
            post.amount_comments = post.amount_comments - 1
            post.save()
            comment.delete()
            return Response({'status': True})
        else:
            return Response({'status': False})


class UserListAPIView(APIView):

    def get(self, request, *args, **kwargs):
        request_type = request.GET.get('type')
        outset = int(request.GET.get('outset'))
        user_id = request.GET.get('user_id')
        post_id = request.GET.get('post_id')
        users = []

        user = User.objects.get(pk=user_id)
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

        if user.profile.private and not is_follower and user != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        if request_type == 'follower':
            queryset = ProfileFollow.objects.filter(profile=user_id).select_related('user')[outset:outset+12]
            users = [follow.user for follow in queryset]
            following_users = ProfileFollow.objects.filter(user=self.request.user, profile__in=users)
            following_users_set = set(f.profile for f in following_users)

            for follower in users:
                follower.is_follow = follower in following_users_set

        elif request_type == 'following':
            queryset = ProfileFollow.objects.filter(user=user_id).select_related('profile')[outset:outset+12]
            users = [follow.profile for follow in queryset]
            followed_users = ProfileFollow.objects.filter(user=self.request.user, profile__in=users)
            followed_users_set = set(f.profile for f in followed_users)

            for follow in users:
                follow.is_follow = follow in followed_users_set

        elif request_type == 'like':
            queryset = PostLike.objects.filter(post=post_id).select_related('user')[outset:outset + 12]
            users = [follow.user for follow in queryset]
            following_users = ProfileFollow.objects.filter(user=self.request.user, profile__in=users)
            following_users_set = set(f.profile for f in following_users)

            for user in users:
                user.is_follow = user in following_users_set

        for user in users:
            user.full_name = user.profile.full_name
            user.verify = user.profile.verify
            user.avatar = user.profile.avatar

        return Response({'users': UserListSerializer(users, many=True).data})


class SearchAPIView(APIView):

    def get(self, request, *args, **kwargs):
        query = request.GET.get('query')
        outset = int(request.GET.get('outset'))

        users = Profile.objects.filter(Q(user__username__icontains=query) |
                                       Q(full_name__icontains=query))[outset:outset+12]

        for user in users:
            user.pk = user.user.pk
            user.username = user.user.username
            user.is_follow = False

        return Response({'users': UserListSerializer(users, many=True).data})


class ProfileFollowAPIView(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        user_id = int(data.get('user_id'))
        user = User.objects.get(pk=user_id)
        follow_exists = ProfileFollow.objects.filter(profile=user, user=self.request.user).exists()

        if not follow_exists:
            ProfileFollow.objects.create(profile=user, user=self.request.user)
            Profile.objects.filter(user=user).update(amount_followers=F('amount_followers') + 1)
            Profile.objects.filter(user=self.request.user).update(amount_following=F('amount_following') + 1)

            ProfileNotification.objects.get_or_create(profile=user, user=self.request.user, type='follow')
        else:
            return Response({'status': False})

        return Response({'status': True})

    def delete(self, request, *args, **kwargs):
        data = request.data
        user_id = int(data.get('user_id'))
        user = User.objects.get(pk=user_id)
        follow_exists = ProfileFollow.objects.filter(profile=user, user=self.request.user).exists()

        if follow_exists:
            follow = ProfileFollow.objects.get(profile=user, user=self.request.user)
            follow.delete()
            Profile.objects.filter(user=user).update(amount_followers=F('amount_followers') - 1)
            Profile.objects.filter(user=self.request.user).update(amount_following=F('amount_following') - 1)
        else:
            return Response({'status': False})

        return Response({'status': True})


class ProfileNotificationAPIView(APIView):

    def get(self, request, *args, **kwargs):
        outset = int(request.GET.get('outset'))
        notifications = ProfileNotification.objects.filter(profile=self.request.user).order_by('-pk')[outset:outset+12]

        return Response({'notifications': ProfileNotificationSerializer(notifications, many=True).data})


class StoryCreateAPIView(APIView):

    def post(self, request, *args, **kwargs):
        video_content = request.data.get('video_content')
        print(video_content)
        Story.objects.create(author=self.request.user, video_content=video_content)
        return Response({'status': True})

class ActivityAPIView(APIView):

    def get(self, request, *args, **kwargs):
        outset = int(request.GET.get('outset'))
        activity_type = request.GET.get('activity_type')

        if activity_type == 'likes':
            post_likes = PostLike.objects.filter(user=self.request.user
                                                 ).select_related('post').order_by('-pk')[outset:outset+12]
            posts = [post_like.post for post_like in post_likes]
            return Response({'posts': ActivityPostSerializer(posts, many=True).data})

        elif activity_type == 'bookmarks':
            post_likes = PostBookmark.objects.filter(user=self.request.user
                                                     ).select_related('post').order_by('-pk')[outset:outset + 12]
            posts = [post_like.post for post_like in post_likes]
            return Response({'posts': ActivityPostSerializer(posts, many=True).data})

        elif activity_type == 'comment':
            comments = PostComment.objects.filter(user=self.request.user).select_related('post').order_by('-pk')[outset:outset + 12]

            for comment in comments:
                comment.post_id = comment.post.pk

            return Response({'comments': ActivityCommentSerializer(comments, many=True).data})

    def post(self, request, *args, **kwargs):
        activity_type = request.data.get('activity_type')
        post_id = int(request.data.get('post_id'))
        post = Post.objects.get(pk=post_id)

        if activity_type == 'like':
            PostLike.objects.get_or_create(post=post, user=self.request.user)
            post.amount_likes = post.amount_likes + 1
            post.save()

            ProfileNotification.objects.get_or_create(profile=post.author, user=self.request.user, type='like')
            return Response({'status': True})

        elif activity_type == 'bookmark':
            PostBookmark.objects.get_or_create(post=post, user=self.request.user)
            return Response({'status': True})

    def delete(self, request, *args, **kwargs):
        activity_type = request.data.get('activity_type')
        post_id = int(request.data.get('post_id'))
        post = Post.objects.get(pk=post_id)

        if activity_type == 'like':
            like = PostLike.objects.get(post=post, user=self.request.user)
            like.delete()
            post.amount_likes = post.amount_likes - 1
            post.save()
            return Response({'status': True})

        elif activity_type == 'bookmark':
            bookmark = PostBookmark.objects.get(post=post, user=self.request.user)
            bookmark.delete()
            return Response({'status': True})


class HomeStoriesAPIView(APIView):

    def get(self, request, *args, **kwargs):
        is_viewed_stories = request.GET.get('is_viewed_stories') == 'true'
        outset = int(request.GET.get('outset'))

        stories = self.get_stories(is_viewed_stories, outset)
        return Response({
            'stories': HomeStoriesSerializer(stories, many=True).data,
            'is_viewed_stories': is_viewed_stories
        })

    def get_stories(self, is_viewed_stories, outset):
        user_following = ProfileFollow.objects.filter(user=self.request.user).values('profile')
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('author'))
        latest_story = Story.objects.filter(author=OuterRef('author')).order_by('-pk')
        is_viewer = Story.objects.filter(viewers=self.request.user, id=OuterRef('id'))

        stories = Story.objects.filter(
            id__in=Subquery(latest_story.values('id')[:1]),
            author__in=Subquery(user_following),
            time_create__gte=timezone.now() - datetime.timedelta(days=1)
        ).annotate(
            is_private=Exists(Profile.objects.filter(user=OuterRef('author'), private=True)),
            is_follower=Exists(is_follower),
            is_viewed=Exists(is_viewer)
        ).filter(
            (Q(is_private=False) | Q(is_follower=True)) & Q(is_viewed=is_viewed_stories)
        ).select_related('author__profile').prefetch_related('author__profile')[outset:outset + 21]

        return stories

