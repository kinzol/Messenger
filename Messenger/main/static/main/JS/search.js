var inputContent = null
var offset = 0;
var dataLoading = false;

function searchInput(element) {
    var tempInputContent = element.value;
    setTimeout(() => {
        var searchInputElement = document.querySelector('.search-input');
        if ((inputContent == tempInputContent) && (inputContent == searchInputElement.value) && (searchInputElement.value != '')) {
            console.log(searchInputElement.value);

            offset = 0;
            dataLoading = true;

            $.ajax({
                url: '/api/v1/search/',
                method: 'get',
                dataType: 'json',
                data: {offset: offset, query: searchInputElement.value},
                success: function(data){
                    appendSearchedUsers(data, true);
                }
            });

        };
        inputContent = searchInputElement.value;
    }, 1200);
};


function appendSearchedUsers(users, new_data) {
    var searchUsers = document.querySelector('.search-users');
    var searchUsersContent = '';
    var verified = `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;

    if (users.users.length == 0 && new_data) {
        return searchUsers.innerHTML = '<span class="nothing">No one was found</span>';
    } else if (users.users.length == 0) {
        return
    };

    users.users.forEach((user) => {
        var followed = `<div class="mc-profile-user-unfollow" data-id="${user.pk}" onclick="profileUnfollow(this)">Following</div>
                    <div class="mc-profile-user-follow" data-id="${user.pk}" style="display:none;" onclick="profileFollow(this)">Follow</div>`;

        var notFollowed = `<div class="mc-profile-user-follow" data-id="${user.pk}" onclick="profileFollow(this)">Follow</div>
                           <div class="mc-profile-user-unfollow" data-id="${user.pk}" style="display:none;" onclick="profileUnfollow(this)">Following</div>`;

        searchUsersContent += `
        <div class="search-users-container">
            <a href="/profile/${user.username}" style="display: flex;"><img src="${user.avatar}" alt="${user.username}'s image" class="search-users-container-avatar"></a>
            <a href="/profile/${user.username}" class="search-users-container-userinfo">
                <div class="sucu-name">${user.full_name}
                    ${user.verify ? verified : ''}
                </div>
                <div class="sucu-login">${user.username}</div>
            </a>
            ${my_id != user.pk ? (user.is_follow ? followed : notFollowed) : ''}
        </div>`;      
    });

    if (new_data) {
        searchUsers.innerHTML = searchUsersContent;
    } else {
        searchUsers.innerHTML += searchUsersContent;
    };
    dataLoading = true;
};


window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;
        offset += 12;
        var searchInputElement = document.querySelector('.search-input');

        if (searchInputElement.value == '') {return};

        $.ajax({
            url: '/api/v1/search/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset, query: searchInputElement.value},
            success: function(data){
                appendSearchedUsers(data, false);
            }
        });
        
    }
};


function profileFollow(element) {
    var followButton = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-profile-user-follow`);
    var unfollowButton = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-profile-user-unfollow`);

    $.ajax({
        url: '/api/v1/follow/',
        method: 'post',
        dataType: 'json',
        data: {user_id: element.getAttribute('data-id')},
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
    var followButton = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-profile-user-follow`);
    var unfollowButton = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-profile-user-unfollow`);

    $.ajax({
        url: '/api/v1/follow/',
        method: 'delete',
        dataType: 'json',
        data: {user_id: element.getAttribute('data-id')},
        success: function(data){
            if (data.status == true) {
                unfollowButton.style.display = 'none';
                followButton.style.display = 'flex';
            } else {
                notification(3, 'Could not unsubscribe, error occurred!')
            };
        }
    });
}

// Перед каждым AJAX-запросом включаем CSRF токен
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

