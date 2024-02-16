var storiesContainer = document.querySelector('.mc-feed-stories-story-container');

var statusBlockMenu = false;
var statusBlockShare = false;


if (storiesContainer != null) {
    if (storiesContainer.scrollWidth > storiesContainer.clientWidth) {
        var storiesRightButton = document.querySelector('.mc-feed-stories-scroll-right');
        storiesRightButton.style.display = 'block';
    
        storiesContainer.addEventListener('scroll', function () {
            const scrollPosition = storiesContainer.scrollLeft;
            const maxScrollPosition = storiesContainer.scrollWidth - storiesContainer.clientWidth;
        
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
        });
    };
};

function scrollContainerLeft() {
    var storiesContainer = document.querySelector('.mc-feed-stories-story-container');
    const containerWidth = storiesContainer.clientWidth;

    storiesContainer.scrollBy({
        left: containerWidth,
        behavior: 'smooth'
    });
}

function scrollContainerRight() {
    var storiesContainer = document.querySelector('.mc-feed-stories-story-container');
    const containerWidth = storiesContainer.clientWidth;

    storiesContainer.scrollBy({
        left: -containerWidth,
        behavior: 'smooth'
    });
}

function changeLikeCount() {
    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.querySelectorAll('.mc-feed-article-count');

        elements.forEach(function(element) {
            element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        });
    });
}

changeLikeCount()


function addLikeArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-liked`);
    element.style.display = 'block';
    thisElement.style.display = 'none';


    var likeCount = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-fd-art-c-like`);
    var likeCountNew = parseInt(likeCount.innerHTML.replace(/ /g, '', 10)) + 1;
    likeCount.innerHTML = likeCountNew.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function removeLikeArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-like`);
    element.style.display = 'block';
    thisElement.style.display = 'none';

    var likeCount = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-fd-art-c-like`);
    var likeCountNew = parseInt(likeCount.innerHTML.replace(/ /g, '', 10)) - 1;
    likeCount.innerHTML = likeCountNew.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function addSaveArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-save-filled`);
    element.style.display = 'block';
    thisElement.style.display = 'none';
}


function removerSaveArticle(thisElement) {
    var element = document.querySelector(`[data-id="${thisElement.getAttribute('data-id')}"].mc-feed-article-save`);
    element.style.display = 'block';
    thisElement.style.display = 'none';
}


function shareFilter(inputFields) {
            var searchText = inputFields.value.toLowerCase();
            var userContainer = document.querySelector(`[data-id="${inputFields.getAttribute('data-id')}"].mc-feed-article-share-container`);
            var userList = userContainer.querySelector('.mc-feed-article-share-userlist').querySelectorAll('.mc-feed-article-share-user');

            userList.forEach(function(user) {
                var userName = user.querySelector('.mc-feed-article-share-user-second-name').textContent.toLowerCase();
                var secondUserName = user.querySelector('.mc-feed-article-share-user-name').textContent.toLowerCase();
                
                if (userName.includes(searchText) || secondUserName.includes(searchText)) {
                    user.style.display = 'flex';
                } else {
                    user.style.display = 'none';
                }
            });
}


function showShareContainer(thisArticle) {
    var shareContainer = document.querySelector(`[data-id="${thisArticle.getAttribute('data-id')}"].mc-feed-article-share-container`);
    shareContainer.classList.remove('block-hide-share');
    shareContainer.classList.add('block-show-share');
    statusBlockShare = true;
}


function hideShareContainer(thisArticle) {
    var shareContainer = document.querySelector(`[data-id="${thisArticle.getAttribute('data-id')}"].mc-feed-article-share-container`);
    shareContainer.classList.remove('block-show-share');
    shareContainer.classList.add('block-hide-share');
    statusBlockShare = false;
}


document.addEventListener('click', function(event) {
    var targetElement = event.target;
    
    var articlesMenu = document.querySelectorAll('.mc-feed-article-menu');
    var articlesMenuButtons = document.querySelectorAll('.mc-feed-article-menu-img')

    var shareContainer = document.querySelectorAll('.mc-feed-article-share-container');
    var shareButton = document.querySelectorAll('.mc-feed-article-share')

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
                articleMenu.classList.remove('block-show-article-menu');
                articleMenu.classList.add('block-hide-article-menu');
            }
        };
    });


    if (!isClickInsideMobileFullButtons && !isClickInsideMobileButtons && statusBlockMenu) {
        mobileFullButtons.classList.remove('block-show-menu');
        mobileFullButtons.classList.add('block-hide-menu');
        statusBlockMenu = false;
    }

    if (!isClickInsideShareButton && !isClickInsideShareContainer && statusBlockShare) {
        shareContainer.forEach(function(block) {
            if (block.classList.contains('block-show-share')) {
                block.classList.remove('block-show-share');
                block.classList.add('block-hide-share');
                statusBlockShare = false;
            }
        });
    }
});


function showMobileMenu() {
    var mobileMenu = document.querySelector(".mobile-full-buttons");
    mobileMenu.classList.remove('block-hide-menu');
    mobileMenu.classList.add('block-show-menu');
    statusBlockMenu = true;
}


function openArticleMenu(element) {
    articleMenu = document.querySelector(`[data-id="${element.getAttribute('data-id')}"].mc-feed-article-menu`);
    
    articleMenu.classList.remove('block-hide-article-menu');
    articleMenu.classList.add('block-show-article-menu')
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

function articleCopyLink(element) {
    navigator.clipboard.writeText(`${window.location.origin}/post/${element.getAttribute('data-id')}`);
    notification(1, "Link successfully copied");
}

function offFullScreenPhoto(element) {
    element.classList.remove('full-screen-mode-show');
    element.classList.add('full-screen-mode-hide');
}

function OnFullScreenPhoto(element) {
    fullScreen = document.querySelector('.full-screen-photo');
    fullScreenImg = document.querySelector('.full-screen-content');

    fullScreenImg.src = element.src;
    fullScreen.classList.remove('full-screen-mode-hide');
    fullScreen.classList.add('full-screen-mode-show');
}
