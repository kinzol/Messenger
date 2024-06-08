
var messageSound
var chatMessegeDates = {};
var chatMessegeDatesTop = {};
var chatMessagesOffset = {};
var chatMessagesDataload = {};

document.addEventListener("DOMContentLoaded", (event) => {
    messageSound = new Audio(newMessageSound) 
});

function newMessage(message, preload, topload) {

        if (userId != message.from_user) {
            var chatSection = document.querySelector(`[chat-id="${message.from_user}"].chat-content-chat`);
            var chatCounter = document.querySelector(`[chat-id="${message.from_user}"].ccs-container-info-message-count`);
            if (!preload) {
                raiseChat(message.from_user);
            }
        } else {
            var chatSection = document.querySelector(`[chat-id="${message.to_user}"].chat-content-chat`);
            var chatCounter = document.querySelector(`[chat-id="${message.to_user}"].ccs-container-info-message-count`);
            if (!preload) {
                raiseChat(message.to_user);
            };
        };

    if (!chatSection || (chatId != message.from_user)) {
        var chatCounterContainer = document.querySelector(`[chat-id="${message.from_user}"].ccs-container-info-message-container-second`);

        if (chatCounterContainer){
            if (chatCounter) {
                chatCounter.innerHTML = parseInt(chatCounter.innerHTML) + 1;
            } else {
                chatCounterContainer.innerHTML = chatCounterContainer.innerHTML + `<div chat-id="${message.from_user}" class="ccs-container-info-message-count">1</div>`
            };
        };
    };

    if ((chatId != message.from_user) && !(newMessagePlate.includes(message.from_user))) {
        // createMessagePlate(true, true, 'New messages');
        createMessagePlate('New messages', true, true, message.from_user);
        newMessagePlate.push(message.from_user);
    }

    if ((chatId != message.from_user) && (userId != message.from_user)) {
        messageSound.play();
    } else {
        if ((message.from_user != userId) && !message.read) {
            webSocketChat.send(JSON.stringify({
                'send_type': 'chat_read',
                'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
                'message_id': message.id
            }));
        };
    };

    time_message = formatDate(message.time_create).format3

    if (userId != message.from_user) {
        var chatInfoMessage = document.querySelector(`[chat-id='${message.from_user}'].ccs-container-info-message`);
        var chatInfoTime = document.querySelector(`[chat-id='${message.from_user}'].ccs-container-info-message-time`);
        
        tempUserInfo[message.from_user] = message.message;
        chatInfoMessage.style = '';
        chatInfoMessage.innerHTML = message.message;
        chatInfoTime.innerHTML = time_message;
    } else {
        var chatInfoMessage = document.querySelector(`[chat-id='${message.to_user}'].ccs-container-info-message`);
        var chatInfoTime = document.querySelector(`[chat-id='${message.to_user}'].ccs-container-info-message-time`);

        tempUserInfo[message.to_user] = message.message;
        chatInfoMessage.style = '';
        chatInfoMessage.innerHTML = message.message;
        chatInfoTime.innerHTML = time_message;
    };
    
    if (!chatSection) {return};

    if (!topload) {
        time_plate = formatDate(message.time_create).format4
        if (userId != message.from_user) {
            if (!chatMessegeDates[message.from_user]) {
                chatMessegeDates[message.from_user] = time_plate;
                createMessagePlate(time_plate, true, false, message.from_user);
            } else {
                if ((chatMessegeDates[message.from_user] != time_plate)) {
                    createMessagePlate(time_plate, true, false, message.from_user);
                    chatMessegeDates[message.from_user] = time_plate;
                };
            };
        } else {
            if (!chatMessegeDates[message.to_user]) {
                chatMessegeDates[message.to_user] = time_plate;
                createMessagePlate(time_plate, true, false, message.to_user);
            } else {
                if (chatMessegeDates[message.to_user] != time_plate) {
                    createMessagePlate(time_plate, true, false, message.to_user);
                    chatMessegeDates[message.to_user] = time_plate;
                };
            };
        };
    };

    var newMessage = document.createElement('div');
    newMessage.classList.add('ccc-container');
    newMessage.setAttribute('message-id', message.id);
    newMessage.setAttribute('onclick', 'doubleClickMessage(this)');

    if (message.read == true) {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickBlue}" alt="svg-view"></img>`
    } else {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickWhite}" alt="svg-view"></img>`
    };
    var additional = `<img message-id="${message.id}" class="ccc-container-additional ${message.from_user != userId ? 'ccc-contrary-additional' : ''}"
                      src="${svgAdditional}" alt="svg-additional" onclick="showMessageActions(this, ${message.from_user == userId ? 'true' : 'false'})">`

    if (message.message) {
        var parts = message.message.split(" ");
        var urls = parts.filter(part => part.startsWith("https://"));
        if (urls.length != 0) {
            urls.forEach((url, index) => {
                message.message = message.message.replace(url, `<div class="ccc-message-text-link" onclick='openLink(this)'>${url}</div>`)
            });
        };
    };


    if (message.type == 'text') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-message-text reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <span message-id="${message.id}" class="ccc-message-text-span">${message.message}</span>
                    <span class="ccc-message-time">${time_message}</span>
                    ${message.from_user == userId ? tick : ''}
                </div>
                ${message.from_user != userId ? additional : ''}`;


    } else if (message.type == 'reply') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-message-text-reply reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <div reply-id="${message.reply_id}" class="ccc-message-reply" onclick='replyScrollMessage(this)'>
                        <span class="ccc-message-reply-span">${message.reply_message}</span>
                    </div>
                    <div class="ccc-message-container">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.message}</span>
                        <span class="ccc-message-time">${time_message}</span>
                        ${message.from_user == userId ? tick : ''}
                    </div>
                </div>
                ${message.from_user != userId ? additional : ''}`;


    } else if (message.type == 'image') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media reaction-area ${message.from_user != userId ? 'ccc-contrary-media' : ''}">
                    <div class="ccc-media-info">
                        ${time_message}
                        ${message.from_user == userId ? tick : ''}
                    </div>
                    <img class="ccc-media-content" src="${message.file}" onclick="OnFullScreenPhoto(this)" alt="${message.from_user}'s img">
                </div>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>Image</span>`;
                

        chatInfoMessage.innerHTML = message.file.split('/').at(-1);


    } else if (message.type == 'video') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media reaction-area ${message.from_user != userId ? 'ccc-contrary-media' : ''}">
                    <div class="ccc-media-info">
                    ${time_message}
                    ${message.from_user == userId ? tick : ''}
                    </div>
                    <video controls class="ccc-media-content" alt="${message.from_user}'s video">
                        <source src="${message.file}">
                    </video>
                </div>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>Video</span>`;
        chatInfoMessage.innerHTML = message.file.split('/').at(-1);


    } else if (message.type == 'text-image') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from_user != userId ? 'ccc-contrary-media' : ''}">
                    <img class="ccc-media-content ccc-media-content-text" src="${message.file}" onclick="OnFullScreenPhoto(this)" alt="${message.from_user}'s img">
                    <div class="ccc-message-container-media">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.message}</span>
                        <span class="ccc-message-time">${time_message}</span>
                        ${message.from_user == userId ? tick : ''}
                    </div>
                </div>
                ${message.from_user != userId ? additional : ''}`;


    } else if (message.type == 'text-video') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from_user != userId ? 'ccc-contrary-media' : ''}">
                    <video controls class="ccc-media-content ccc-media-content-text" alt="${message.from_user}'s video">
                        <source src="${message.file}">
                    </video>
                    <div class="ccc-message-container-media">
                        <span message-id="${message.id}" class="ccc-message-text-span">${message.message}</span>
                        <span class="ccc-message-time">${time_message}</span>
                        ${message.from_user == userId ? tick : ''}
                    </div>
                </div>
            </div>
            ${message.from_user != userId ? additional : ''}`;


    } else if (message.type == 'audio') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-audio-container reaction-area ${message.from_user != userId ? 'ccc-contrary-audio' : ''}">
                    <audio controls src="${message.file}"></audio>
                    <span class="ccc-message-time">${time_message}</span>
                    ${message.from_user == userId ? tick : ''}
                </div>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>Audio</span>`;

        chatInfoMessage.innerHTML = `Audio message`;


    } else if (message.type == 'file') {
        var requestFileSize = new XMLHttpRequest();
        requestFileSize.open("GET", message.file, false);
        requestFileSize.send();
        var fileSizeInBytes = parseInt(requestFileSize.getResponseHeader('content-length'));
        var fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        var result = `
                ${message.from_user == userId ? additional : ''}
                <a message-id="${message.id}" class="ccc-file-container reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}" href="${message.file}" download>
                    <img class="ccc-file-img" src="${svgFile}" alt="svg-image">
                    <div class="ccc-file-info">
                        <span class="ccc-file-info-name">${message.file.split('/').pop()}</span>
                        <div class="ccc-file-info-info">
                            <span class="ccc-file-size">${fileSizeInMB.toFixed(2)}MB</span>
                            <span class="ccc-message-time">${time_message}</span>
                            ${message.from_user == userId ? tick : ''}
                        </div>
                    </div>
                </a>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>File</span>`;
        chatInfoMessage.innerHTML = message.file.split('/').at(-1);



    } else if (message.type == 'call') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-call-container reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <div class="ccc-call-info-container">
                        <span class="ccc-call-name">${message.from_user != userId ? 'Incoming call' : 'Outgoing call'}</span>
                        <span class="ccc-call-time">${time_message}, ${message.call_time}</span>
                    </div>
                    <img class="ccc-call-img" src="${svgCall}" alt="svg-image">
                </div>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>${message.from_user != userId ? 'Incoming call' : 'Outgoing call'}</span>`;
        chatInfoMessage.innerHTML = message.from_user != userId ? 'Incoming call' : 'Outgoing call';


    } else if (message.type == 'video-call') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-call-container reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <div class="ccc-call-info-container">
                        <span class="ccc-call-name">${message.from_user != userId ? 'Incoming video call' : 'Outgoing video call'}</span>
                        <span class="ccc-call-time">${time_message}, ${message.call_time}</span>
                    </div>
                    <img class="ccc-call-img" src="${svgVideoCall}" alt="svg-image">
                </div>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>${message.from_user != userId ? 'Incoming video call' : 'Outgoing video call'}</span>`;
        chatInfoMessage.innerHTML = message.from_user != userId ? 'Incoming video call' : 'Outgoing video call';


    } else if (message.type == 'post') {
        var result = `
                ${message.from_user == userId ? additional : ''}
                <a href="${message.post_id}" message-id="${message.id}" class="ccc-post-container reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <img class="ccc-call-img" src="${svgPost}" alt="svg-image">
                    <div class="ccc-file-info">
                        <span class="ccc-file-info-name">View post</span>
                        <div class="ccc-file-info-info">
                            <span class="ccc-message-time">${time_message}</span>
                            ${message.from_user == userId ? tick : ''}
                        </div>
                    </div>
                </a>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>Post</span>`;
        chatInfoMessage.innerHTML = 'View post';


    } else if (message.type == 'story') {

        // ДОБАВЬ ТУТ ОБРАЩЕНИЕ К АПИШКЕ ДЛЯ ПОЛУЧЕНИЯ АВЫ И НИКА АВТОРА!!!!!
        // ДОБАВЬ ТУТ ОБРАЩЕНИЕ К АПИШКЕ ДЛЯ ПОЛУЧЕНИЯ ПРЕВЬЮ СТОРИСА!!!!!
        var result = `
                ${message.from_user == userId ? additional : ''}
                <a href="${message.story_id}" message-id="${message.id}" class="ccc-story-container reaction-area ${message.from_user != userId ? 'ccc-contrary' : ''}">
                    <img class="ccc-story-icon-img" src="${svgStory}" alt="story-svg">
                    <div class="ccc-story-header">
                        <img class="ccc-story-header-img" src="{% static 'main/images/ilon.jpg' %}" alt="${message.author}'s image">
                        <span>author</span>
                    </div>
                    <img class="ccc-story-img" src="{% static 'main/images/p1.jpg' %}"alt="shared-story">
                    <div class="ccc-media-info">
                        ${time_message}
                        ${message.from_user == userId ? tick : ''}
                    </div>
                </a>
                ${message.from_user != userId ? additional : ''}
                <span message-id="${message.id}" class="ccc-message-text-span" style='display: none;'>Story</span>`;
        chatInfoMessage.innerHTML = 'Story';

    };

    newMessage.innerHTML = result;
    if (preload) {
        chatSection.append(newMessage);
        setTimeout(() => {scrollToBottomAnyway()}, 200);
    } else {
        if (topload) {
            chatSection.prepend(newMessage);
        } else {
            chatSection.append(newMessage);
        }
    };

    if (userId != message.from_user) {
        tempUserInfo[message.from_user] = chatInfoMessage.innerHTML;
    } else {
        tempUserInfo[message.to_user] = chatInfoMessage.innerHTML;
    };

    if (topload) {
        time_plate = formatDate(message.time_create).format4
        if (userId != message.from_user) {
            time_plate = formatDate(message.time_create).format4
            deleteDatePlate(chatSection, message.from_user, time_plate);
            createMessagePlate(time_plate, !topload, false, message.from_user);
            chatMessegeDatesTop[message.from_user] = time_plate;
        } else {
            deleteDatePlate(chatSection, message.to_user, time_plate);
            createMessagePlate(time_plate, !topload, false, message.to_user);
            chatMessegeDatesTop[message.to_user] = time_plate;
        };
    };

    if (!preload) {
        scrollToBottom()
    }
};


function deleteDatePlate(field, fieldId, time_plate) {
    const containers = field.querySelectorAll('.ccc-container');

    if (chatMessegeDatesTop[fieldId]) {
        if (time_plate == chatMessegeDatesTop[fieldId]) {
            var dateSearch = chatMessegeDatesTop[fieldId];
        } else {
            return
        };
    } else {
        if (time_plate == chatMessegeDates[fieldId]) {
            var dateSearch = chatMessegeDates[fieldId];
        } else {
            return
        };
    };

    containers.forEach(container => {
        const dateDiv = container.querySelector('.ccc-date');
        if (dateDiv && dateDiv.textContent.trim() == dateSearch) {
            console.log(container)
            field.removeChild(container);
        }
    });
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

        if ((maxScrollPosition-300) <= userScrollPosition) {
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

        } else {
            var plate = document.createElement('div');

            if (newMessage) {
                plate.setAttribute('class', 'ccc-container ccc-date-new-message');
            } else {
                plate.setAttribute('class', 'ccc-container');
            };

            plate.innerHTML = `<div class="ccc-date">${message}</div>`;

            chatSection.prepend(plate);
        };
    };
};


function test() {
ab = newMessage({'type': 'text', 'to': 23, 'from': 'radmir', 'date': '23 jan', 'length': '1m 32s', 'file': testaudio, 'audio': testaudio, 'video': testvideo, 'image': testpicture, 'text': 'да http://127.0.0.1:8000/# https://www.youtube.com/watch?v=d9eSfSACgmI asdasd', 'id': 123, 'read': true, 'time': '13:40', 'reply_text': 'asdasasdasd', 'reply_id': 123})
};

function testA() {
    ab = newMessage({'type': 'text', 'to': 'radmir', 'from': 'shamsulinD', 'date': '23 jan', 'length': '1m 32s', 'file': testaudio, 'audio': testaudio, 'video': testvideo, 'image': testpicture, 'text': 'да http://127.0.0.1:8000/# https://www.youtube.com/watch?v=d9eSfSACgmI asdasd', 'id': 123, 'read': true, 'time': '13:40', 'reply_text': 'asdasasdasd', 'reply_id': 123})
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









var chatDataLoading = true;
var chatsOffset = 0;
document.addEventListener("DOMContentLoaded", (event) => {
    chatDataLoading = false;

    $.ajax({
        url: '/api/v1/chat/chats/',
        method: 'get',
        dataType: 'json',
        data: {offset: chatsOffset, get_type: 'chats'},
        success: function(data){
            data.chats.forEach((chatInfo) => {
                appendChat(chatInfo, false);
            });

            if (data.chats.length == 0) {
                if (chatsOffset == 0) {
                    var chatContactsSection = document.querySelector('.chat-contacts-section');
                    chatContactsSection.innerHTML = '<span class="chat-contacts-section-null">You have no active chat now</span>';
                }
                return
            } else {
                chatsOffset += 10;
                chatDataLoading = true;
            }
        }
    });
   
});


function appendChat(chatInfo, prependChat) {
    chatMessagesOffset[chatInfo.pk] = 0;
    chatMessagesDataload[chatInfo.pk] = true;

    var chatById = document.querySelector(`[chat-id="${chatInfo.pk}"].chat-contacts-section-container`);
    var chatsSection = document.querySelector('.chat-contacts-section');
    var verified = `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;
    var chatMessagesTypesText = ['text', 'reply', 'image', 'video', 'image-text', 'video-text', 'file', 'call', 'videocall'];
    var chatMessagesTypes = {
        'audio': 'Audio message',
        'post': 'View post',
        'story': 'Story',
        'null': ''
    };

    if  (chatInfo.profile_online_status) {
        chatInfo.profile_online_time = 'online';
    } else {
        chatInfo.profile_online_time = formatDate(chatInfo.profile_online_time)['format2']
    };

    if (!chatMessagesTypesText.includes(chatInfo.last_message_type)) {
        chatInfo.last_message_text = chatMessagesTypes[chatInfo.last_message_type];
    };

    if (!chatById) {
        if (chatInfo.viewed_story_exists) {
            var userAvatar = `<a chat-id="${chatInfo.pk}" href="${window.location.origin}/story/${chatInfo.username}" class="ccs-container-story">
                    <div chat-id="${chatInfo.pk}" class="ccs-container-uuid">${chatInfo.profile_uuid}</div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-last-activity">${chatInfo.profile_online_time}</div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-username">${chatInfo.username}</div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-online" title="Online"></div>
                    ${chatInfo.online ? `<div chat-id="${chatInfo.pk}" class="ccs-container-online" title="Online"></div>` : `<div chat-id="${chatInfo.pk}" class="ccs-container-online" style="display: none;" title="Online"></div>`}
                    <img chat-id="${chatInfo.pk}" class="ccs-container-avatar" src="${chatInfo.profile_avatar}"  alt="${chatInfo.username}'s avatar">
                    </a>`;
        } else {
            var userAvatar = `<div class="ccs-container-avatar-container">
                    <div chat-id="${chatInfo.pk}" class="ccs-container-uuid">${chatInfo.profile_uuid}</div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-last-activity">${chatInfo.profile_online_time}</div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-username">${chatInfo.username}</div>
                    ${chatInfo.online ? `<div chat-id="${chatInfo.pk}" class="ccs-container-online" title="Online"></div>` : `<div chat-id="${chatInfo.pk}" class="ccs-container-online" style="display: none;" title="Online"></div>`}
                    <img chat-id="${chatInfo.pk}" class="ccs-container-avatar" src="${chatInfo.profile_avatar}" alt="${chatInfo.username}'s avatar">
                    </div>`;
        };

        var chatContainer = userAvatar + `
                <div class="ccs-container-info">
                    <div class="ccs-container-info-message-container">
                        <div chat-id="${chatInfo.pk}" class="ccs-container-info-name">
                            ${chatInfo.profile_full_name} 
                            ${chatInfo.profile_verify ? verified : ''}
                        </div>
                        <div chat-id="${chatInfo.pk}" class="ccs-container-info-message-time" title='${formatDate(chatInfo.last_message_time)['format1']}'>${formatDate(chatInfo.last_message_time)['format3']}</div>
                    </div>
                    <div chat-id="${chatInfo.pk}" class="ccs-container-info-message-container-second">
                        <div chat-id="${chatInfo.pk}" class="ccs-container-info-message">${chatInfo.last_message_text}</div>
                        ${chatInfo.count_unread != null ? `<div chat-id="${chatInfo.pk}" class="ccs-container-info-message-count">${chatInfo.count_unread}</div>` : `<div chat-id="${chatInfo.pk}" style="display: none;" class="ccs-container-info-message-count">0</div>`}
                    </div>
                </div>`;

        var chatSectionContainer = document.createElement('div');
        chatSectionContainer.classList.add('chat-contacts-section-container-add');
        chatSectionContainer.classList.add('chat-contacts-section-container');
        setTimeout(() => {chatSectionContainer.classList.remove('chat-contacts-section-container-add');}, 100);
        chatSectionContainer.setAttribute('chat-id', chatInfo.pk);
        chatSectionContainer.setAttribute('onclick', 'openChat(this)');
        chatSectionContainer.innerHTML = chatContainer;
        
        if (prependChat) {
            chatsSection.prepend(chatSectionContainer);
        } else {
            chatsSection.append(chatSectionContainer);
        };
    };
};

function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    const now = new Date();

    const options1 = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate1 = new Intl.DateTimeFormat(undefined, options1).format(date);

    const options3 = { hour: '2-digit', minute: '2-digit' };
    const formattedDate3 = new Intl.DateTimeFormat(undefined, options3).format(date);

    // Проверяем, прошел ли год с указанного времени
    const yearDifference = now.getFullYear() - date.getFullYear();
    const showYear = yearDifference > 1 || (yearDifference === 1 && (now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate())));

    // Опции для формата с годом или без года
    const options2 = showYear
        ? { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { month: 'long', day: '2-digit', hour: 'numeric', minute: '2-digit' };
    const formattedDate2 = new Intl.DateTimeFormat(undefined, options2).format(date);

    const options4 = showYear
        ? { month: 'long', day: '2-digit', year: 'numeric'}
        : { month: 'long', day: '2-digit'};
    const formattedDate4 = new Intl.DateTimeFormat(undefined, options4).format(date);

    return { format1: formattedDate1, format2: formattedDate2, format3: formattedDate3, format4: formattedDate4};
}


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