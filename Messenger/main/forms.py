from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from .models import *


class SettingsForm(forms.ModelForm):
    username = forms.CharField(max_length=15, label='Username')
    avatar = forms.ImageField(widget=forms.FileInput(attrs={'onchange': 'changeAvatarImage(this)'}))
    background_avatar = forms.ImageField(widget=forms.FileInput(attrs={'onchange': 'changeBackgroundImage(this)'}))

    class Meta:
        model = Profile
        fields = ('full_name', 'bio', 'avatar', 'background_avatar', 'background_style', 'private')


class PostCreateForm(forms.ModelForm):
    files_content = forms.FileField(widget=forms.FileInput(attrs={'multiple': '', 'accept': 'image/*, video/*',
                                                                  'onchange': 'openFile()'}), required=False)

    class Meta:
        model = Post
        fields = ('content', 'tags')


class LoginUserForm(AuthenticationForm):
    username = forms.CharField(label='Login',
                               widget=forms.TextInput(attrs={'placeholder': 'Login', 'class': 'auth-input'}))
    password = forms.CharField(label='Password',
                               widget=forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'auth-input'}))


class RegisterUserForm(UserCreationForm):
    name = forms.CharField(max_length=15, label='Name',
                           widget=forms.TextInput(attrs={'placeholder': 'Name', 'class': 'auth-input'}))
    surname = forms.CharField(max_length=15, label='Surname',
                              widget=forms.TextInput(attrs={'placeholder': 'Surname', 'class': 'auth-input'}))
    username = forms.CharField(max_length=15, label='Username',
                               widget=forms.TextInput(attrs={'placeholder': 'Login', 'class': 'auth-input'}))
    email = forms.EmailField(label='Email',
                             widget=forms.EmailInput(attrs={'placeholder': 'Email', 'class': 'auth-input'}))
    password1 = forms.CharField(label='Password',
                                widget=forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'auth-input'}))
    password2 = forms.CharField(label='Password repeat',
                                widget=forms.PasswordInput(attrs={'placeholder': 'Password again',
                                                                  'class': 'auth-input'}))

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
