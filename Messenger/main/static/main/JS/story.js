// document.addEventListener("DOMContentLoaded", (event) => {
//     document.querySelector('.story-video').click();
//   });


var menuStatus = false;
var shareStatus = false;

function startVideo(element) {
    if (!menuStatus && !shareStatus) {
        var svgPlay = document.querySelector('.start-video-svg');
        var timelineNow = document.querySelector('.story-timeline-now');
        var controls = document.querySelector('.control-stories');

        svgPlay.classList.add('start-video-svg-hide')
        controls.style.display = 'flex';

        element.play();
        element.removeAttribute('onclick')

        console.log(timelineNow.duration)

        timelineNow.style.transition = `all ${element.duration}s linear`;
        timelineNow.style.maxWidth = '100%';
    };
};


function showMenu() {
    var menu = document.querySelector('.story-menu');
    menu.classList.add('story-menu-show');
    setTimeout(() => {menuStatus = true}, 100);
}

function hideMenu() {
    var menu = document.querySelector('.story-menu');
    menu.classList.remove('story-menu-show');
    setTimeout(() => {menuStatus = false}, 100);
}

function showShare() {
    var menu = document.querySelector('.story-share');
    menu.classList.add('story-share-show');
    hideMenu();
    setTimeout(() => {shareStatus = true}, 100);
}

function hideShare() {
    var menu = document.querySelector('.story-share');
    menu.classList.remove('story-share-show');
    setTimeout(() => {shareStatus = false}, 100);
}


document.addEventListener('click', function(event) {
    var targetElement = event.target;
    
    var menu = document.querySelector('.story-menu');
    var share = document.querySelector('.story-share');

    if (!menu.contains(targetElement) && menuStatus) {
        hideMenu()
    };

    if (!share.contains(targetElement) && shareStatus) {
        hideShare()
    };
});


function shareFilter(inputFields) {
    var searchText = inputFields.value.toLowerCase();
    var userContainer = document.querySelector('.story-share');
    var userList = userContainer.querySelectorAll('.story-share-user');

    userList.forEach(function(user) {
        var userName = user.querySelector('.story-share-user-userinfo-name').textContent.toLowerCase();
        var secondUserName = user.querySelector('.story-share-user-userinfo-login').textContent.toLowerCase();
        
        if (userName.includes(searchText) || secondUserName.includes(searchText)) {
            user.style.display = 'flex';
        } else {
            user.style.display = 'none';
        }
    });
};


function storyNext() {
    console.log('next story')
};

function storyPrevious() {
    console.log('previous story')
};


function storyCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/story/NONE`);
    notification(1, "Link successfully copied");
};
