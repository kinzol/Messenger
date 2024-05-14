function changeSpanStat() {
    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.querySelectorAll('.mc-profile-user-stat-span');

        elements.forEach(function(element) {
            element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        });
    });
};


changeSpanStat();


function changeStyleArticlesMini() {
    var miniButton = document.querySelector('.cs-articles-mini');
    var fullButton = document.querySelector('.cs-articles-full');
    var miniContainer = document.querySelector('.mc-feed-article-container-mini');
    var fullContainer = document.querySelector('.mc-feed-article-container');

    miniButton.style.opacity = 1;
    fullButton.style.opacity = 0.6;

    fullContainer.classList.remove('mc-feed-article-container-show');
    setTimeout(() => {
        fullContainer.style.display = 'none';
    }, 150);

    setTimeout(() => {
        miniContainer.style.display = 'flex';
        miniContainer.classList.add('mc-feed-article-container-show');
    }, 150);
};


function changeStyleArticlesFull() {
    var miniButton = document.querySelector('.cs-articles-mini');
    var fullButton = document.querySelector('.cs-articles-full');
    var miniContainer = document.querySelector('.mc-feed-article-container-mini');
    var fullContainer = document.querySelector('.mc-feed-article-container');

    fullButton.style.opacity = 1;
    miniButton.style.opacity = 0.6;

    miniContainer.classList.remove('mc-feed-article-container-show');
    setTimeout(() => {
        miniContainer.style.display = 'none';
    }, 150);

    setTimeout(() => {
        fullContainer.style.display = 'block';
        fullContainer.classList.add('mc-feed-article-container-show');
    }, 150);
};


function profileFollow() {
    var followButton = document.querySelector('.mc-profile-user-follow');
    var unfollowButton = document.querySelector('.mc-profile-user-unfollow');
    var mcProfileUserStatSpan = document.querySelectorAll('.mc-profile-user-stat-span')[1];

    $.ajax({
        url: '/api/v1/follow/',
        method: 'post',
        dataType: 'json',
        data: {user_id: user_id},
        success: function(data){
            if (data.status == true) {
                followButton.style.display = 'none';
                unfollowButton.style.display = 'flex';
                mcProfileUserStatSpan.textContent = parseInt(
                    mcProfileUserStatSpan.textContent.replace(' ', '')) + 1;
                mcProfileUserStatSpan.textContent = mcProfileUserStatSpan.textContent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            } else {
                notification(3, 'Could not subscribe, error occurred!')
            };
        }
    });
};


function profileUnfollow() {
    var followButton = document.querySelector('.mc-profile-user-follow');
    var unfollowButton = document.querySelector('.mc-profile-user-unfollow');
    var mcProfileUserStatSpan = document.querySelectorAll('.mc-profile-user-stat-span')[1];

    $.ajax({
        url: '/api/v1/follow/',
        method: 'delete',
        dataType: 'json',
        data: {user_id: user_id},
        success: function(data){
            if (data.status == true) {
                unfollowButton.style.display = 'none';
                followButton.style.display = 'flex';
                mcProfileUserStatSpan.textContent = parseInt(
                    mcProfileUserStatSpan.textContent.replace(' ', '')) - 1;
                mcProfileUserStatSpan.textContent = mcProfileUserStatSpan.textContent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            } else {
                notification(3, 'Could not unsubscribe, error occurred!')
            };
        }
    });
}

var dataLoading = true;
var offset = 12;
window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;

        $.ajax({
            url: '/api/v1/post/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset, author: parseInt(user_id)},
            success: function(data){
                dataProcessing(data);
            }
        });
        
    }
};

function dataProcessing(posts) {
    if (posts.posts.length == 0) {
        return;
    }

    posts.posts.forEach((post) => {
        createPost(post);
    });

    dataLoading = true;
    offset += 12;
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


function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const options1 = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate1 = new Intl.DateTimeFormat(undefined, options1).format(date);

    const options2 = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    const formattedDate2 = new Intl.DateTimeFormat(undefined, options2).format(date);
    
    return { format1: formattedDate1, format2: formattedDate2 };
}

function formatDateOnline(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    let formattedDate;
    if (diffDays > 355) {
        const options = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit'};
        formattedDate = new Intl.DateTimeFormat(undefined, options).format(date);
    } else {
        const options = { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        formattedDate = new Intl.DateTimeFormat(undefined, options).format(date);
    };

    return formattedDate;
};

document.addEventListener("DOMContentLoaded", (event) => {
    var mcFeedArticleTime = document.querySelectorAll('.mc-feed-article-time');
    var mcFeedArticleCount = document.querySelectorAll('.mc-feed-article-count');
    var mcProfileUserOnlineTime = document.querySelector('.mc-profile-user-online-time');

    if (mcProfileUserOnlineTime.innerHTML != 'Online') {
        mcProfileUserOnlineTime.innerHTML = formatDateOnline(mcProfileUserOnlineTime.innerHTML);
    };

    mcFeedArticleCount.forEach((count) => {
        count.textContent = count.textContent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    });
    
    mcFeedArticleTime.forEach((post) => {
        var formattedDates = formatDate(post.innerHTML);
        post.innerHTML = formattedDates.format2;
    });
});
