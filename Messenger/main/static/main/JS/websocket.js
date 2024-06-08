if (window.location.protocol == 'https:') {
    var wsStart = 'wss://';
} else {
    var wsStart = 'ws://';
};

document.addEventListener("DOMContentLoaded", (event) => {
    var wsEndPoint = wsStart + window.location.host + '/ws/chat/' + uuid + '/';
    console.log(websocketChat)
    webSocketChat = new WebSocket(wsEndPoint)


    webSocketChat.addEventListener('open', (e) => {
        console.log('ws open')
    });


    webSocketChat.addEventListener('message', (e) => {
        message = JSON.parse(e.data)
        if (message.send_type == 'chat_message') {
            newMessage(message, false, false)

        } else if (message.send_type == 'chat_read') {
            var cccMessageView = document.querySelector(`[message-id='${message.message_id}'].ccc-message-view`);
            cccMessageView.src = svgTickBlue;

        } else if (message.send_type == 'chat_typing') {
            var chatContentHeaderUserinfoActivity = document.querySelector('.chat-content-header-userinfo-activity');
            var chatContentHeaderUserinfoActivityTyping = document.querySelector('.chat-content-header-userinfo-activity-typing');
            var ccsContainerInfoMessage = document.querySelector(`[chat-id='${message.from_user}'].ccs-container-info-message`);
            if (ccsContainerInfoMessage) {
                tempUserInfo[message.from_user] = ccsContainerInfoMessage.innerHTML;

                ccsContainerInfoMessage.innerHTML = 'Typing...';
                ccsContainerInfoMessage.style = 'color: #ffffff; -webkit-text-fill-color: #ffffff; font-weight: 500;';
                setTimeout(() => {
                    ccsContainerInfoMessage.innerHTML = tempUserInfo[message.from_user];
                    ccsContainerInfoMessage.style = '';
                }, 4500)

                if (chatId == message.from_user) {
                    chatContentHeaderUserinfoActivity.style.display = 'none';
                    chatContentHeaderUserinfoActivityTyping.style.display = 'block';

                    setTimeout(() => {
                        if (chatId == message.from_user) {
                            chatContentHeaderUserinfoActivity.style.display = 'block';
                            chatContentHeaderUserinfoActivityTyping.style.display = 'none';
                        };
                    }, 4500)
                };
            };
        };

    });


    webSocketChat.addEventListener('close', (e) => {
        console.log('ws close')
    });


    webSocketChat.addEventListener('error', (e) => {
        console.log('ws error')
    });
});


function sendtest() {
    webSocketChat.send(JSON.stringify({
        'message': 'message',
        'target_user_uuid': '7aa359d0-b1b4-41'
    }));
};
