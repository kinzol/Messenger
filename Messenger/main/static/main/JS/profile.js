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

    followButton.style.display = 'none';
    unfollowButton.style.display = 'flex';
};


function profileUnfollow() {
    followButton = document.querySelector('.mc-profile-user-follow');
    unfollowButton = document.querySelector('.mc-profile-user-unfollow');

    unfollowButton.style.display = 'none';
    followButton.style.display = 'flex';
}

