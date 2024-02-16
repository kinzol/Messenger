function changeSpanStat() {
    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.querySelectorAll('.mc-profile-user-stat-span');

        elements.forEach(function(element) {
            element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        });
    });
};

changeSpanStat();


function changeStyleArticlesMini() {
    miniButton = document.querySelector('.cs-articles-mini');
    fullButton = document.querySelector('.cs-articles-full');
    miniContainer = document.querySelector('.mc-feed-article-container-mini');
    fullContainer = document.querySelector('.mc-feed-article-container');

    miniButton.style.opacity = 1;
    fullButton.style.opacity = 0.6;

    // miniContainer.style.display = 'flex';
    // fullContainer.style.display = 'none';

    fullContainer.classList.remove('block-show-articles');
    fullContainer.classList.add('block-hide-articles');

    setTimeout(() => {
        miniContainer.style.removeProperty('display');
        miniContainer.classList.remove('block-hide-articles');
        miniContainer.classList.add('block-show-articles');
    }, 250);
};

function changeStyleArticlesFull() {
    miniButton = document.querySelector('.cs-articles-mini');
    fullButton = document.querySelector('.cs-articles-full');
    miniContainer = document.querySelector('.mc-feed-article-container-mini');
    fullContainer = document.querySelector('.mc-feed-article-container');

    fullButton.style.opacity = 1;
    miniButton.style.opacity = 0.6;

    // miniContainer.style.display = 'none';

    miniContainer.classList.remove('block-show-articles');
    miniContainer.classList.add('block-hide-articles');

    setTimeout(() => {
        fullContainer.classList.remove('block-hide-articles');
        fullContainer.classList.add('block-show-articles');
        fullContainer.style.display = 'block';
    }, 250);
};


function profileFollow() {
    followButton = document.querySelector('.mc-profile-user-follow');
    unfollowButton = document.querySelector('.mc-profile-user-unfollow');

    followButton.style.display = 'none';
    unfollowButton.style.display = 'flex';
}


function profileUnfollow() {
    followButton = document.querySelector('.mc-profile-user-follow');
    unfollowButton = document.querySelector('.mc-profile-user-unfollow');

    unfollowButton.style.display = 'none';
    followButton.style.display = 'flex';
}


function notification(type, message) {
    var notifications = document.querySelector('.notifications');

    var notificationContainer = document.createElement('div');
    notifications.appendChild(notificationContainer);
    notificationContainer.classList.add('notifications-container');

    var notificationSide = document.createElement('div');
    notificationContainer.appendChild(notificationSide);
    notificationSide.classList.add('notifications-c-side');

    var notificationSideImg = document.createElement('img');
    notificationSide.appendChild(notificationSideImg);
    notificationSideImg.classList.add('notifications-c-img');

    var notificationContainerSpan = document.createElement('span');
    notificationContainer.appendChild(notificationContainerSpan);
    notificationContainerSpan.classList.add('notifications-c-span');
    notificationContainerSpan.innerHTML = message;

    var notificationTimeout = document.createElement('div');
    notificationContainer.appendChild(notificationTimeout);
    notificationTimeout.classList.add('notifications-c-timeout')

    if (type == 1) {
        notificationSide.classList.add('notifications-c-side-green');
        notificationTimeout.classList.add('notifications-c-side-green');
        notificationSideImg.src = notificationImgs[0];
    } else if (type == 2) {
        notificationSide.classList.add('notifications-c-side-blue');
        notificationTimeout.classList.add('notifications-c-side-blue');
        notificationSideImg.src = notificationImgs[1];
    } else if (type == 3) {
        notificationSide.classList.add('notifications-c-side-red');
        notificationTimeout.classList.add('notifications-c-side-red');
        notificationSideImg.src = notificationImgs[2];
    } else {
        console.error()
        notifications.removeChild(notificationContainer);
        throw new Error('Incorrect type id specified');
    }

    setTimeout(() => {
        notifications.removeChild(notificationContainer);
    }, 10000);
}

