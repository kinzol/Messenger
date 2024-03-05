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

    fullContainer.classList.remove('block-show-articles');
    fullContainer.classList.add('block-hide-articles');

    setTimeout(() => {
        miniContainer.style.removeProperty('display');
        miniContainer.classList.remove('block-hide-articles');
        miniContainer.classList.add('block-show-articles');
    }, 250);
};


function changeStyleArticlesFull() {
    var miniButton = document.querySelector('.cs-articles-mini');
    var fullButton = document.querySelector('.cs-articles-full');
    var miniContainer = document.querySelector('.mc-feed-article-container-mini');
    var fullContainer = document.querySelector('.mc-feed-article-container');

    fullButton.style.opacity = 1;
    miniButton.style.opacity = 0.6;

    miniContainer.classList.remove('block-show-articles');
    miniContainer.classList.add('block-hide-articles');

    setTimeout(() => {
        fullContainer.classList.remove('block-hide-articles');
        fullContainer.classList.add('block-show-articles');
        fullContainer.style.display = 'block';
    }, 250);
};


function profileFollow() {
    var followButton = document.querySelector('.mc-profile-user-follow');
    var unfollowButton = document.querySelector('.mc-profile-user-unfollow');

    followButton.style.display = 'none';
    unfollowButton.style.display = 'flex';
};


function profileUnfollow() {
    followButton = document.querySelector('.mc-profile-user-follow');
    unfollowButton = document.querySelector('.mc-profile-user-unfollow');

    unfollowButton.style.display = 'none';
    followButton.style.display = 'flex';
}

