from django.urls import path, re_path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    re_path(r'^chat/$', ChatView.as_view(), name='chat'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('search/', SearchView.as_view(), name='search'),

    path('call/', CallView.as_view(), name='call'),

    # Profile
    path('profile/<slug:username>/', ProfileView.as_view(), name='profile'),
    path('notifications/', ProfileNotificationView.as_view(), name='profile_notification'),
    path('followers/<slug:username>/', ListFollowersView.as_view(), name='list_followers'),
    path('following/<slug:username>/', ListFollowingView.as_view(), name='list_following'),

    # Post
    path('post/<slug:pk>/', PostView.as_view(), name='post'),
    path('post/likes/<slug:pk>/', PostLikesView.as_view(), name='post_likes'),
    path('create/post/', PostCreateView.as_view(), name='create_post'),

    # Story
    path('create/story/', StoryCreateView.as_view(), name='story_create'),
    path('story/<slug:username>/', StoryView.as_view(), name='story'),
    path('live/<slug:username>/', LiveView.as_view(), name='live'),

    # Activity
    path('activity/', ActivityView.as_view(), name='activity'),
    path('activity/likes', ActivityLikesView.as_view(), name='activity_likes'),
    path('activity/bookmarks', ActivityBookmarksView.as_view(), name='activity_bookmarks'),
    path('activity/comments', ActivityCommentsView.as_view(), name='activity_comments'),
    path('activity/stories', ActivityStoriesView.as_view(), name='activity_stories'),

    # Authentication
    path('logout/', logout_user, name='logout'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('registration/', RegisterUserView.as_view(), name='register'),

    # API
    re_path(r'^api/v1/profile/$', ProfileAPIView.as_view()),
    re_path(r'^api/v1/notification/$', ProfileNotificationAPIView.as_view()),
    re_path(r'^api/v1/search/$', SearchAPIView.as_view()),

    re_path(r'^api/v1/chat/chats/$', ChatAPIView.as_view()),
    re_path(r'^api/v1/chat/message/$', ChatMessageAPIView.as_view()),

    re_path(r'^api/v1/post/$', PostAPIView.as_view()),
    re_path(r'^api/v1/post/comment/$', PostCommentAPIView.as_view()),
    path('api/v1/post/recommendation/', PostRecommendationAPIView.as_view()),

    re_path(r'^api/v1/user/list/$', UserListAPIView.as_view()),
    re_path(r'^api/v1/follow/$', ProfileFollowAPIView.as_view()),
    re_path(r'^api/v1/activity/$', ActivityAPIView.as_view()),

    re_path(r'^api/v1/story/$', StoryAPIView.as_view()),
    re_path(r'^api/v1/home/stories/$', HomeStoriesAPIView.as_view()),
]
