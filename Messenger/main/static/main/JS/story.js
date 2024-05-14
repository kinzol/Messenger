var stories_id

document.addEventListener("DOMContentLoaded", (event) => {
    stories_id = document.querySelector('.story-data-div');
    stories_id = stories_id.textContent.slice(0, -1).split(' ');

    var storyInfoTime = document.querySelector('.story-info-time');
    storyInfoTime.innerHTML = timeAgoOrFullDate(storyInfoTime.innerHTML);
    storyInfoTime.style.opacity = '1';

    var storyTimeline = document.querySelector('.story-timeline');
    var viewedStoriesTimeline = true;

    stories_id.forEach(story => {
        if (story == story_id){
            storyTimeline.innerHTML += '<div class="story-timeline-underviewed"><div class="story-timeline-now"></div></div>';
            viewedStoriesTimeline = false;
        } else if (viewedStoriesTimeline){
            storyTimeline.innerHTML += '<div class="story-timeline-viewed"></div>';
        } else if (!viewedStoriesTimeline){
            storyTimeline.innerHTML += '<div class="story-timeline-underviewed"></div>';
        };
    });

    console.log(stories_id);
});


var menuStatus = false;
var shareStatus = false;

function startVideo(element) {
    if (!menuStatus && !shareStatus) {
        var svgPlay = document.querySelector('.start-video-svg');
        var timelineNow = document.querySelector('.story-timeline-now');
        var controls = document.querySelector('.control-stories');
        var storyVideoBackground = document.querySelector('.story-video-background');
        
        svgPlay.classList.add('start-video-svg-hide')
        controls.style.display = 'flex';
        
        storyVideoBackground.play();
        element.play();
        element.removeAttribute('onclick')
        
        timelineNow.style.transition = `all ${element.getAttribute('data-len')}s linear`;
        timelineNow.style.width = '100%';

        setTimeout(() => {storyNext()}, parseFloat(element.getAttribute('data-len'))*1000)
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
    var indexStory = stories_id.indexOf(story_id)
    var storiesLength = stories_id.length
    var baseURL = window.location.href.split('?')[0];

    if ((indexStory + 2) > storiesLength) {
        window.location.href = window.location.origin;
    } else {
        window.location.href = `${baseURL}?story_id=${stories_id[indexStory + 1]}`;
    }; 
};

function storyPrevious() {
    var indexStory = stories_id.indexOf(story_id)
    var storiesLength = stories_id.length
    var baseURL = window.location.href.split('?')[0];

    if ((indexStory - 1) < 0) {
        window.location.href = window.location.href;
    } else {
        window.location.href = `${baseURL}?story_id=${stories_id[indexStory - 1]}`;
    }; 
};


function storyCopyLink() {
    var indexStory = stories_id.indexOf(story_id)
    var baseURL = window.location.href.split('?')[0];
    var storyLink = `${baseURL}?story_id=${stories_id[indexStory]}`;
    navigator.clipboard.writeText(storyLink);
    notification(1, "Link successfully copied");
};


function timeAgoOrFullDate(dateTimeString) {
    // Преобразование строки в объект Date
    const dateTime = new Date(dateTimeString);

    // Текущая дата и время
    const now = new Date();

    // Разница в миллисекундах между текущим временем и временем из строки
    const timeDiff = now - dateTime;

    // Перевод разницы в часы и минуты
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));

    // Если прошел меньше дня
    if (timeDiff < 24 * 60 * 60 * 1000) {
        // Если прошло менее часа
        if (hoursAgo < 1) {
            if (minutesAgo < 2) {
                return `${minutesAgo} minute ago`;
            } else {
                return `${minutesAgo} minutes ago`;
            };
        } else {
            if (hoursAgo < 2) {
                return `${hoursAgo} hour ago`;
            } else {
                return `${hoursAgo} hours ago`;
            }
        }
    } else {
        const options2 = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' };
        return new Intl.DateTimeFormat(undefined, options2).format(dateTime);
    }
}

