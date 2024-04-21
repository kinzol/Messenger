from django.urls import path
from .views import *

urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('settings/', Settings.as_view(), name='settings'),
    path('profile/<slug:username>/', Profile.as_view(), name='profile'),

    # Authentication
    path('logout/', logout_user, name='logout'),
    path('login/', LoginUser.as_view(), name='login'),
    path('registration/', RegisterUser.as_view(), name='register'),
]
