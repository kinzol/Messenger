import os

from django.core.validators import FileExtensionValidator
from django.db import models
from django.contrib.auth.models import User


class ProfileNotification(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=255)
    time_create = models.DateTimeField(auto_now_add=True)


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
    followers = models.ManyToManyField(User, related_name='profile_followers')
    following = models.ManyToManyField(User, related_name='profile_following')

    avatar = models.ImageField(upload_to=avatar_directory_path, default='default_avatar.jpg')
    background_avatar = models.ImageField(upload_to=bg_avatar_directory_path, default='default_background_avatar.jpg')
    background_style = models.IntegerField(default=0)

    amount_followers = models.IntegerField(default=0)
    amount_following = models.IntegerField(default=0)
    amount_article = models.IntegerField(default=0)

    notifications = models.ManyToManyField(ProfileNotification, related_name='profile_notification')
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


class ArticleComment(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=300)
    time_create = models.DateTimeField(auto_now_add=True)


class ArticleTag(models.Model):
    content = models.CharField(max_length=255)


class Article(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=255)
    time_create = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(User, related_name='articles_likes')
    comments = models.ManyToManyField(ArticleComment)
    tags = models.ManyToManyField(ArticleTag, related_name='articles_likes')

    amount_likes = models.IntegerField(default=0)
    amount_comments = models.IntegerField(default=0)


class Story(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE)
    viewers = models.ManyToManyField(User, related_name='story_viewers')
    view_count = models.IntegerField(default=0)
    preview = models.ImageField(upload_to='story_video_preview')
    video_content = models.FileField(upload_to='story_video', validators=[FileExtensionValidator(
                    allowed_extensions=['MOV', 'avi', 'mp4', 'webm', 'mkv'])])
    time_create = models.DateTimeField(auto_now_add=True)
