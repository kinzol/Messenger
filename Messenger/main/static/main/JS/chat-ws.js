var userId = 13;

function createMessage(message) {
    var chatSection = document.querySelector(`[chat-id="${message.from}"].chat-content-chat`);
    var chatCounter = document.querySelector(`[chat-id="${message.from}"].ccs-container-info-message-count`);
    raiseChat(message.from);

    if (!chatSection || (chatId != message.from)) {
        var chatCounterContainer = document.querySelector(`[chat-id="${message.from}"].ccs-container-info-message-container-second`);

        if (chatCounter) {
            chatCounter.innerHTML = parseInt(chatCounter.innerHTML) + 1;
        } else {
            chatCounterContainer.innerHTML = chatCounterContainer.innerHTML + `<div chat-id="${message.from}" class="ccs-container-info-message-count">1</div>`
        };
    };

    if ((chatId != message.from) && !(newMessagePlate.includes(message.from))) {
        // createMessagePlate(true, true, 'New messages');
        createMessagePlate('New messages', true, true, message.from);
        newMessagePlate.push(message.from);
    }
    
    if (!chatSection) {return};

    var newMessage = document.createElement('div');
    newMessage.classList.add('ccc-container');
    newMessage.setAttribute('message-id', message.id);
    newMessage.setAttribute('onclick', 'doubleClickMessage(this)');

    var chatInfoMessage = document.querySelector(`[chat-id='${message.from}'].ccs-container-info-message`);
    chatInfoMessage.innerHTML = message.text;

    if (message.read == true) {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickBlue}" alt="svg-view"></img>`
    } else {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickWhite}" alt="svg-view"></img>`
    };
    var additional = `<img message-id="${message.id}" class="ccc-container-additional ${message.from != userId ? 'ccc-contrary-additional' : ''}"
                      src="${svgAdditional}" alt="svg-additional" onclick="showMessageActions(this, false)">`

    var additionalReply = `<img message-id="${message.id}" class="ccc-container-additional ${message.from != userId ? 'ccc-contrary-additional' : ''}"
                      src="${svgAdditional}" alt="svg-additional" onclick="showMessageActions(this, true)">`

    if (message.text) {
        var parts = message.text.split(" ");
        var urls = parts.filter(part => part.startsWith("https://"));
        if (urls.length != 0) {
            urls.forEach((url, index) => {
                message.text = message.text.replace(url, `<div class="ccc-message-text-link" onclick='openLink(this)'>${url}</div>`)
            });
        };
    };


    if (message.type == 'text') {
        var result = `
                ${message.from == userId ? additionalReply : ''}
                <div message-id="${message.id}" class="ccc-message-text reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <span message-id="${message.id}" class="ccc-message-text-span">${message.text}</span>
                    <span class="ccc-message-time">${message.time}</span>
                    ${message.from == userId ? tick : ''}
                </div>
                ${message.from != userId ? additionalReply : ''}`;


    } else if (message.type == 'reply') {
        var result = `
                ${message.from == userId ? additionalReply : ''}
                <div message-id="${message.id}" class="ccc-message-text-reply reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <div reply-id="${message.reply_id}" class="ccc-message-reply" onclick='replyScrollMessage(this)'>
                        <span class="ccc-message-reply-span">${message.reply_text}</span>
                    </div>
                    <div class="ccc-message-container">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
                ${message.from != userId ? additionalReply : ''}`;


    } else if (message.type == 'image') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <div class="ccc-media-info">
                        ${message.time}
                        ${message.from == userId ? tick : ''}
                    </div>
                    <img class="ccc-media-content" src="${message.image}" onclick="OnFullScreenPhoto(this)" alt="${message.from}'s img">
                </div>
                ${message.from != userId ? additional : ''}`;

        chatInfoMessage.innerHTML = message.image.split('/').at(-1);


    } else if (message.type == 'video') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <div class="ccc-media-info">
                    ${message.time}
                    ${message.from == userId ? tick : ''}
                    </div>
                    <video controls class="ccc-media-content" alt="${message.from}'s video">
                        <source src="${message.video}">
                    </video>
                </div>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = message.video.split('/').at(-1);


    } else if (message.type == 'image-text') {
        var result = `
                ${message.from == userId ? additionalReply : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <img class="ccc-media-content ccc-media-content-text" src="${message.image}" onclick="OnFullScreenPhoto(this)" alt="${message.from}'s img">
                    <div class="ccc-message-container-media">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
                ${message.from != userId ? additionalReply : ''}`;


    } else if (message.type == 'video-text') {
        var result = `
                ${message.from == userId ? additionalReply : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <video controls class="ccc-media-content ccc-media-content-text" alt="${message.from}'s video">
                        <source src="${message.video}">
                    </video>
                    <div class="ccc-message-container-media">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
            </div>
            ${message.from != userId ? additionalReply : ''}`;


    } else if (message.type == 'audio') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-audio-container reaction-area ${message.from != userId ? 'ccc-contrary-audio' : ''}">
                    <audio controls src="${message.audio}"></audio>
                    <span class="ccc-message-time">${message.time}</span>
                    ${message.from == userId ? tick : ''}
                </div>
                ${message.from != userId ? additional : ''}`;

        chatInfoMessage.innerHTML = `Audio message`;


    } else if (message.type == 'file') {
        var requestFileSize = new XMLHttpRequest();
        requestFileSize.open("GET", message.file, false);
        requestFileSize.send();
        var fileSizeInBytes = parseInt(requestFileSize.getResponseHeader('content-length'));
        var fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        var result = `
                ${message.from == userId ? additional : ''}
                <a message-id="${message.id}" class="ccc-file-container reaction-area ${message.from != userId ? 'ccc-contrary' : ''}" href="${message.file}" download>
                    <img class="ccc-file-img" src="${svgFile}" alt="svg-image">
                    <div class="ccc-file-info">
                        <span class="ccc-file-info-name">${message.file.split('/').pop()}</span>
                        <div class="ccc-file-info-info">
                            <span class="ccc-file-size">${fileSizeInMB.toFixed(2)}MB</span>
                            <span class="ccc-message-time">${message.time}</span>
                            ${message.from == userId ? tick : ''}
                        </div>
                    </div>
                </a>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = message.file.split('/').at(-1);



    } else if (message.type == 'call') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-call-container reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <div class="ccc-call-info-container">
                        <span class="ccc-call-name">${message.from != userId ? 'Incoming call' : 'Outgoing call'}</span>
                        <span class="ccc-call-time">${message.time}, ${message.length}</span>
                    </div>
                    <img class="ccc-call-img" src="${svgCall}" alt="svg-image">
                </div>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = message.from != userId ? 'Incoming call' : 'Outgoing call';


    } else if (message.type == 'video-call') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-call-container reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <div class="ccc-call-info-container">
                        <span class="ccc-call-name">${message.from != userId ? 'Incoming video call' : 'Outgoing video call'}</span>
                        <span class="ccc-call-time">${message.time}, ${message.length}</span>
                    </div>
                    <img class="ccc-call-img" src="${svgVideoCall}" alt="svg-image">
                </div>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = message.from != userId ? 'Incoming video call' : 'Outgoing video call';


    } else if (message.type == 'post') {
        var result = `
                ${message.from == userId ? additional : ''}
                <a href="${message.post_id}" message-id="${message.id}" class="ccc-post-container reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <img class="ccc-call-img" src="${svgPost}" alt="svg-image">
                    <div class="ccc-file-info">
                        <span class="ccc-file-info-name">View post</span>
                        <div class="ccc-file-info-info">
                            <span class="ccc-message-time">${message.time}</span>
                            ${message.from == userId ? tick : ''}
                        </div>
                    </div>
                </a>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = 'View post';


    } else if (message.type == 'story') {

        // ДОБАВЬ ТУТ ОБРАЩЕНИЕ К АПИШКЕ ДЛЯ ПОЛУЧЕНИЯ АВЫ И НИКА АВТОРА!!!!!
        // ДОБАВЬ ТУТ ОБРАЩЕНИЕ К АПИШКЕ ДЛЯ ПОЛУЧЕНИЯ ПРЕВЬЮ СТОРИСА!!!!!
        var result = `
                ${message.from == userId ? additional : ''}
                <a href="${message.story_id}" message-id="${message.id}" class="ccc-story-container reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <img class="ccc-story-icon-img" src="${svgStory}" alt="story-svg">
                    <div class="ccc-story-header">
                        <img class="ccc-story-header-img" src="{% static 'main/images/ilon.jpg' %}" alt="${message.author}'s image">
                        <span>author</span>
                    </div>
                    <img class="ccc-story-img" src="{% static 'main/images/p1.jpg' %}"alt="shared-story">
                    <div class="ccc-media-info">
                        ${message.time}
                        ${message.from == userId ? tick : ''}
                    </div>
                </a>
                ${message.from != userId ? additional : ''}`;
        chatInfoMessage.innerHTML = 'story';

    };

    newMessage.innerHTML = result;
    chatSection.appendChild(newMessage);
    scrollToBottom()
};

function openLink(element) {
    var fullLink = element.innerHTML
    var link = fullLink.split('/', 3).join('/');
    var windowLink = window.location.origin;

    if (windowLink == link) {
        window.location.href = fullLink;
    } else {
        confirmationDialog("Are you sure you want to follow the link?").then((value) => {
            if (value) {
                window.open(fullLink, '_blank');
            };
        });
    };
};

function scrollToBottom() {
    var chatFieldScroll = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    if (chatFieldScroll) {
        var userScrollPosition = chatFieldScroll.scrollTop;
        var maxScrollPosition = chatFieldScroll.scrollHeight - chatFieldScroll.clientHeight;

        if ((maxScrollPosition-500) <= userScrollPosition) {
            chatFieldScroll.scroll({ top: chatFieldScroll.scrollHeight, behavior: 'smooth' });
        };
    };
};

function createMessagePlate(message, toBottom, newMessage, toChatId) {
    var chatSection = document.querySelector(`[chat-id="${toChatId}"].chat-content-chat`);
    if (chatSection) {
        if (toBottom) {
            var plate = `<div class="ccc-container ${newMessage ? 'ccc-date-new-message' : ''}">
                            <div class="ccc-date">${message}</div>
                        </div>`;

            chatSection.innerHTML = chatSection.innerHTML + plate;
        };
    };
};


function test() {
ab = createMessage({'type': 'reply', 'from': 23, 'length': '1m 32s', 'file': testaudio, 'audio': testaudio, 'video': testvideo, 'image': testpicture, 'text': 'да http://127.0.0.1:8000/# https://www.youtube.com/watch?v=d9eSfSACgmI asdasd', 'id': 123, 'read': true, 'time': '13:40', 'reply_text': 'asdasasdasd', 'reply_id': 123})
};

function testM() {
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
    test();
}












function appendChat(chatInfo) {
    var chatById = document.querySelector(`[chat-id="${chatInfo.chat_id}"].chat-contacts-section-container`);
    var chatsSection = document.querySelector('.chat-contacts-section');
    var verified = `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`

    if (!chatById) {
        if (chatInfo.story_status) {
            var userAvatar = `<a chat-id="${chatInfo.chat_id}" href="${window.location.origin}/story/${chatInfo.chat_id}" class="ccs-container-story">
                    <div chat-id="${chatInfo.chat_id}" class="ccs-container-last-activity">${chatInfo.last_activity}</div>
                    <div chat-id="${chatInfo.chat_id}" class="ccs-container-online" title="Online"></div>
                    ${chatInfo.online ? '<div chat-id="${chatInfo.chat_id}" class="ccs-container-online" title="Online"></div>' : ''}
                    <img chat-id="${chatInfo.chat_id}" class="ccs-container-avatar" src="${chatInfo.avatar}"  alt="${chatInfo.chat_id}'s avatar">
                    </a>`;
        } else {
            var userAvatar = `<div class="ccs-container-avatar-container">
                    <div chat-id="${chatInfo.chat_id}" class="ccs-container-last-activity">${chatInfo.last_activity}</div>
                    ${chatInfo.online ? '<div chat-id="${chatInfo.chat_id}" class="ccs-container-online" title="Online"></div>' : ''}
                    <img chat-id="${chatInfo.chat_id}" class="ccs-container-avatar" src="${chatInfo.avatar}" alt="${chatInfo.chat_id}'s avatar">
                    </div>`;
        };

        var chatContainer = userAvatar + `
                <div class="ccs-container-info">
                    <div class="ccs-container-info-message-container">
                        <div chat-id="${chatInfo.chat_id}" class="ccs-container-info-name">
                            ${chatInfo.username} 
                            ${chatInfo.verified ? verified : ''}
                        </div>
                        <div chat-id="${chatInfo.chat_id}" class="ccs-container-info-message-time">${chatInfo.time}</div>
                    </div>
                    <div chat-id="${chatInfo.chat_id}" class="ccs-container-info-message-container-second">
                        <div chat-id="${chatInfo.chat_id}" class="ccs-container-info-message">${chatInfo.last_message}</div>
                        ${chatInfo.unread != 0 ? `<div chat-id="${chatInfo.chat_id}" class="ccs-container-info-message-count">${chatInfo.unread}</div>` : ''}
                    </div>
                </div>`;

        var chatSectionContainer = document.createElement('div');
        chatSectionContainer.classList.add('chat-contacts-section-container-add');
        chatSectionContainer.classList.add('chat-contacts-section-container');
        setTimeout(() => {chatSectionContainer.classList.remove('chat-contacts-section-container-add');}, 100);
        chatSectionContainer.setAttribute('chat-id', chatInfo.chat_id);
        chatSectionContainer.setAttribute('onclick', 'openChat(this)');
        chatSectionContainer.innerHTML = chatContainer;
        
        chatsSection.prepend(chatSectionContainer);
    };
};


function addChat(idchat) {
    var a = {'story_status': true, 'chat_id': idchat, 'last_activity': 'onlinee', 'online': false, 'unread': 234, 
             'last_message': 'Hello', 'username': 'Ryan Libre', 'avatar': testpicture, 'verified': false, 'time': '23:40'}

    appendChat(a);
};


function addChatM() {
    addChat(1);
    addChat(2);
    addChat(13);
    addChat(14);
    addChat(15);
    addChat(16);
    addChat(17);
    addChat(18);
    addChat(19);
}


function raiseChat(chatId) {
    var chatsSection = document.querySelector('.chat-contacts-section');
    var chatSectionContainer = document.querySelector(`[chat-id='${chatId}'].chat-contacts-section-container`);
    
    var index = Array.from(chatsSection.children).indexOf(chatSectionContainer);

    if (index > 0) {
        chatSectionContainer.classList.add('chat-contacts-section-container-add');
        setTimeout(() => {
            chatsSection.removeChild(chatSectionContainer);
            chatSectionContainer.classList.remove('chat-contacts-section-container-add');
            chatsSection.prepend(chatSectionContainer);
            chatSectionContainer.classList.add('chat-contacts-section-container-add');
            setTimeout(() => {chatSectionContainer.classList.remove('chat-contacts-section-container-add');}, 100);
        }, 250);
    };

};