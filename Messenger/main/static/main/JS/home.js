var storiesContainer = document.querySelector('.mc-feed-stories-story-container');

var statusBlockMenu = false;
var statusBlockShare = false;

var sharePostId = 0;

if (storiesContainer != null) {
    if ((storiesContainer.scrollWidth > storiesContainer.clientWidth) && (window.innerWidth >= 510)) {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-right');
        storiesRightButton.style.display = 'block';
    
        storiesContainer.addEventListener('scroll', function () {
            changeBottonsVisibility();
        });
    };
};


function changeBottonsVisibility() {
    var scrollPosition = storiesContainer.scrollLeft;
    var maxScrollPosition = storiesContainer.scrollWidth - storiesContainer.clientWidth;

    if (scrollPosition == 0) {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-left');
        storiesRightButton.style.display = 'none';
    } else {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-left');
        storiesRightButton.style.display = 'block';
    };

    if (scrollPosition == maxScrollPosition) {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-right');
        storiesRightButton.style.display = 'none';
    } else {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-right');
        storiesRightButton.style.display = 'block';
    };
};


function scrollContainerLeft() {
    var storiesContainer = document.querySelector('.mc-feed-stories-story-container');
    const containerWidth = storiesContainer.clientWidth;

    storiesContainer.scrollBy({
        left: containerWidth,
        behavior: 'smooth'
    });
};


function scrollContainerRight() {
    var storiesContainer = document.querySelector('.mc-feed-stories-story-container');
    const containerWidth = storiesContainer.clientWidth;

    storiesContainer.scrollBy({
        left: -containerWidth,
        behavior: 'smooth'
    });
};


function changeLikeCount() {
    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.querySelectorAll('.mc-feed-article-count');

        elements.forEach(function(element) {
            element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        });
    });
};


changeLikeCount();


function addLikeArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-liked`);

    $.ajax({
        url: '/api/v1/activity/',
        method: 'post',
        dataType: 'json',
        data: {post_id: thisElement.getAttribute('data-id'), activity_type: 'like'},
        success: function(data){
            if (data.status) {
                var likeCount = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-fd-art-c-like`);
                var likeCountNew = parseInt(likeCount.innerHTML.replace(/ /g, '', 10)) + 1;
                likeCount.innerHTML = likeCountNew.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                element.style.display = 'block';
                thisElement.style.display = 'none';
            } else {
                notification(3, 'Error occurred!')
            };
        }
    });

};


function removeLikeArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-like`);

    $.ajax({
        url: '/api/v1/activity/',
        method: 'delete',
        dataType: 'json',
        data: {post_id: thisElement.getAttribute('data-id'), activity_type: 'like'},
        success: function(data){
            if (data.status) {
                var likeCount = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-fd-art-c-like`);
                var likeCountNew = parseInt(likeCount.innerHTML.replace(/ /g, '', 10)) - 1;
                likeCount.innerHTML = likeCountNew.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                element.style.display = 'block';
                thisElement.style.display = 'none';
            } else {
                notification(3, 'Error occurred!')
            };
        }
    });
};


function addSaveArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-save-filled`);

    $.ajax({
        url: '/api/v1/activity/',
        method: 'post',
        dataType: 'json',
        data: {post_id: thisElement.getAttribute('data-id'), activity_type: 'bookmark'},
        success: function(data){
            if (data.status) {
                element.style.display = 'block';
                thisElement.style.display = 'none';
            } else {
                notification(3, 'Error occurred!')
            };
        }
    });
};


function removerSaveArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-save`);

    $.ajax({
        url: '/api/v1/activity/',
        method: 'delete',
        dataType: 'json',
        data: {post_id: thisElement.getAttribute('data-id'), activity_type: 'bookmark'},
        success: function(data){
            if (data.status) {
                element.style.display = 'block';
                thisElement.style.display = 'none';
            } else {
                notification(3, 'Error occurred!')
            };
        }
    });
};


function shareFilter(inputFields) {
            var searchText = inputFields.value.toLowerCase();
            var userContainer = document.querySelector(`.share-container`);
            var userList = userContainer.querySelector('.share-userlist').querySelectorAll('.share-user');

            userList.forEach(function(user) {
                var userName = user.querySelector('.share-user-second-name').textContent.toLowerCase();
                var secondUserName = user.querySelector('.share-user-name').textContent.toLowerCase();
                
                if (userName.includes(searchText) || secondUserName.includes(searchText)) {
                    user.style.display = 'flex';
                } else {
                    user.style.display = 'none';
                }
            });
};


function showShareContainer(element) {
    var shareContainer = document.querySelector(`.share-container-background`);
    sharePostId = element.getAttribute('data-id')

    shareContainer.style.display = 'block';
    setTimeout(() => {shareContainer.style.opacity = '1';}, 20)
    statusBlockShare = true;
};


function hideShareContainer() {
    var shareContainer = document.querySelector(`.share-container-background`);

    shareContainer.style.opacity = '0';
    setTimeout(() => {shareContainer.style.display = 'none';}, 250)
    statusBlockShare = false;
};


document.addEventListener('click', function(event) {
    var targetElement = event.target;
    
    var articlesMenu = document.querySelectorAll('.mc-feed-article-menu');
    var articlesMenuButtons = document.querySelectorAll('.mc-feed-article-menu-img');

    var shareContainer = document.querySelectorAll('.mc-feed-article-share-container');
    var shareButton = document.querySelectorAll('.mc-feed-article-share');

    var mobileFullButtons = document.querySelector('.mobile-full-buttons');
    var mobileButtons = document.querySelector('.mobile-buttons');

    var isClickInsideMobileFullButtons = mobileFullButtons.contains(targetElement);
    var isClickInsideMobileButtons = mobileButtons.contains(targetElement);

    var isClickInsideShareButton = false;
    shareButton.forEach(function(shareButtons) {
        if (shareButtons.contains(targetElement)) {
            isClickInsideShareButton = true;
        };
    });

    var isClickInsideShareContainer = false;
    shareContainer.forEach(function(shareContainers) {
        if (shareContainers.contains(targetElement)) {
            isClickInsideShareContainer = true;
        };
    });

    var isClickInsideArticleMenuButton = false;
    articlesMenuButtons.forEach(function(articleMenuButton) {
        if (articleMenuButton.contains(targetElement)) {
            isClickInsideArticleMenuButton = true;
        };
    });

    articlesMenu.forEach(function(articleMenu) {
        if (!(articleMenu.contains(targetElement) || isClickInsideArticleMenuButton)) {
            if (articleMenu.classList.contains('block-show-article-menu')) {

                var shareArticle = document.querySelector(`[data-id="${articleMenu.getAttribute('data-id')}"].mc-feed-article`);
                shareArticle.classList.remove('share-background');
                
                articleMenu.classList.remove('block-show-article-menu');
                articleMenu.classList.add('block-hide-article-menu');
            };
        };
    });


    if (!isClickInsideMobileFullButtons && !isClickInsideMobileButtons && statusBlockMenu) {
        mobileFullButtons.classList.remove('block-show-menu');
        mobileFullButtons.classList.add('block-hide-menu');
        statusBlockMenu = false;
    };

    if (!isClickInsideShareButton && !isClickInsideShareContainer && statusBlockShare) {
        shareContainer.forEach(function(block) {
            if (block.classList.contains('block-show-share')) {
                block.classList.remove('block-show-share');
                block.classList.add('block-hide-share');
                statusBlockShare = false;

                var shareArticle = document.querySelector(`[data-id="${block.getAttribute('data-id')}"].mc-feed-article`);

                shareArticle.classList.remove('share-background');
            };
        });
    };
});


function showMobileMenu() {
    var mobileMenu = document.querySelector(".mobile-full-buttons");
    mobileMenu.classList.remove('block-hide-menu');
    mobileMenu.classList.add('block-show-menu');
    statusBlockMenu = true;
};


function openArticleMenu(element) {
    var articleMenu = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-feed-article-menu`);
    var shareArticle = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-feed-article`);

    shareArticle.classList.add('share-background')
    
    articleMenu.classList.remove('block-hide-article-menu');
    articleMenu.classList.add('block-show-article-menu');
};


function articleCopyLink(element) {
    navigator.clipboard.writeText(`${window.location.origin}/post/${element.getAttribute('data-id')}`);
    notification(1, "Link successfully copied");
};


function articleNotInterested(element) {
    var getArticle = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-feed-article`);
    getArticle.classList.add('mc-feed-article-show-less');
    setTimeout(() => {
        getArticle.innerHTML = '<div class="mc-feed-article-not-interested">We will show less of content like this</div>';
    }, 500);

    var mcFeedArticleHashtags = getArticle.querySelector('.mc-feed-article-hashtags');

    $.ajax({
        url: '/api/v1/profile/',
        method: 'post',
        dataType: 'json',
        data: {tags: mcFeedArticleHashtags.textContent.replace(/\s+/g, '')},
    });

};


function articleDelete(element) {
    var mcFeedArticle = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-feed-article`);
    confirmationDialog('Are you sure you want to delete post?').then((value) => {
        if (value) {

            $.ajax({
                url: '/api/v1/post/',
                method: 'delete',
                dataType: 'json',
                data: {post_id: element.getAttribute('data-id')},
                success: function(data){
                    if (data.status == true) {
                        dataRemoveArticle(mcFeedArticle);
                    };
                }
            });
        };
    });
};


function dataRemoveArticle(mcFeedArticle) {
    mcFeedArticle.style.height = `${mcFeedArticle.offsetHeight}px`;
    mcFeedArticle.style.opacity = '0';
    setTimeout(() => {
        mcFeedArticle.style.height = `50px`;
        mcFeedArticle.style.display = 'flex';
        mcFeedArticle.style.alignItems = 'center';
        mcFeedArticle.style.justifyContent = 'center';
    }, 150);
    setTimeout(() => {
        mcFeedArticle.innerHTML = '<span class="nothing">Post was deleted</span>';
        mcFeedArticle.style.height = `50px`;
        mcFeedArticle.style.opacity = '1';
    }, 350);
};


var dataLoading = true;
var offset_stories = 21;
var isViewedStories = isViewedStr == 'True';

storiesContainer.onscroll = function(ev) {
    var scrollPosition = storiesContainer.scrollLeft;
    var maxScrollPosition = storiesContainer.scrollWidth - storiesContainer.clientWidth;
    if ((scrollPosition == maxScrollPosition) && dataLoading) {
        storyAjaxQuery();
    }
};


function storyAjaxQuery() {
    $.ajax({
        url: '/api/v1/home/stories/',
        method: 'get',
        dataType: 'json',
        data: {offset: offset_stories, is_viewed_stories: isViewedStories},
        success: function(data){
            console.log(data)
            storyDataLoad(data)
        }
    });
};


function storyDataLoad(data) {
    console.log(data.stories)

    if ((data.stories.length < 21) && !isViewedStories) {
        dataLoading = true;
        isViewedStories = true;
        offset_stories = 0;
        storyAjaxQuery();
    } else if ((data.stories.length < 21) && isViewedStories) {
        dataLoading = false;
    };


    var mcFeedStoriesStoryContainer = document.querySelector('.mc-feed-stories-story-container');
    var result = '';
    offset_stories += 21;

    data.stories.forEach((story) => {
        result += `<a class="stories-story" href="/${story.author.username}">`;
        console.log(story.is_viewed)
        if (story.is_viewed) {
            result += `<img class="stories-story-avatar-viewed-img" src="${story.author_avatar}" alt="${story.author.username}'s avatar">`;
        } else {
            result += `<div class="stories-story-avatar">
                <img class="stories-story-avatar-img" src="${story.author_avatar}" alt="${story.author.username}'s avatar"></div>`;
        };

        result += `<span class="stories-story-username">${story.author_full_name}</span></a>`;
    });

    mcFeedStoriesStoryContainer.innerHTML = mcFeedStoriesStoryContainer.innerHTML + result;
    changeBottonsVisibility();
};


function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const options1 = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate1 = new Intl.DateTimeFormat(undefined, options1).format(date);

    const options2 = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    const formattedDate2 = new Intl.DateTimeFormat(undefined, options2).format(date);
    
    return { format1: formattedDate1, format2: formattedDate2 };
}

document.addEventListener("DOMContentLoaded", (event) => {
    var mcFeedArticleTime = document.querySelectorAll('.mc-feed-article-time');
    var mcFeedArticleCount = document.querySelectorAll('.mc-feed-article-count');

    mcFeedArticleCount.forEach((count) => {
        count.textContent = count.textContent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    });
    
    mcFeedArticleTime.forEach((post) => {
        var formattedDates = formatDate(post.innerHTML);
        post.innerHTML = formattedDates.format2;
    });
});


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


// window.onscroll = function(ev) {
//     if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) {

//         $.ajax({
//             url: '/api/v1/post/recommendations/',
//             method: 'get',
//             dataType: 'json',
//             data: {},
//             success: function(data){
//                 console.log(data);
//             }
//         });
        
//     }
// };

