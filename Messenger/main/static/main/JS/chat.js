var messageActionsId = null;
var replyMessageId = null;
var replyMessageContent = null;
var partnerName = null;
var partnerId = null;
var replyStatus = false;
var chatId = null;
var previousChatField = null;
var isChatOpen = false;


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
    notificationTimeout.classList.add('notifications-c-timeout');

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
    };

    setTimeout(() => {
        notifications.removeChild(notificationContainer);
    }, 10000);
};


function confirmationDialog(message){
    var confirmDialog = document.querySelector('.confirm-dialog');
    var confirmContainerCancel = document.querySelector('.confirm-dialog-cancel');
    var confirmSpan = document.querySelector('.confirm-dialog-span');
    var confirmButtomYes = document.querySelector('.confirm-dialog-buttons-yes');
    var confirmButtomNo = document.querySelector('.confirm-dialog-buttons-no');

    confirmSpan.innerHTML = message;
    confirmDialog.classList.add('confirm-dialog-show');
    
    return new Promise((resolve, reject) => {
        confirmButtomYes.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
          resolve(true);
        };
    
        confirmButtomNo.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
          resolve(false);
        };

        confirmContainerCancel.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
          resolve(false);
        };

    });
};

// confirmationDialog("Are you sure you want to remove the post?").then((value) => {console.log(value);});


function chatChangeSendInputButton() {
    var messageInput = document.querySelector('.chat-content-input-message');
    
    if (messageInput.value.length == 1) {
        var inputAudio = document.querySelector('.chat-content-input-audio');
        var inputMessageImg = document.querySelector('.chat-content-input-message-img');

        if (inputAudio != null) {
            inputMessageImg.classList.add('chat-content-input-button-change');
            setTimeout(() => {
                inputMessageImg.src = inputSendImg;
                inputAudio.classList.remove('chat-content-input-audio');
                inputAudio.classList.add('chat-content-input-send');
                inputAudio.removeAttribute('onclick');
            }, 100);
            setTimeout(() => {
                inputMessageImg.classList.remove('chat-content-input-button-change');
            }, 200);
        }


    } else if (messageInput.value.length == 0) {
        var inputSend = document.querySelector('.chat-content-input-send');
        var inputMessageImg = document.querySelector('.chat-content-input-message-img');

        if (inputSend != null) {
            inputMessageImg.classList.add('chat-content-input-button-change');
            setTimeout(() => {
                inputMessageImg.src = inputAudioImg;
                inputSend.classList.remove('chat-content-input-send');
                inputSend.classList.add('chat-content-input-audio');
                inputSend.setAttribute('onclick', 'onContentAudio()');
            }, 100);
            setTimeout(() => {
                inputMessageImg.classList.remove('chat-content-input-button-change');
            }, 200);
        }
    };
};

// navigator.mediaDevices.getUserMedia({ audio: false})
// .then(stream => {
//     let voice = [];
//     document.querySelector('.chat-content-input-audio').addEventListener('click', function(){
//         navigator.mediaDevices.getUserMedia({ audio: true})
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorder.start();
//     });
//     document.querySelector('.chat-content-chat').addEventListener('click', function(){
//         mediaRecorder.stop();
//         navigator.mediaDevices.getUserMedia({ audio: false})
//         console.log(voice)
//         voice = [];
//     });
// });



let mediaRecorder;
let stream;
let voice = [];

function startRecordingAudio() {
    navigator.mediaDevices.getUserMedia({ audio: true})
    .then(audioStream => {
        stream = audioStream;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
    })
    .catch(error => {
        console.error('Error accessing microphone:', error);
    });
};

document.querySelector('.chat-content-audio-record-send-img').addEventListener('click', function(){
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        offContentAudio();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

document.querySelector('.chat-content-audio-record-trash-img').addEventListener('click', function(){
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        offContentAudio();
        voice = [];
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

if (mediaRecorder) {
    mediaRecorder.ondataavailable = function(e) {
        voice.push(e.data);
    };
}


function onContentAudio() {
    startRecordingAudio()
    var chatContentInput = document.querySelector('.chat-content-input');
    var chatContentAudio = document.querySelector('.chat-content-audio');

    chatContentInput.classList.remove('chat-content-input-show');
    chatContentInput.classList.add('chat-content-input-hide');
    setTimeout(() => {
        chatContentAudio.classList.remove('chat-content-input-hide');
        chatContentAudio.classList.add('chat-content-input-show');
    }, 150);
};


function offContentAudio(){
    var chatContentInput = document.querySelector('.chat-content-input');
    var chatContentAudio = document.querySelector('.chat-content-audio');

    chatContentAudio.classList.remove('chat-content-input-show');
    chatContentAudio.classList.add('chat-content-input-hide');
    setTimeout(() => {
        chatContentInput.classList.remove('chat-content-input-hide');
        chatContentInput.classList.add('chat-content-input-show');
    }, 150);

}


function offFullScreenPhoto(element) {
    element.classList.remove('full-screen-mode-show');
    element.classList.add('full-screen-mode-hide');
};


function OnFullScreenPhoto(element) {
    var fullScreen = document.querySelector('.full-screen-photo');
    var fullScreenImg = document.querySelector('.full-screen-content');

    fullScreenImg.src = element.src;
    fullScreen.classList.remove('full-screen-mode-hide');
    fullScreen.classList.add('full-screen-mode-show');
};

function hideMessageActions() {
    var messageActions = document.querySelector('.message-actions')
    messageActions.classList.remove('message-actions-show');
    messageActions.classList.add('message-actions-hide');
};

function showMessageActions(element) {
    var messageActions = document.querySelector('.message-actions');

    messageActionsId = element.getAttribute('message-id');
    messageActions.classList.remove('message-actions-hide');
    messageActions.classList.add('message-actions-show');
};

function messageReply() {
    var replyContainer = document.querySelector('.chat-content-input-reply');

    hideMessageActions();
    replyContainer.classList.remove('message-actions-hide');
    replyContainer.classList.add('message-actions-show');
    replyStatus = true;
};


function hideReplyContainer() {
    var replyContainer = document.querySelector('.chat-content-input-reply');

    hideMessageActions();
    replyContainer.classList.remove('message-actions-show');
    replyContainer.classList.add('message-actions-hide');
    replyStatus = false;
}

var doubleClickMessageStatus = false;
function doubleClickMessage(element) {
    if (doubleClickMessageStatus) {
        doubleClickMessageStatus = false;
        console.log('doubleClick')
    } else {
        doubleClickMessageStatus = true;
        setTimeout(() => {
            doubleClickMessageStatus = false;
        }, 500);
    }
}

function setReactionMessage(reactionId) {
    var reactions = ['❤️', '👍', '😃', '😂', '💩'];

    hideReplyContainer();
}


function messageReactions(element) {
    var messageActions = document.querySelector('.message-reaction');

    messageActionsId = element.getAttribute('message-id');
    messageActions.classList.remove('message-actions-hide');
    messageActions.classList.add('message-actions-show');
};

function hideMessageReactions() {
    var messageActions = document.querySelector('.message-reaction')
    messageActions.classList.remove('message-actions-show');
    messageActions.classList.add('message-actions-hide');
};

function hideMessageNotification(element) {
    element.classList.remove('show-message-notification');
    element.classList.add('hide-message-notification');
    setTimeout(() => {
        element.parentNode.removeChild(element);
    }, 150);
};

function showMessageNotification(from) {
    var messageNotification = document.querySelector('.message-notification')

    if (!messageNotification.textContent.includes(from)) {
        var newMessageNotification = document.createElement('div');
        newMessageNotification.classList.add('message-notification-content');
        newMessageNotification.classList.add('show-message-notification');
        newMessageNotification.innerHTML = `New message from ${from}`;
        newMessageNotification.setAttribute('onclick', 'hideMessageNotification(this)');
        messageNotification.appendChild(newMessageNotification);
        setTimeout(() => {
            newMessageNotification.classList.remove('show-message-notification');
            newMessageNotification.classList.add('hide-message-notification');
            setTimeout(() => {
            newMessageNotification.parentNode.removeChild(newMessageNotification);
            }, 150);
        }, 2000);
    }
};


function openChat(element) {
    var newChatId = element.getAttribute('chat-id');
    if (newChatId == chatId) {return;};

    var previousChat = document.querySelector(`[chat-id='${chatId}'].chat-contacts-section-container`);
    var chatContacts = document.querySelector('.chat-contacts');
    var chatContent = document.querySelector('.chat-content');

    var userName = document.querySelector(`[chat-id='${newChatId}'].ccs-container-info-name`).innerHTML; 
    var userAvatar = document.querySelector(`[chat-id='${newChatId}'].ccs-container-avatar`).src;
    var userActivity = document.querySelector(`[chat-id='${newChatId}'].ccs-container-last-activity`);

    var headerUserName = document.querySelector('.chat-content-header-userinfo-username');
    var headerUserAvatar = document.querySelector('.chat-content-header-avatar');
    var headerUserLink = document.querySelector('.chat-content-header-a');
    var headerActivity = document.querySelector('.chat-content-header-userinfo-activity');


    var chatField = document.querySelector(`[chat-id='${newChatId}'].chat-content-chat`);
    var previousChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    isChatOpen = true;
    chatId = newChatId;

    if (!chatField) {
        var createNewChatField = document.createElement('section')
        createNewChatField.setAttribute('class', 'chat-content-chat');
        createNewChatField.setAttribute('chat-id', newChatId)
        chatContent.appendChild(createNewChatField);
        chatField = createNewChatField;
    };

    if (window.innerWidth <= 1000) {
        headerUserName.innerHTML = userName;
        headerUserAvatar.src = userAvatar;
        headerActivity.innerHTML = userActivity.innerHTML;

        chatContent.classList.add('mobile-element-show');
        chatContent.classList.remove('mobile-element-hide');
        chatContacts.classList.add('mobile-element-hide');
        chatContacts.classList.remove('mobile-element-show');
        if (previousChatField) {
            previousChatField.style.display = 'none';
        };
        chatField.style.display = 'flex';

    } else {

        if ((chatContent.classList.contains('show-chat-field')) || (chatContent.classList.contains('update-chat-field'))) {
            chatContent.classList.remove('show-chat-field');  
            chatContent.classList.remove('update-chat-field');  
            void chatContent.offsetWidth;
            chatContent.classList.add('update-chat-field');
            setTimeout(() => {
                headerUserName.innerHTML = userName;
                headerActivity.innerHTML = userActivity.innerHTML;
                var changeVerify = headerUserName.querySelector('.user-verify-small');
                if (changeVerify) {changeVerify.classList.remove('user-verify-small');};

                if (previousChatField) {
                    previousChatField.style.display = 'none';
                };

                chatField.style.display = 'flex';
            }, 250);
        } else {
            chatContent.classList.add('show-chat-field');
            headerUserName.innerHTML = userName;
            headerActivity.innerHTML = userActivity.innerHTML;
            var changeVerify = headerUserName.querySelector('.user-verify-small');
            if (changeVerify) {changeVerify.classList.remove('user-verify-small');};
        }

        element.classList.add('chat-contacts-selected');
        previousChat.classList.remove('chat-contacts-selected');
        previousChat.classList.add('chat-contacts-unselected');
        setTimeout(() => {
            previousChat.classList.remove('chat-contacts-unselected');
        }, 500);

    };
};

function closeChat() {
    isChatOpen = false;
    var previousChat = document.querySelector(`[chat-id='${chatId}'].chat-contacts-section-container`);
    previousChat.classList.remove('chat-contacts-selected');
    var chatContacts = document.querySelector('.chat-contacts');
    var chatContent = document.querySelector('.chat-content');
    chatContent.classList.add('mobile-element-hide');
    chatContent.classList.remove('mobile-element-show');
    chatContacts.classList.add('mobile-element-show');
    chatContacts.classList.remove('mobile-element-hide');
};
