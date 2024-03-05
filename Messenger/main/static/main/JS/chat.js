var messageActionsId = null;
var replyMessageId = null;
var replyMessageContent = null;
var partnerName = null;
var partnerId = null;
var replyStatus = false;
var previousChatField = null;
var isChatOpen = false;

var fileStatus = false;
var fileContent = null;
var fileName = null;
var fileType = null;
var fileSize = null;
var fileSizeLimit = 150*1000;

var timeout;
var userSleep = false;

function resetTimer() {
    clearTimeout(timeout);
    if (userSleep) {
        userSleep = false;
        console.log('Пользователь вернулся')
    }
    timeout = setTimeout(function() {
        userSleep = true;
        console.log('Пользователь неактивен');
    }, 5 * 60 * 1000);
}

window.addEventListener('mousemove', resetTimer);
window.addEventListener('keypress', resetTimer);
window.addEventListener('click', resetTimer);

function chatChangeSendInputButton() {
    var messageInput = document.querySelector(`[chat-id='${chatId}'].chat-content-input-message`);
    
    if (messageInput.value.length == 1 || fileStatus) {
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
        return

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

function showMessageActions(element, reply) {
    var messageActions = document.querySelector('.message-actions');
    var replyButton = document.querySelector('.message-actions-button-reply');

    if (reply) {
        replyButton.style.display = 'flex';
    } else {
        replyButton.style.display = 'none';
    };
    messageActionsId = element.getAttribute('message-id');
    messageActions.classList.remove('message-actions-hide');
    messageActions.classList.add('message-actions-show');
};

function messageReply() {
    var replyContainer = document.querySelector('.chat-content-input-reply');
    var inputFile = document.querySelector('.chat-content-input-file');
    var getMessageText = document.querySelector(`[message-id='${messageActionsId}'].ccc-message-text-span`);
    var inputReplyMessage = document.querySelector('.chat-content-input-reply-message');
    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    moveChatField.classList.add('chat-content-chat-move');

    replyMessageContent = inputReplyMessage.innerHTML;
    replyMessageId = messageActionsId;
    replyStatus = true;

    inputReplyMessage.innerHTML = getMessageText.innerHTML;
    inputFile.classList.add('chat-content-input-file-hide');
    hideMessageActions();
    replyContainer.classList.remove('message-actions-hide');
    replyContainer.classList.add('message-actions-show');
    setTimeout(() => {
        scrollToBottom();
    }, 200);
};


function hideReplyContainer() {
    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);
    var replyContainer = document.querySelector('.chat-content-input-reply');
    var inputFile = document.querySelector('.chat-content-input-file');

    moveChatField.classList.remove('chat-content-chat-move');

    inputFile.classList.remove('chat-content-input-file-hide');
    hideMessageActions();
    replyContainer.classList.remove('message-actions-show');
    replyContainer.classList.add('message-actions-hide');
    replyStatus = false;

    setTimeout(() => {
        replyContainer.classList.remove('message-actions-hide');
    }, 250);
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

    var messageCounter = document.querySelector(`[chat-id='${newChatId}'].ccs-container-info-message-count`);
    if (messageCounter) {
        var messageCounterContainer = document.querySelector(`[chat-id='${newChatId}'].ccs-container-info-message-container-second`);
        messageCounter.classList.add('ccs-container-info-message-count-hide');
        setTimeout(() => {
            messageCounterContainer.removeChild(messageCounter);
        }, 250);
    };

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

    var inputMessageContainer = document.querySelector('.chat-content-input-message-container');


    var chatField = document.querySelector(`[chat-id='${newChatId}'].chat-content-chat`);
    var previousChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    var inputMessageField = document.querySelector(`[chat-id='${newChatId}'].chat-content-input-message`);
    var previousInputMessageField = document.querySelector(`[chat-id='${chatId}'].chat-content-input-message`);

    var emojiField = document.querySelector('.chat-content-input-container-emoji');
    if (emojiField) {emojiField.classList.remove('chat-content-input-container-emoji-show');};

    if (previousChatField) {
        var messagePlate = previousChatField.querySelector('.ccc-date-new-message');
        if (messagePlate) {
            setTimeout(() => {
                messagePlate.parentNode.removeChild(messagePlate);
            }, 250);
            var index = newMessagePlate.indexOf(parseInt(chatId));
            if (index > -1) {
                newMessagePlate.splice(index, 1);
            }
        };
    };

    isChatOpen = true;
    chatId = newChatId;

    if (!chatField) {
        var createNewChatField = document.createElement('section')
        createNewChatField.setAttribute('class', 'chat-content-chat');
        createNewChatField.setAttribute('chat-id', newChatId)
        chatContent.appendChild(createNewChatField);
        chatField = createNewChatField;

        var createNewInputField = document.createElement('input');
        createNewInputField.setAttribute('type', 'text');
        createNewInputField.setAttribute('chat-id', newChatId);
        createNewInputField.setAttribute('oninput', 'chatChangeSendInputButton()');
        createNewInputField.setAttribute('class', 'chat-content-input-message');
        inputMessageContainer.appendChild(createNewInputField);
        inputMessageField = createNewInputField;

        if (previousChatField) {
            previousChatField.style.display = 'none';
            previousInputMessageField.style.display = 'none';
        };
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
            previousInputMessageField.style.display = 'none';
        };
        chatField.style.display = 'flex';
        inputMessageField.style.display = 'flex';
        closeFileInput();

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
                    previousInputMessageField.style.display = 'none';
                };

                chatField.style.display = 'flex';
                inputMessageField.style.display = 'flex';
                closeFileInput();
            }, 250);
        } else {
            chatContent.classList.add('show-chat-field');
            headerUserName.innerHTML = userName;
            headerActivity.innerHTML = userActivity.innerHTML;
            var changeVerify = headerUserName.querySelector('.user-verify-small');
            if (changeVerify) {changeVerify.classList.remove('user-verify-small');};
        }

        element.classList.add('chat-contacts-selected');
        if (previousChatField) {
            previousChat.classList.remove('chat-contacts-selected');
            previousChat.classList.add('chat-contacts-unselected');
            setTimeout(() => {
                previousChat.classList.remove('chat-contacts-unselected');
            }, 500);
        };
        inputMessageField.focus();
    };
};

function closeChat() {
    isChatOpen = false;
    var previousChat = document.querySelector(`[chat-id='${chatId}'].chat-contacts-section-container`);
    var previousInputMessageField = document.querySelector(`[chat-id='${chatId}'].chat-content-input-message`);
    var previousChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    var messagePlate = previousChatField.querySelector('.ccc-date-new-message');
    if (messagePlate) {
        setTimeout(() => {
            messagePlate.parentNode.removeChild(messagePlate);
        }, 500);
        var index = newMessagePlate.indexOf(parseInt(chatId));
        if (index > -1) {
            newMessagePlate.splice(index, 1);
        }
    };

    previousChat.classList.remove('chat-contacts-selected');
    var chatContacts = document.querySelector('.chat-contacts');
    var chatContent = document.querySelector('.chat-content');
    chatContent.classList.add('mobile-element-hide');
    chatContent.classList.remove('mobile-element-show');
    chatContacts.classList.add('mobile-element-show');
    chatContacts.classList.remove('mobile-element-hide');
    setTimeout(() => {
        previousInputMessageField.style.display = 'none';
        previousChatField.style.display = 'none';
    }, 500);
    chatId = null;
};



const dropZone = document.body;
if (dropZone) {
    var hoverClassName = 'hover';
    var fileDragContent = document.querySelector('.chat-content-file-drag');
  
    dropZone.addEventListener("dragenter", function(e) {
        if (isChatOpen && !replyStatus) {
            e.preventDefault();
        };
    });
  
    dropZone.addEventListener("dragover", function(e) {
        if (isChatOpen && !replyStatus) {
            e.preventDefault();
            fileDragContent.classList.add('chat-content-file-drag-show');
        };
    });
  
    dropZone.addEventListener("dragleave", function(e) {
        if (isChatOpen && !replyStatus) {
            e.preventDefault();
            fileDragContent.classList.remove('chat-content-file-drag-show');
        };
    });

    dropZone.addEventListener("drop", function(e) {
        e.preventDefault();
        fileDragContent.classList.remove('chat-content-file-drag-show');
    });
  
    // Это самое важное событие, событие, которое дает доступ к файлам
    fileDragContent.addEventListener("drop", function(e) {
        if (isChatOpen && !replyStatus) {
            e.preventDefault();
            fileContent = Array.from(e.dataTransfer.files);
            openFileInput();
        };
    });
}


function openFileButton(element) {
    fileContent = element.files;
    openFileInput();
}


function openFileInput() {
    var inputFileContent = document.querySelector('.chat-content-input-file-container');
    var inputFileButton = document.querySelector('.chat-content-input-file');
    var inputFileTypeImg = document.querySelector('.cci-file-type-img');
    var inputFileTypeText = document.querySelector('.cci-file-type-text');
    var inputFileTypeName = document.querySelector('.cci-file-filename');
    var inputMessageFull = document.querySelector('.chat-content-input-container');
    var inputFileSend = document.querySelector('.cci-file-send');
    var inputFileTypeText = document.querySelector('.cci-file-type-text');

    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    var inputFileTypeImage = document.querySelector('.cci-file-filecontent');
    var inputFileTypeAudio = document.querySelector('.cci-file-filecontent-audio');
    var inputFileTypeVideo = document.querySelector('.cci-file-filecontent-video');
    var inputFileTypeVideoSource = document.querySelector('.cci-file-filecontent-video-source');

    fileDragContent.classList.remove('chat-content-file-drag-show');
    

    fileName = fileContent[0].name;
    fileType = fileContent[0].type.split('/')[0];
    fileSize = (fileContent[0].size/ 1024).toFixed(2);
            
    if (fileSizeLimit < fileSize) {
        fileStatus = false;
        return notification(3, `File size limit exceeded ${fileSizeLimit/1000}MB`)
    }

    fileStatus = true;
            
    if (fileType == 'image') {
        inputFileTypeImg.src = svgImage;
        inputFileContent.classList.remove('chat-content-input-file-container-show-notext');
        inputFileContent.classList.add('chat-content-input-file-container-show');
        inputMessageFull.classList.remove('chat-content-input-container-hide');
        inputFileSend.style.display = 'none';
        chatChangeSendInputButton();

        inputFileTypeName.style.display = 'none';
        inputFileTypeImage.style.display = 'flex';
        inputFileTypeVideo.style.display = 'none';
        inputFileTypeAudio.style.display = 'none';
        moveChatField.classList.add('chat-content-chat-move');

        var reader = new FileReader();
        reader.onload = (e) => {
            inputFileTypeImage.src = e.target.result;
        }
        reader.readAsDataURL(fileContent[0]);

    } else if (fileType == 'video') {
        inputFileTypeImg.src = svgVideo;
        inputFileContent.classList.remove('chat-content-input-file-container-show-notext');
        inputFileContent.classList.add('chat-content-input-file-container-show');
        inputMessageFull.classList.remove('chat-content-input-container-hide');
        inputFileSend.style.display = 'none';
        chatChangeSendInputButton();

        inputFileTypeName.style.display = 'none';
        inputFileTypeImage.style.display = 'none';
        inputFileTypeVideo.style.display = 'flex';
        inputFileTypeAudio.style.display = 'none';
        moveChatField.classList.add('chat-content-chat-move');

        inputFileTypeVideoSource.src = URL.createObjectURL(fileContent[0]);
        inputFileTypeVideo.load();

    } else if (fileType == 'audio') {
        inputFileTypeImg.src = svgMusic;
        inputFileContent.classList.remove('chat-content-input-file-container-show');
        inputFileContent.classList.add('chat-content-input-file-container-show-notext');
        inputMessageFull.classList.add('chat-content-input-container-hide');
        inputFileSend.style.display = 'flex';

        inputFileTypeName.style.display = 'none';
        inputFileTypeImage.style.display = 'none';
        inputFileTypeVideo.style.display = 'none';
        inputFileTypeAudio.style.display = 'flex';

        moveChatField.classList.remove('chat-content-chat-move');

        var reader = new FileReader();
        reader.onload = (e) => {
            inputFileTypeAudio.src = e.target.result;
        }
        reader.readAsDataURL(fileContent[0]);
    } else {
        inputFileTypeImg.src = svgFilePlus;
        inputFileContent.classList.remove('chat-content-input-file-container-show');
        inputFileContent.classList.add('chat-content-input-file-container-show-notext');
        inputMessageFull.classList.add('chat-content-input-container-hide');
        inputFileSend.style.display = 'flex';

        inputFileTypeName.style.display = 'flex';
        inputFileTypeImage.style.display = 'none';
        inputFileTypeVideo.style.display = 'none';
        inputFileTypeAudio.style.display = 'none';
        moveChatField.classList.remove('chat-content-chat-move');
                
    };
    inputFileTypeText.innerHTML = fileType;
    inputFileTypeName.innerHTML = fileName;
    setTimeout(() => {
        scrollToBottom();
    }, 200);
};


function closeFileInput() {
    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);
    var inputFileContent = document.querySelector('.chat-content-input-file-container');
    var inputMessageFull = document.querySelector('.chat-content-input-container');

    fileStatus = false;

    inputMessageFull.classList.remove('chat-content-input-container-hide');
    inputFileContent.classList.remove('chat-content-input-file-container-show');
    inputFileContent.classList.remove('chat-content-input-file-container-show-notext');
    moveChatField.classList.remove('chat-content-chat-move');
    chatChangeSendInputButton();
};


function scrollToBottom() {
    var chatFieldScroll = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    if (chatFieldScroll) {
        var userScrollPosition = chatFieldScroll.scrollTop;
        var maxScrollPosition = chatFieldScroll.scrollHeight - chatFieldScroll.clientHeight;

        if ((maxScrollPosition-200) <= userScrollPosition) {
            chatFieldScroll.scroll({ top: chatFieldScroll.scrollHeight, behavior: 'smooth' });
        };
    };
};


function scrollToBottomAnyway() {
    var chatFieldScroll = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);
    if (chatFieldScroll) {
        chatFieldScroll.scroll({ top: chatFieldScroll.scrollHeight, behavior: 'smooth' });
    };
};


function scrollToBottomNoAnimation() {
    var chatFieldScroll = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);
    if (chatFieldScroll) {
        chatFieldScroll.scrollTop = chatFieldScroll.scrollHeight;
    };
};

function replyScrollMessage(element) {
    var replyId = element.getAttribute('reply-id');
    var replyToMessage = document.querySelector(`[message-id='${replyId}'].ccc-container`);
    var replyChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    if (!replyToMessage) {
        return notification(3, 'This message was not found, maybe it hasn’t downloaded yet!')
    };
    
    var replyChatFieldHeight = replyChatField.clientHeight;
    var replyToMessageHeight = replyToMessage.clientHeight;
    var scrollPosition = replyToMessage.offsetTop - (replyChatFieldHeight - replyToMessageHeight) / 2;
    replyChatField.scrollTo({ top: scrollPosition, behavior: 'smooth' });

    setTimeout(() => {
        replyToMessage.classList.add('ccc-container-reply');
        setTimeout(() => {
            replyToMessage.classList.remove('ccc-container-reply');
        }, 2000);
    }, 500);
}


function createEmoji(chatStyle) {
    var emojiList = '';
    var emojiScroll = document.createElement('div');
    emojiScroll.classList.add('chat-content-input-container-emoji-scroll');
    emojiScroll.classList.add('custom-scrollbar');

    emoji.forEach((emojis, index) => {
        emojiList = emojiList + `<span class="chat-content-input-container-emoji-title">${emoji_names[index]}</span>
                                <div class="chat-content-input-container-emoji-container">`;
            
        emojis.forEach(emojiSymbol => {
            if (chatStyle) {
                emojiList = emojiList + `<div class="chat-content-input-container-emoji-emoji" onclick="writeEmojiInput(this)">${emojiSymbol}</div>`;
            } else {
                emojiList = emojiList + `<div class="chat-content-input-container-emoji-emoji">${emojiSymbol}</div>`;
            };
        });

        emojiList = emojiList + '</div>';

    });

    emojiScroll.innerHTML = emojiList;
    return emojiScroll;
};
var emojiList = null;
var emojiListReaction = null;
document.addEventListener("DOMContentLoaded", (event) => {
    emojiList = createEmoji(true);
    emojiListReaction = createEmoji(false);
});

var emojiChatStatus = false;
function openEmoji() {
    if (!emojiChatStatus) {
        var inputContainer = document.querySelector('.chat-content-input-container');

        var emojiInputContainer = document.createElement('div');
        emojiInputContainer.classList.add('chat-content-input-container-emoji');

        emojiInputContainer.appendChild(emojiList);
        inputContainer.appendChild(emojiInputContainer);
    }

    var emojiField = document.querySelector('.chat-content-input-container-emoji');
    setTimeout(() => {
        emojiField.classList.add('chat-content-input-container-emoji-show');
        emojiChatStatus = true;
    }, 200);
}


document.addEventListener('click', event => {
    var emojiField = document.querySelector('.chat-content-input-container-emoji');
    if (emojiChatStatus) {
        if (!emojiField.contains(event.target)) {
            emojiField.classList.remove('chat-content-input-container-emoji-show');
        }
    }
})

function writeEmojiInput(element) {
    var inputMessageField = document.querySelector(`[chat-id='${chatId}'].chat-content-input-message`);
    inputMessageField.value = inputMessageField.value + element.innerHTML;
}

