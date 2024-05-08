from rest_framework import serializers

from .models import *


# Post serializers
class PostSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    author = serializers.CharField(max_length=255)
    author_full_name = serializers.CharField()
    author_verify = serializers.BooleanField()
    author_avatar = serializers.FileField()
    author_background_avatar = serializers.FileField()

    content = serializers.CharField(max_length=255)
    time_create = serializers.DateTimeField()

    tags = serializers.CharField(max_length=255)
    amount_likes = serializers.IntegerField()
    amount_comments = serializers.IntegerField()
    like_exists = serializers.BooleanField()
    bookmark_exists = serializers.BooleanField()


class PostFileSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    file = serializers.FileField()
    extension = serializers.CharField()


class PostCommentSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    avatar = serializers.FileField()
    verify = serializers.BooleanField()
    content = serializers.CharField()
    time_create = serializers.DateTimeField()


# UserList serializers
class UserListSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    verify = serializers.BooleanField()
    avatar = serializers.FileField()
    is_follow = serializers.BooleanField()

# Profile serializers
class ProfileNotificationSerializer(serializers.Serializer):
    profile = serializers.CharField()
    user = serializers.CharField()
    type = serializers.CharField()
    type_id = serializers.IntegerField()
    time_create = serializers.DateTimeField()


# Activity serializers
class ActivityPostSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    content = serializers.CharField()


class ActivityCommentSerializer(serializers.Serializer):
    post_id = serializers.IntegerField()
    content = serializers.CharField()


class ActivityStorySerializer(serializers.Serializer):
    pass


class HomeStoriesSerializer(serializers.Serializer):
    author = serializers.CharField()
    author_full_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    is_viewed = serializers.BooleanField()

    def get_author_full_name(self, obj):
        return obj.author.profile.full_name

    def get_author_avatar(self, obj):
        return obj.author.profile.avatar.url

