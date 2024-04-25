from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('search/', SearchView.as_view(), name='search'),

    # Profile
    path('profile/<slug:username>/', ProfileView.as_view(), name='profile'),
    path('notifications/', ProfileNotificationView.as_view(), name='profile_notification'),
    path('followers/<slug:username>/', ListFollowersView.as_view(), name='list_followers'),
    path('following/<slug:username>/', ListFollowingView.as_view(), name='list_following'),

    # Post
    path('post/<slug:pk>/', PostView.as_view(), name='post'),
    path('post/likes/<slug:pk>/', PostLikesView.as_view(), name='post_likes'),
    path('create/post/', PostCreateView.as_view(), name='create_post'),

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
]
