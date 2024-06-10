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
from django.db.models import Exists, OuterRef, Q, F, Case, When, BooleanField, Subquery, Prefetch, Max, Count, Window, \
    Func, Value, IntegerField
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


# Mixins
class RecommendationMixin:
    def generate_recommendations(self):
        follow_recommendation = self.get_follow_recommendations()
        for_user_recommendations = self.get_for_user_recommendations()
        random_recommendations = self.get_random_recommendations()

        recommendations = list(chain(follow_recommendation, for_user_recommendations, random_recommendations))
        random.shuffle(recommendations)

        return recommendations

    def get_follow_recommendations(self):
        user_following = ProfileFollow.objects.filter(user=self.request.user).values('profile')
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('profile'))

        latest_post = Post.objects.filter(author=OuterRef('author')).order_by('?')[:3]

        follow_recommendations = Post.objects.filter(
            author__in=Subquery(user_following),
            id__in=Subquery(latest_post.values('id')),
            author__profile__private=False,
        ).annotate(
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('author'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).order_by('?').select_related('author__profile').prefetch_related('tags', 'postfile_set')[:2]

        return follow_recommendations

    def get_for_user_recommendations(self):
        profile_recommendations = self.request.user.profile.recommendations.split(' ')
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('author'))

        for_user_recommendations = Post.objects.filter(
            Q(tags__tag__in=profile_recommendations),
            author__profile__private=False,
        ).annotate(
            is_follower=Exists(is_follower),
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('author'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).filter(
            Q(is_follower=True) | Q(author__profile__private=False)
        ).order_by('?').select_related('author__profile').prefetch_related('tags', 'postfile_set')[:3]

        return for_user_recommendations

    def get_random_recommendations(self):
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('author'))

        random_recommendations = Post.objects.filter(
            author__profile__private=False,
        ).annotate(
            is_follower=Exists(is_follower),
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('author'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).filter(
            Q(is_follower=True) | Q(author__profile__private=False)
        ).order_by('?').select_related('author__profile').prefetch_related('tags', 'postfile_set')[:5]

        return random_recommendations


class StoryMixin:

    def exist_my_stories(self):
        recent_time = timezone.now() - datetime.timedelta(days=1)
        exist_story = Story.objects.filter(author=self.request.user, time_create__gte=recent_time).exists()
        return exist_story

    def get_stories(self, is_viewed_stories, offset):
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
        ).select_related('author__profile').prefetch_related('author__profile')[offset:offset + 21]

        return stories


class HomeView(DataMixin, RecommendationMixin, StoryMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        recommendations = self.generate_recommendations()
        unviewed_stories = self.get_stories(is_viewed_stories=False, offset=0)

        if len(unviewed_stories) < 21:
            viewed_stories = self.get_stories(is_viewed_stories=True, offset=0)
            stories = chain(unviewed_stories, viewed_stories)
            is_viewed_stories = True
        else:
            stories = unviewed_stories
            is_viewed_stories = False

        c_def = self.get_user_context(title=f'Feed', exist_my_stories=self.exist_my_stories(),
                                      stories=stories, is_viewed_stories=is_viewed_stories,
                                      recommendations=recommendations)
        return {**context, **c_def}


class ChatView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/chat.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Chat')
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
        user = self.request.user

        if not check_profile or check_profile == user:
            if check_profile != user:
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
                                             'message': 'The next username change will be available within 24 hours.'})

            form.save()
            return JsonResponse({'status': True})
        else:
            return JsonResponse({'status': False, 'error': 'username',
                                 'message': 'This Username is already taken!'})


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
        user = User.objects.filter(
            username=username
        ).annotate(
            is_follower=Exists(ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('pk'))),
            is_following=Exists(ProfileFollow.objects.filter(profile=OuterRef('pk'), user=self.request.user)),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('pk'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).select_related('profile').first()

        return user

    def get_posts(self, user):
        posts = Post.objects.filter(
            author=user
        ).annotate(
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk')))
        ).select_related('author__profile').prefetch_related('tags', 'postfile_set').order_by('-pk')[:12]

        return posts

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        posts = self.get_posts(self.object)

        c_def = self.get_user_context(title=f'{self.object.username} - Profile', posts=posts)
        return {**context, **c_def}


class ProfileNotificationView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/notifications.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        notifications = ProfileNotification.objects.filter(
            profile=self.request.user
        ).select_related('user').order_by('-pk')[:12]
        read_notifications = ProfileNotification.objects.filter(profile=self.request.user, read=False)

        for notification in read_notifications:
            notification.read = True
            notification.save()

        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Notifications', notifications=notifications)
        return {**context, **c_def}


class ListFollowersView(DataMixin, LoginRequiredMixin, ListView):
    model = User
    template_name = 'main/users-list-followers.html'
    login_url = 'login'

    def get_object(self):
        username = self.kwargs.get('username')
        if username:
            user = User.objects.filter(username=username).select_related('profile').first()
            followers = ProfileFollow.objects.filter(
                profile=user
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('user')))
            ).order_by('-pk').select_related('user__profile')[:12]

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
            user = User.objects.filter(username=username).select_related('profile').first()
            following = ProfileFollow.objects.filter(
                user=user
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('profile')))
            ).order_by('-pk').select_related('profile__profile')[:12]

            is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

            if user.profile.private and not is_follower and user != self.request.user:
                raise Http404('This page is not available')

            return [user, following]
        else:
            raise Http404('Username not provided in URL')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user, users = self.get_object()
        c_def = self.get_user_context(title=f'{self.kwargs.get("username")} - Following', r_user=user, users=users)
        return {**context, **c_def}


# Post View
class PostView(DataMixin, LoginRequiredMixin, DetailView):
    model = Post
    template_name = 'main/post.html'
    login_url = 'login'

    def get_object(self, queryset=None):
        post_id = self.kwargs.get('pk')

        post = Post.objects.filter(pk=post_id).annotate(
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post_id=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post_id=OuterRef('pk'))),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('author'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).select_related('author__profile').prefetch_related('tags', 'postfile_set').first()

        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=post.author).exists()
        if post.author.profile.private and not is_follower and post.author != self.request.user:
            raise Http404('This page is not available')

        post.comments = PostComment.objects.filter(post_id=post.pk).select_related('user__profile').order_by('-pk')[:12]
        return post

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'{self.object.author.username} - Post')
        return {**context, **c_def}


class PostLikesView(DataMixin, LoginRequiredMixin, ListView):
    model = User
    template_name = 'main/users-list-like.html'
    login_url = 'login'

    def get_object(self):
        post_id = self.kwargs.get('pk')
        if post_id:
            post = Post.objects.filter(pk=post_id).select_related('author__profile').first()

            users = PostLike.objects.filter(
                post=post_id
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('user')))
            ).order_by('-pk').select_related('user__profile')[:12]

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
        post = Post(
            author=self.request.user,
            content=form.cleaned_data.get('content')
        )
        post.save()

        tags = form.cleaned_data.get('tags').split(' ')
        for tag_name in tags:
            tag, created = PostTag.objects.get_or_create(tag=tag_name)
            post.tags.add(tag)

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
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Create story')
        return {**context, **c_def}


class StoryView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/story.html'
    login_url = 'login'

    def get_stories(self):
        author = self.request.user
        request_story = self.request.GET.get('story_id')
        activity = self.request.GET.get('activity')
        redirect_to = self.request.GET.get('redirect_to')

        if redirect_to is None:
            redirect_to = ''

        if activity == 'True':
            request_story = int(request_story)

            stories = Story.objects.filter(author=author, pk=request_story)

            if len(stories) == 0:
                raise Http404

            return {'stories_author': author, 'stories': stories,
                    'story_id': request_story, 'last_story': stories[0], 'redirect_to': redirect_to}

        if request_story:
            request_story = int(request_story)

        if self.kwargs.get('username') != author.username:
            author = User.objects.filter(
                username=self.kwargs.get('username')
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=OuterRef('pk'), profile=self.request.user)),
            ).filter(
                Q(profile__private=False) | Q(is_follow=True)
            ).select_related('profile').first()

            if not author:
                raise Http404

        recent_time = timezone.now() - datetime.timedelta(days=1)
        stories = Story.objects.filter(
            author=author,
            time_create__gte=recent_time
        ).annotate(
            is_viewed=Exists(Story.viewers.through.objects.filter(story_id=OuterRef('pk'),
                                                                  user_id=self.request.user.id))
        ).order_by('pk')

        if len(stories) == 0:
            raise Http404

        for story in stories:
            if (request_story and story.pk == request_story) or (not story.is_viewed and not request_story):
                story_id = story.pk
                if not self.request.user in story.viewers.all():
                    story.viewers.add(self.request.user)
                    story.view_count += 1
                    story.save()
                break
        else:
            story_id = stories[0].pk

        return {'stories_author': author, 'stories': stories,
                'story_id': story_id, 'last_story': stories[len(stories)-1], 'redirect_to': redirect_to}

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        stories = self.get_stories()
        c_def = self.get_user_context(title=f'Story')
        return {**context, **c_def, **stories}


class LiveView(DataMixin, LoginRequiredMixin, TemplateView):
    template_name = 'main/live.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = User.objects.filter(username=self.kwargs.get('username')).select_related('profile').first()
        c_def = self.get_user_context(title=f'Live', user=user)
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
        posts = PostLike.objects.filter(
            user=self.request.user
        ).select_related('post').prefetch_related('post__postfile_set').order_by('-pk')[:12]

        return [post.post for post in posts]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Activity likes', posts=self.get_object(), type='likes')
        return {**context, **c_def}


class ActivityBookmarksView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-like.html'
    login_url = 'login'

    def get_object(self):
        posts = PostBookmark.objects.filter(
            user=self.request.user
        ).select_related('post').prefetch_related('post__postfile_set').order_by('-pk')[:12]

        return [post.post for post in posts]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Activity bookmarks', posts=self.get_object(), type='bookmarks')
        return {**context, **c_def}


class ActivityCommentsView(DataMixin, LoginRequiredMixin, ListView):
    model = Post
    template_name = 'main/activity-comment.html'
    login_url = 'login'

    def get_object(self):
        comments = PostComment.objects.filter(user=self.request.user).select_related('post').order_by('-pk')[:12]
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
        stories = Story.objects.filter(author=self.request.user).order_by('-pk')[:9]
        return stories

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title=f'Stories history', stories=self.get_object())
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
class PostAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        offset = int(request.GET.get('offset'))
        author = int(request.GET.get('author'))

        user = User.objects.get(pk=author)
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

        if user.profile.private and not is_follower and user != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        posts = Post.objects.filter(
            author=author
        ).annotate(
            like_exists=Exists(PostLike.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            bookmark_exists=Exists(PostBookmark.objects.filter(user=self.request.user, post=OuterRef('pk'))),
            viewed_story_exists=Exists(Story.objects.filter(
                author=OuterRef('author'),
                time_create__gte=timezone.now() - datetime.timedelta(days=1)
            ))
        ).order_by('-pk').select_related('author__profile').prefetch_related('tags', 'postfile_set')[offset:offset+12]

        return Response({'posts': PostSerializer(posts, many=True).data})

    def delete(self, request, *args, **kwargs):
        post_id = int(request.data.get('post_id'))
        post = Post.objects.get(pk=post_id)

        if post.author == self.request.user:
            post.delete()

            profile = self.request.user.profile
            profile.amount_article = profile.amount_article - 1
            profile.save()
            return Response({'status': True})

        return Response({'status': False})


class PostCommentAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        post_author = request.GET.get('post_author')
        post_id = int(request.GET.get('post_id'))
        offset = int(request.GET.get('offset'))
        post_author = User.objects.filter(pk=post_author).select_related('profile').first()
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=post_author).exists()

        if post_author.profile.private and not is_follower and post_author != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        comments = PostComment.objects.filter(
            post=post_id
        ).select_related('user', 'user__profile').order_by('-pk')[offset:offset+12]

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


class UserListAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        request_type = request.GET.get('type')
        offset = int(request.GET.get('offset'))
        user_id = request.GET.get('user_id')
        post_id = request.GET.get('post_id')
        users = []

        user = User.objects.filter(pk=user_id).select_related('profile').first()
        is_follower = ProfileFollow.objects.filter(profile=self.request.user, user=user).exists()

        if user.profile.private and not is_follower and user != self.request.user:
            raise PermissionDenied({'error': 'Forbidden'})

        if request_type == 'follower':
            query = ProfileFollow.objects.filter(
                profile=user
            ).order_by('-pk').values('user')[offset:offset + 12]

            users = User.objects.filter(
                id__in=query
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('pk'))),
            ).select_related('profile')

        elif request_type == 'following':
            query = ProfileFollow.objects.filter(
                user=user
            ).order_by('-pk').values('profile')[offset:offset + 12]

            users = User.objects.filter(
                id__in=query
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('pk'))),
            ).select_related('profile')

        elif request_type == 'like':
            query = PostLike.objects.filter(
                post=post_id
            ).order_by('-pk').select_related('user').values('user')[offset:offset + 12]

            users = User.objects.filter(
                id__in=query
            ).annotate(
                is_follow=Exists(ProfileFollow.objects.filter(user=self.request.user, profile=OuterRef('pk'))),
            ).select_related('profile')

        return Response({'users': UserListSerializer(users, many=True).data})


class SearchAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        query = request.GET.get('query')
        offset = int(request.GET.get('offset'))

        users = User.objects.filter(
            Q(username__icontains=query) | Q(profile__full_name__icontains=query)
        ).annotate(
            is_follow=Exists(ProfileFollow.objects.filter(profile=self.request.user, user=OuterRef('pk')))
        ).select_related('profile')[offset:offset+12]

        return Response({'users': UserListSerializer(users, many=True).data})


class ProfileAPIView(LoginRequiredMixin, APIView):

    def post(self, request, *args, **kwargs):
        profile = self.request.user.profile
        recommendation = profile.recommendations.lower().split(' ')
        tags = request.data.get('tags').lower().split('#')[1:]

        recommendation = [item for item in recommendation if item not in tags]
        profile.recommendations = ' '.join(recommendation)

        profile.save()
        return Response({'status': True})


class ProfileFollowAPIView(LoginRequiredMixin, APIView):

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


class ProfileNotificationAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        offset = int(request.GET.get('offset'))
        notifications = ProfileNotification.objects.filter(
            profile=self.request.user
        ).select_related('user', 'profile').order_by('-pk')[offset:offset+12]

        return Response({'notifications': ProfileNotificationSerializer(notifications, many=True).data})


class StoryAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        get_type = request.GET.get('get_type')

        if get_type == 'activity':
            offset = int(request.GET.get('offset'))
            stories = Story.objects.filter(
                author=self.request.user
            ).order_by('-pk').select_related('author__profile')[offset:offset + 9]

            return Response({'stories': StorySerializer(stories, many=True).data})

    def post(self, request, *args, **kwargs):
        video_content = request.data.get('video_content')
        video_content_length = request.data.get('video_duration')
        Story.objects.create(author=self.request.user, video_content=video_content,
                             video_content_length=video_content_length)
        return Response({'status': True})

    def delete(self, request, *args, **kwargs):
        story_id = int(request.data.get('story_id'))
        story = Story.objects.filter(pk=story_id, author=self.request.user)

        if story:
            story.delete()
            return Response({'status': True})
        else:
            return Response({'status': False})


class ActivityAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        offset = int(request.GET.get('offset'))
        activity_type = request.GET.get('activity_type')

        if activity_type == 'likes':
            post_likes = PostLike.objects.filter(
                user=self.request.user
            ).select_related('post').prefetch_related('post__postfile_set').order_by('-pk')[offset:offset+12]

            posts = [post_like.post for post_like in post_likes]
            return Response({'posts': ActivityPostSerializer(posts, many=True).data})

        elif activity_type == 'bookmarks':
            post_likes = PostBookmark.objects.filter(
                user=self.request.user
            ).select_related('post').prefetch_related('post__postfile_set').order_by('-pk')[offset:offset + 12]

            posts = [post_like.post for post_like in post_likes]
            return Response({'posts': ActivityPostSerializer(posts, many=True).data})

        elif activity_type == 'comment':
            comments = PostComment.objects.filter(user=self.request.user).select_related('post').order_by('-pk')[offset:offset + 12]

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

            self.change_recommendation(post)

            ProfileNotification.objects.get_or_create(profile=post.author, user=self.request.user, type='like')
            return Response({'status': True})

        elif activity_type == 'bookmark':
            PostBookmark.objects.get_or_create(post=post, user=self.request.user)
            self.change_recommendation(post)
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

    def change_recommendation(self, post):
        profile = self.request.user.profile
        recommendations = profile.recommendations.split(' ')

        tags = post.tags.all()
        for tag in tags:
            if not tag.tag in recommendations:
                recommendations.insert(0, tag.tag)

        profile.recommendations = ' '.join(recommendations[:20])
        profile.save()


class HomeStoriesAPIView(LoginRequiredMixin, StoryMixin, APIView):

    def get(self, request, *args, **kwargs):
        is_viewed_stories = request.GET.get('is_viewed_stories') == 'true'
        offset = int(request.GET.get('offset'))

        stories = self.get_stories(is_viewed_stories, offset)
        return Response({
            'stories': HomeStoriesSerializer(stories, many=True).data,
            'is_viewed_stories': is_viewed_stories
        })
#FIXME: Reporter.objects.update(stories_filed=F("stories_filed") + 1) update some info


class PostRecommendationAPIView(LoginRequiredMixin, RecommendationMixin, APIView):

    def get(self, request, *args, **kwargs):
        posts = self.generate_recommendations()

        return Response({'posts': PostSerializer(posts, many=True).data})


class ChatAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        get_type = request.GET.get('get_type')

        if get_type == 'chats':
            offset = int(request.GET.get('offset'))
            user = self.request.user

            last_message = ChatMessage.objects.filter(
                (Q(from_user=OuterRef('pk')) | Q(to_user=OuterRef('pk'))) & (Q(from_user=user) | Q(to_user=user))
            ).order_by('-pk')[:1]

            unread_messages_count = ChatMessage.objects.filter(
                Q(from_user=OuterRef('pk')) & Q(to_user=user) & Q(read=False)
            ).values('from_user').annotate(count=Count('pk')).values('count')

            chats = user.profile.chats.all().annotate(
                last_message_text=Subquery(last_message.values('message')),
                last_message_type=Subquery(last_message.values('type')),
                last_message_time=Subquery(last_message.values('time_create')),
                viewed_story_exists=Exists(Story.objects.filter(
                    author=OuterRef('pk'),
                    time_create__gte=timezone.now() - datetime.timedelta(days=1)
                )),
                count_unread=Subquery(unread_messages_count)
            ).order_by('-last_message_time')[offset:offset + 10].select_related('profile')

            for chat in chats:
                if chat.last_message_text:
                    chat.last_message_text = decrypt_message(chat.last_message_text).decode()

            return Response({'chats': ChatSerializer(chats, many=True).data})

        elif get_type == 'user_info':
            user_id = int(request.GET.get('user_id'))

            user = User.objects.filter(
                pk=user_id
            ).select_related('profile').first()
            return Response({'full_name': user.profile.full_name, 'avatar': user.profile.avatar.url})


class ChatMessageAPIView(LoginRequiredMixin, APIView):

    def get(self, request, *args, **kwargs):
        offset = int(request.GET.get('offset'))
        interlocutor_id = int(request.GET.get('interlocutor'))
        user = self.request.user

        messages = ChatMessage.objects.filter(
            (Q(from_user=interlocutor_id) | Q(to_user=interlocutor_id)) & (Q(from_user=user) | Q(to_user=user))
        ).prefetch_related('reaction').order_by('-pk')[offset:offset + 15]

        unread_messages = ChatMessage.objects.filter(
            Q(from_user=interlocutor_id) & Q(to_user=user)
        ).filter(read=False).order_by('-pk')

        unread_messages.update(read=True)

        for message in messages:
            if message.message:
                message.message = decrypt_message(message.message).decode()

            if message.reply_message:
                message.reply_message = decrypt_message(message.reply_message).decode()

        return Response({'messages': ChatMessageSerializer(messages, many=True).data})
