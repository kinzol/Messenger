function offFullScreenPhoto() {
    var fullScreen = document.querySelector('.full-screen-photo');

    fullScreen.style.opacity = '0';
    setTimeout(() => {fullScreen.style.display = 'none';}, 150);
};


function OnFullScreenPhoto(element) {
    var fullScreen = document.querySelector('.full-screen-photo');
    var fullScreenImg = document.querySelector('.full-screen-content');

    fullScreenImg.src = element.src;
    fullScreen.style.display = 'flex';
    setTimeout(() => {fullScreen.style.opacity = '1';}, 10);
};

function showMobileMenu() {
    var mobileMenu = document.querySelector(".mobile-full-buttons");
    mobileMenu.classList.remove('block-hide-menu');
    mobileMenu.classList.add('block-show-menu');
    statusBlockMenu = true;
};

function sharePost(shareUser, shareUserUuid) {
    shareUser = parseInt(shareUser);

    webSocketChat.send(JSON.stringify({
        'send_type': 'chat_message',
        'target_user_uuid': shareUserUuid,
        'type': 'post',
        'message': 'View post',
        'forwarded_content': `${window.location.origin}/post/${sharePostId}`,
        'reply_id': null,
        'reply_message': null,
        'call_time': null,
        'file': null,
        'file_name': null,
        'from_user': userId,
        'to_user': shareUser,
        'new_chat': false,
    }));
};


function shareStory(shareUser, shareUserUuid, urlContent, shareUserName, urlUserAvatar) {
    var indexStory = stories_id.indexOf(story_id)
    var baseURL = window.location.href.split('?')[0];
    var storyLink = `${baseURL}?story_id=${stories_id[indexStory]}&redirect_to=/chat`;

    webSocketChat.send(JSON.stringify({
        'send_type': 'chat_message',
        'target_user_uuid': shareUserUuid,
        'type': 'story',
        'message': 'Story',
        'forwarded_content': storyLink,
        'reply_id': null,
        'reply_message': `${urlContent}|@|${urlUserAvatar}|@|${shareUserName}`,
        'call_time': null,
        'file': null,
        'file_name': null,
        'from_user': userId,
        'to_user': shareUser,
        'new_chat': false,
    }));
};