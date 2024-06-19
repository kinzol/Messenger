if (window.location.protocol == 'https:') {
    var wsStart = 'wss://';
} else {
    var wsStart = 'ws://';
};

document.addEventListener("DOMContentLoaded", (event) => {
    var wsEndPoint = wsStart + window.location.host + '/ws/chat/' + uuid + '/';
    webSocketChat = new WebSocket(wsEndPoint)


    // webSocketChat.addEventListener('open', (e) => {
    //     console.log('ws open')
    // });


    webSocketChat.addEventListener('message', (e) => {
        message = JSON.parse(e.data)
        console.log(message)
        if (message.send_type == 'chat_message') {
            if (message.new_chat) {
                if (parseInt(message.from_user) != userId) {
                    newChatUser(message.from_user);
                };
            };

            var chatContactsHeader = document.querySelector('.chat-contacts-header');
            if (chatId || chatContactsHeader) {
                newMessage(message, false, false)
                if ((userId == parseInt(message.to_user)) && (chatId != message.from_user)) {
                    showMessageNotification(message.from_user, message.message);
                    
                };
            } else {
                if (userId == parseInt(message.to_user)) {
                    showMessageNotification(message.from_user, message.message);
                };
            };

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
        
        } else if (message.send_type == 'chat_online') {
            var ccsContainerOnline = document.querySelector(`[chat-id='${message.from_user}'].ccs-container-online`);
            var ccsContainerLastActivity = document.querySelector(`[chat-id='${message.from_user}'].ccs-container-last-activity`);
            var chatContentHeaderUserinfoActivity = document.querySelector('.chat-content-header-userinfo-activity');

            if (message.status == 'online') {
                if (ccsContainerOnline) {
                    ccsContainerOnline.style.display = 'flex';
                    ccsContainerLastActivity.innerHTML = 'online';

                    if (chatId == message.from_user) {
                        chatContentHeaderUserinfoActivity.innerHTML = 'online';
                    };
                };
            } else {
                if (ccsContainerOnline) {
                    ccsContainerOnline.style.display = 'none';
                    ccsContainerLastActivity.innerHTML = formatDate(message.time)['format2'];

                    if (chatId == message.from_user) {
                        chatContentHeaderUserinfoActivity.innerHTML = formatDate(message.time)['format2'];
                    };
                };
            };

        } else if (message.send_type == 'chat_reaction_add') {
            setReactionMessageData(message.reaction, message.message_id, message.from_user, message.reaction_id);

        } else if (message.send_type == 'chat_reaction_remove') {
            messageReactionRemoveData(message.message_id, message.reaction_id);

        } else if (message.send_type == 'chat_message_delete') {
            deleteMessageData(message.message_id, message.chat_id);
        };

    });


    webSocketChat.addEventListener('close', (e) => {
        console.log('ws close')
    });


    webSocketChat.addEventListener('error', (e) => {
        console.log('ws error')
    });
});


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