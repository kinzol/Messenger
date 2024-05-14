var dataLoading = true;
var offset = 12;
window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;

        $.ajax({
            url: '/api/v1/user/list/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset, user_id: user_id, type: apiType, post_id: post_id},
            success: function(data){
                dataProcessing(data);
            }
        });
        
    }
};

function dataProcessing(users) {
    if (users.users.length == 0) {
        return;
    }

    var userlist = document.querySelector('.userlist');
    var result = '';

    users.users.forEach(function(user) {
        result += `<div class="userlist-user">
        <img src="${user.avatar}" alt="${user.username}'s avatar" class="userlist-user-avatar">
        <a href="/profile/${user.username}" class="userlist-user-username">
            <span class="userlist-user-username-name"> ${user.full_name}`;

        if (user.verify) {
            result += `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;
        };

        result += `</span><span class="userlist-user-username-login">${user.username}</span></a>`;
        if (user.pk != parseInt(my_id)) {
            if (user.is_follow) {
                result += `<div class="mc-profile-user-unfollow" data-id="${user.pk}" onclick="profileUnfollow(this)">Following</div>
                <div class="mc-profile-user-follow" data-id="${user.pk}" style="display:none;" onclick="profileFollow(this)">Follow</div>`;
            } else {
                result += `<div class="mc-profile-user-follow" data-id="${user.pk}" onclick="profileFollow(this)">Follow</div>
                <div class="mc-profile-user-unfollow" data-id="${user.pk}" style="display:none;" onclick="profileUnfollow(this)">Following</div>`;
            };
        };
        result += `</div>`;
    });

    userlist.innerHTML += result;
    
    dataLoading = true;
    offset += 12;
}


function profileFollow(element) {
    var user_id = element.getAttribute('data-id');
    var followButton = document.querySelector(`[data-id="${user_id}"].mc-profile-user-follow`);
    var unfollowButton = document.querySelector(`[data-id="${user_id}"].mc-profile-user-unfollow`);

    $.ajax({
        url: '/api/v1/follow/',
        method: 'post',
        dataType: 'json',
        data: {user_id: user_id},
        success: function(data){
            if (data.status == true) {
                followButton.style.display = 'none';
                unfollowButton.style.display = 'flex';
            } else {
                notification(3, 'Could not subscribe, error occurred!')
            };
        }
    });
};


function profileUnfollow(element) {
    var user_id = element.getAttribute('data-id');
    var followButton = document.querySelector(`[data-id="${user_id}"].mc-profile-user-follow`);
    var unfollowButton = document.querySelector(`[data-id="${user_id}"].mc-profile-user-unfollow`);

    $.ajax({
        url: '/api/v1/follow/',
        method: 'delete',
        dataType: 'json',
        data: {user_id: user_id},
        success: function(data){
            if (data.status == true) {
                unfollowButton.style.display = 'none';
                followButton.style.display = 'flex';
            } else {
                notification(3, 'Could not unsubscribe, error occurred!')
            };
        }
    });
};


$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    }
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}