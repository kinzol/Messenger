import datetime
import mimetypes

import os

from django.core.validators import FileExtensionValidator
from django.db import models
from django.contrib.auth.models import User


# Profile models
def avatar_directory_path(instance, filename):
    user_id = instance.user.id
    return os.path.join('uploads', f'user_{user_id}', 'avatar.jpg')


def bg_avatar_directory_path(instance, filename):
    user_id = instance.user.id
    return os.path.join('uploads', f'user_{user_id}', 'background_avatar.jpg')


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uuid = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    bio = models.TextField(max_length=255, blank=True, null=True, default='')

    avatar = models.ImageField(upload_to=avatar_directory_path, default='default_avatar.jpg')
    background_avatar = models.ImageField(upload_to=bg_avatar_directory_path, default='default_background_avatar.jpg')
    background_style = models.IntegerField(default=0)

    amount_followers = models.IntegerField(default=0)
    amount_following = models.IntegerField(default=0)
    amount_article = models.IntegerField(default=0)

    recommendations = models.TextField(null=True, default='')

    verify = models.BooleanField(blank=True, default=False)
    language = models.CharField(max_length=255, default='en')
    private = models.BooleanField(default=False)
    last_online = models.DateTimeField(blank=True)
    online_status = models.BooleanField(default=False)
    username_change_time = models.DateTimeField(blank=True)

    def save(self, *args, **kwargs):
        if self.pk:
            profile = Profile.objects.get(pk=self.pk)
            if profile.avatar != self.avatar and profile.avatar != 'default_avatar.jpg':
                profile.avatar.delete(save=False)
            elif (profile.background_avatar != self.background_avatar and
                  profile.background_avatar != 'default_background_avatar.jpg'):
                profile.background_avatar.delete(save=False)
        super(Profile, self).save(*args, **kwargs)


class ProfileFollow(models.Model):
    profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')


class ProfileNotification(models.Model):
    profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notify_profile')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=255)
    type_id = models.IntegerField(default=0)
    time_create = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    read = models.BooleanField(default=False)


# Post models
class PostTag(models.Model):
    tag = models.CharField(max_length=255)


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=255, blank=True, null=True)
    time_create = models.DateTimeField(auto_now_add=True)

    tags = models.ManyToManyField(PostTag, related_name='post_tags')
    amount_likes = models.IntegerField(default=0)
    amount_comments = models.IntegerField(default=0)


def post_file_directory_path(instance, filename):
    user_id = instance.post.author.id
    post_id = instance.post.pk
    return os.path.join('uploads', f'user_{user_id}', 'posts',
                        f'post_{post_id}', f'file.{filename.split(".")[-1]}')


class PostFile(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    file = models.FileField(upload_to=post_file_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def get_extension(self):
        mime, _ = mimetypes.guess_type(self.file.name)
        return mime.split('/')[0]


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class PostBookmark(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class PostComment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=300)
    time_create = models.DateTimeField(auto_now_add=True)


# Story models
def story_file_directory_path(instance, filename):
    user_id = instance.author.id
    return os.path.join('uploads', f'user_{user_id}', 'story', 'story.mp4')


class Story(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    viewers = models.ManyToManyField(User, related_name='viewer_users')
    view_count = models.IntegerField(default=0)
    video_content = models.FileField(upload_to=story_file_directory_path, validators=[FileExtensionValidator(
                    allowed_extensions=['MOV', 'avi', 'mp4', 'webm', 'mkv'])])
    video_content_length = models.CharField(max_length=255, default=0)
    time_create = models.DateTimeField(auto_now_add=True)
