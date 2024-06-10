from rest_framework import serializers

from .models import *


# Post serializers
class PostSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    author = serializers.CharField()
    content = serializers.CharField()
    time_create = serializers.DateTimeField()

    amount_likes = serializers.IntegerField()
    amount_comments = serializers.IntegerField()
    like_exists = serializers.BooleanField()
    bookmark_exists = serializers.BooleanField()
    viewed_story_exists = serializers.BooleanField()

    author_full_name = serializers.SerializerMethodField()
    author_verify = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    author_background_avatar = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_author_full_name(self, obj):
        return obj.author.profile.full_name

    def get_author_verify(self, obj):
        return obj.author.profile.verify

    def get_author_avatar(self, obj):
        return obj.author.profile.avatar.url

    def get_author_background_avatar(self, obj):
        return obj.author.profile.background_avatar.url

    def get_tags(self, obj):
        return [tag.tag for tag in obj.tags.all()]

    def get_files(self, obj):
        return [{'file_url': file.file.url, 'extension': file.get_extension()} for file in obj.postfile_set.all()]


class PostCommentSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    content = serializers.CharField()
    time_create = serializers.DateTimeField()

    username = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    verify = serializers.SerializerMethodField()

    def get_username(self, obj):
        return obj.user.username

    def get_full_name(self, obj):
        return obj.user.profile.full_name

    def get_avatar(self, obj):
        return obj.user.profile.avatar.url

    def get_verify(self, obj):
        return obj.user.profile.verify


# UserList serializers
class UserListSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    username = serializers.CharField()

    full_name = serializers.SerializerMethodField()
    verify = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    is_follow = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return obj.profile.full_name

    def get_verify(self, obj):
        return obj.profile.verify

    def get_avatar(self, obj):
        return obj.profile.avatar.url

    def get_is_follow(self, obj):
        return obj.is_follow


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
    files = serializers.SerializerMethodField()

    def get_files(self, obj):
        return [{'file_url': file.file.url, 'extension': file.get_extension()} for file in obj.postfile_set.all()]


class ActivityCommentSerializer(serializers.Serializer):
    post_id = serializers.IntegerField()
    content = serializers.CharField()


class StorySerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    author = serializers.CharField()
    author_full_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    video_content_url = serializers.SerializerMethodField()

    def get_author_full_name(self, obj):
        return obj.author.profile.full_name

    def get_author_avatar(self, obj):
        return obj.author.profile.avatar.url

    def get_video_content_url(self, obj):
        return obj.video_content.url


class HomeStoriesSerializer(serializers.Serializer):
    author = serializers.CharField()
    author_full_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    is_viewed = serializers.BooleanField()

    def get_author_full_name(self, obj):
        return obj.author.profile.full_name

    def get_author_avatar(self, obj):
        return obj.author.profile.avatar.url


class ChatSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    username = serializers.CharField()

    profile_full_name = serializers.SerializerMethodField()
    profile_verify = serializers.SerializerMethodField()
    profile_avatar = serializers.SerializerMethodField()
    profile_online_status = serializers.SerializerMethodField()
    profile_online_time = serializers.SerializerMethodField()
    profile_uuid = serializers.SerializerMethodField()

    last_message_text = serializers.CharField()
    last_message_type = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    viewed_story_exists = serializers.BooleanField()
    count_unread = serializers.IntegerField()

    def get_profile_full_name(self, obj):
        return obj.profile.full_name

    def get_profile_verify(self, obj):
        return obj.profile.verify

    def get_profile_avatar(self, obj):
        return obj.profile.avatar.url

    def get_profile_online_status(self, obj):
        return obj.profile.online_status

    def get_profile_online_time(self, obj):
        return obj.profile.last_online

    def get_profile_uuid(self, obj):
        return obj.profile.uuid


class ChatMessageReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessageReaction
        fields = ['pk', 'reaction', 'user']


class ChatMessageSerializer(serializers.ModelSerializer):
    message = serializers.CharField(required=False, allow_null=True)
    reply_message = serializers.CharField(required=False, allow_null=True)
    reactions = ChatMessageReactionSerializer(many=True, read_only=True, source='reaction')

    class Meta:
        model = ChatMessage
        exclude = ['reaction']

