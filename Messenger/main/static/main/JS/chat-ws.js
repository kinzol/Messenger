var userId = 13;

function createMessage(message) {
    if (message.read == true) {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickBlue}" alt="svg-view"></img>`
    } else {
        var tick = `<img message-id="${message.id}" class="ccc-message-view" src="${svgTickWhite}" alt="svg-view"></img>`
    };
    var additional = `<img message-id="${message.id}" class="ccc-container-additional ${message.from != userId ? 'ccc-contrary-additional' : ''}"
                      src="${svgAdditional}" alt="svg-additional" onclick="showMessageActions(this)">`

    if (message.type == 'text') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-message-text reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <span class="ccc-message-text-span">${message.text}</span>
                    <span class="ccc-message-time">${message.time}</span>
                    ${message.from == userId ? tick : ''}
                </div>
                ${message.from != userId ? additional : ''}`;


    } else if (message.type == 'reply') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-message-text-reply reaction-area ${message.from != userId ? 'ccc-contrary' : ''}">
                    <div reply-id="${message.reply_id}" class="ccc-message-reply" onclick='replyScrollMessage(this)'>
                        <span class="ccc-message-reply-span">${message.reply_text}</span>
                    </div>
                    <div class="ccc-message-container">
                        <span class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
                ${message.from != userId ? additional : ''}`;


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


    } else if (message.type == 'image-text') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <img class="ccc-media-content ccc-media-content-text" src="${message.image}" onclick="OnFullScreenPhoto(this)" alt="${message.from}'s img">
                    <div class="ccc-message-container-media">
                        <span class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
                ${message.from != userId ? additional : ''}`;


    } else if (message.type == 'video-text') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-media-text reaction-area ${message.from != userId ? 'ccc-contrary-media' : ''}">
                    <video controls class="ccc-media-content ccc-media-content-text" alt="${message.from}'s video">
                        <source src="${message.video}">
                    </video>
                    <div class="ccc-message-container-media">
                        <span class="ccc-message-text-span">${message.text}</span>
                        <span class="ccc-message-time">${message.time}</span>
                        ${message.from == userId ? tick : ''}
                    </div>
                </div>
            </div>
            ${message.from != userId ? additional : ''}`;


    } else if (message.type == 'audio') {
        var result = `
                ${message.from == userId ? additional : ''}
                <div message-id="${message.id}" class="ccc-audio-container reaction-area ${message.from != userId ? 'ccc-contrary-audio' : ''}">
                    <audio controls src="${message.audio}"></audio>
                    <span class="ccc-message-time">${message.time}</span>
                    ${message.from == userId ? tick : ''}
                </div>
                ${message.from != userId ? additional : ''}`;


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

    };

    return result;
};


function test() {
var getChat = document.querySelector(`[chat-id="23"].chat-content-chat`);

var newMessage = document.createElement('div');

newMessage.classList.add('ccc-container');

newMessage.setAttribute('onclick', 'doubleClickMessage(this)');

ab = createMessage({'type': 'story', 'from': 13, 'length': '1m 32s', 'file': testaudio, 'audio': testaudio, 'video': testvideo, 'image': testpicture, 'text': 'дsdfsdfа', 'id': 123, 'read': true, 'time': '13:40', 'reply_text': 'asdasasdasd', 'reply_id': 123})

newMessage.innerHTML = ab;

getChat.appendChild(newMessage);

};
