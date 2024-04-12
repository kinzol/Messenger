function liveCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/live/NONE`);
    notification(1, "Link successfully copied");
};

var chatStyle = 1;
function changeChatStyle() {
    var liveChat = document.querySelector('.live-chat');

    if (chatStyle == 0) {
        liveChat.classList.remove('live-chat-hide');
        chatStyle = 1;
    } else if (chatStyle == 1) {
        liveChat.classList.add('live-chat-full');
        chatStyle = 2;
    } else if (chatStyle == 2) {
        liveChat.classList.remove('live-chat-full');
        liveChat.classList.add('live-chat-hide');
        chatStyle = 0;
    };
};

function scrollToBottomAnyway() {
    var chatFieldScroll = document.querySelector(`.live-chat`);
    if (chatFieldScroll) {
        chatFieldScroll.scroll({ top: chatFieldScroll.scrollHeight, behavior: 'smooth' });
    };
};

function changeLiveUserCount() {
    var element = document.querySelector('.live-user-counter-num');
    element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};