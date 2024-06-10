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
    
    if (messageInput.value.length >= 1 || fileStatus) {
        var inputAudio = document.querySelector('.chat-content-input-audio');
        var inputMessageImg = document.querySelector('.chat-content-input-message-img');

        if (inputAudio != null) {
            inputMessageImg.classList.add('chat-content-input-button-change');
            setTimeout(() => {
                inputMessageImg.src = inputSendImg;
                inputAudio.classList.remove('chat-content-input-audio');
                inputAudio.classList.add('chat-content-input-send');
                // inputAudio.removeAttribute('onclick');
                inputAudio.setAttribute('onclick', 'onContentSend()');
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
var voice = [];

function startRecordingAudio() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(audioStream => {
        stream = audioStream;
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) {
                voice.push(e.data);
            }
        };

        mediaRecorder.onstop = function() {

            if (voice.length > 0) {
                const blob = new Blob(voice, { type: 'audio/wav' });

                const fileReader = new FileReader();
                fileReader.onload = function(event) {
                    const fileContentReader = event.target.result.split(',')[1];

                    webSocketChat.send(JSON.stringify({
                        'send_type': 'chat_message',
                        'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
                        'type': 'audio',
                        'message': 'Voice message',
                        'reply_id': null,
                        'reply_message': null,
                        'forwarded_content': null,
                        'file': fileContentReader,
                        'file_name': 'voice.wav',
                        'from_user': userId,
                        'to_user': chatId,
                    }));

                };
                fileReader.readAsDataURL(blob);
            }
        };

        mediaRecorder.start();
    })
    .catch(error => {
        console.error('Error accessing microphone:', error);
    });
}

document.querySelector('.chat-content-audio-record-send-img').addEventListener('click', function() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        offContentAudio();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

document.querySelector('.chat-content-audio-record-trash-img').addEventListener('click', function() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        offContentAudio();
        voice = [];
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});


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


function hideMessageActions() {
    var messageActions = document.querySelector('.message-actions')
    messageActions.classList.remove('message-actions-show');

    closesetReactionEmoji();

    setTimeout(() => {
        messageActions.style.display = 'none';
    }, 250);
};

function showMessageActions(element, delMessage) {
    var messageActions = document.querySelector('.message-actions');
    var replyButton = document.querySelector('.red-button');

    if (delMessage) {
        replyButton.style.display = 'display';
    } else {
        replyButton.style.display = 'none';
    };
    messageActionsId = element.getAttribute('message-id');

    messageActions.style.display = 'flex';
    setTimeout(() => {
        messageActions.classList.add('message-actions-show');
    }, 10);
};

function messageReply() {
    var replyContainer = document.querySelector('.chat-content-input-reply');
    var inputFile = document.querySelector('.chat-content-input-file');
    var getMessageText = document.querySelector(`[message-id='${messageActionsId}'].ccc-message-text-span`);
    var inputReplyMessage = document.querySelector('.chat-content-input-reply-message');
    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);

    scrollDown = document.querySelector('.chat-content-input-scrollDown');
    scrollDown.classList.add('chat-content-input-scrollDown-movetop');

    moveChatField.classList.add('chat-content-chat-move');

    inputReplyMessage.innerHTML = getMessageText.innerHTML;
    inputFile.classList.add('chat-content-input-file-hide');
    hideMessageActions();

    replyMessageContent = inputReplyMessage.innerHTML;
    replyMessageId = messageActionsId;
    replyStatus = true;

    replyContainer.classList.add('chat-content-input-reply-show');
    setTimeout(() => {
        scrollToBottom();
    }, 150);
};


function hideReplyContainer() {
    var moveChatField = document.querySelector(`[chat-id='${chatId}'].chat-content-chat`);
    var replyContainer = document.querySelector('.chat-content-input-reply');
    var inputFile = document.querySelector('.chat-content-input-file');

    scrollDown = document.querySelector('.chat-content-input-scrollDown');
    scrollDown.classList.remove('chat-content-input-scrollDown-movetop');

    moveChatField.classList.remove('chat-content-chat-move');

    inputFile.classList.remove('chat-content-input-file-hide');
    hideMessageActions();

    replyContainer.classList.remove('chat-content-input-reply-show');
    replyStatus = false;
}

var doubleClickMessageStatus = false;
function doubleClickMessage(element) {
    if (doubleClickMessageStatus) {
        doubleClickMessageStatus = false;
        console.log('doubleClick');
        setReactionMessage({'textContent': '❤️'}, element.getAttribute('message-id'));
    } else {
        doubleClickMessageStatus = true;
        setTimeout(() => {
            doubleClickMessageStatus = false;
        }, 500);
    };
};

function setReactionMessage(element, messageId) {

    if (messageReactionsInfo[messageId]) {
        messageReactionsInfo[messageId].forEach((rct) => {
            if (rct.user == userId) {
                messageReactionRemoveProcess(rct.pk, messageId, userIdName)
            };
        });
    }

    webSocketChat.send(JSON.stringify({
        'send_type': 'chat_reaction_add',
        'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
        'reaction': element.textContent,
        'message_id': parseInt(messageId),
        'from_user': userId,
    }));

    hideReplyContainer();
};


function setReactionMessageData(reaction, messageId, from_user, reaction_id) {
    var reactionField = document.querySelector(`[message-id='${messageId}'].ccc-reactions`);
    
    if (!reactionField) {
        var messageForReaction = document.querySelector(`[message-id='${messageId}'].reaction-area`);
        if (!messageForReaction) {return};
        messageForReaction.innerHTML = messageForReaction.innerHTML + `<div message-id='${messageId}' onclick="messageReactions(this)" class="ccc-reactions"></div>`;
        reactionField = document.querySelector(`[message-id='${messageId}'].ccc-reactions`);
    };
    
    if (!messageReactionsInfo[messageId]) {
        messageReactionsInfo[messageId] = [{'pk': reaction_id, 'reaction': reaction, 'user': from_user}]
    } else {
        messageReactionsInfo[messageId].push({'pk': reaction_id, 'reaction': reaction, 'user': from_user})
    };

    reactionField.innerHTML += reaction;
};


function messageReactions(element) {
    var messageActions = document.querySelector('.message-reaction');
    var messageReactionsContent = document.querySelector('.message-reactions-content');
    var contentReaction = '';
    messageActionsId = element.getAttribute('message-id');
    var msgReaction = messageReactionsInfo[parseInt(messageActionsId)];

    msgReaction.forEach((rct) => {
        if (rct.user == userId) {
            contentReaction += `<div id="${rct.pk}" msg-id="${messageActionsId}" author="${userIdName}" onclick="messageReactionRemove(this)" class="message-reactions-content-reaction">${userIdName}<div>${rct.reaction}</div></div>`;
        } else {
            var ccsContainerInfoName = document.querySelector(`[chat-id='${rct.user}'].ccs-container-info-name`);
            contentReaction += `<div id="${rct.pk}" msg-id="${messageActionsId}" author="${ccsContainerInfoName.textContent}" onclick="messageReactionRemove(this)" class="message-reactions-content-reaction">${ccsContainerInfoName.innerHTML}<div>${rct.reaction}</div></div>`;
        };
    });
    messageReactionsContent.innerHTML = contentReaction;
    messageActions.style.display = 'flex';
    setTimeout(() => {
        messageActions.classList.add('message-actions-show');
    }, 10);
};

function hideMessageReactions() {
    var messageActions = document.querySelector('.message-reaction')
    messageActions.classList.remove('message-actions-show');
    setTimeout(() => {
        messageActions.style.display = 'none';
    }, 250);
};


function messageReactionRemove(element) {
    var reacrId = parseInt(element.getAttribute('id'));
    var msgId = parseInt(element.getAttribute('msg-id'));
    var authorId = element.getAttribute('author');

    messageReactionRemoveProcess(reacrId, msgId, authorId)

};


function messageReactionRemoveProcess(reacrId, msgId, authorId) {

    if (userIdName != authorId) {
        return notification(3, 'You can’t remove someone else’s reaction!')
    };

    messageReactionRemoveData(msgId, reacrId)
    hideMessageReactions()

    webSocketChat.send(JSON.stringify({
        'send_type': 'chat_reaction_remove',
        'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
        'reaction_id': reacrId,
        'message_id': msgId,
    }));

};


function messageReactionRemoveData(msgId, reacrId) {
    var contentRct = '';
    var cccReactions = document.querySelector(`[message-id='${msgId}'].ccc-reactions`);
    var reactionArea = document.querySelector(`[message-id='${msgId}'].reaction-area`);

    if (cccReactions) {
        messageReactionsInfo[msgId].forEach((rct) => {
            if (rct.pk == reacrId) {
                contentRct = rct.reaction;
                const index = messageReactionsInfo[msgId].indexOf(rct);
                if (index > -1) {
                    messageReactionsInfo[msgId].splice(index, 1);
                }
            };
        });

        cccReactions.innerHTML = cccReactions.innerHTML.replace(contentRct, '');

        if (messageReactionsInfo[msgId].length == 0) {
            reactionArea.removeChild(cccReactions)
        };
    }

};


function openChat(element) {
    var chatContentHeaderUserinfoActivity = document.querySelector('.chat-content-header-userinfo-activity');
    var chatContentHeaderUserinfoActivityTyping = document.querySelector('.chat-content-header-userinfo-activity-typing');
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

    var ccsContainerUsername = document.querySelector(`[chat-id='${newChatId}'].ccs-container-username`).innerHTML;

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
        };
    };
    var index = newMessagePlate.indexOf(parseInt(newChatId));
    if (index > -1) {
        newMessagePlate.splice(index, 1);
    }

    isChatOpen = true;
    chatId = newChatId;
    userTyping = true;

    if (!chatField) {
        var createNewChatField = document.createElement('section')
        createNewChatField.setAttribute('class', 'chat-content-chat');
        createNewChatField.setAttribute('chat-id', newChatId)
        createNewChatField.setAttribute('onscroll', 'chatFieldScrolled(this)')
        chatContent.appendChild(createNewChatField);
        chatField = createNewChatField;

        var createNewInputField = document.createElement('input');
        createNewInputField.setAttribute('type', 'text');
        createNewInputField.setAttribute('chat-id', newChatId);
        createNewInputField.setAttribute('oninput', 'chatChangeSendInputButton()');
        createNewInputField.setAttribute('class', 'chat-content-input-message');

        createNewInputField.setAttribute('onkeypress', 'onkeypressSendMessage(event)');

        inputMessageContainer.appendChild(createNewInputField);
        inputMessageField = createNewInputField;

        if (previousChatField) {
            previousChatField.style.display = 'none';
            previousInputMessageField.style.display = 'none';
        };

        loadMessages(true);
    };

    if (window.innerWidth <= 1000) {
        headerUserName.innerHTML = userName;
        headerUserLink.href = `${window.location.origin}/profile/${ccsContainerUsername}`;
        headerUserAvatar.src = userAvatar;
        headerActivity.innerHTML = userActivity.innerHTML;
        chatContentHeaderUserinfoActivity.style.display = 'block';
        chatContentHeaderUserinfoActivityTyping.style.display = 'none';

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
                headerUserLink.href = `${window.location.origin}/profile/${ccsContainerUsername}`;
                headerActivity.innerHTML = userActivity.innerHTML;
                chatContentHeaderUserinfoActivity.style.display = 'block';
                chatContentHeaderUserinfoActivityTyping.style.display = 'none';
                var changeVerify = headerUserName.querySelector('.user-verify-small');
                if (changeVerify) {changeVerify.classList.remove('user-verify-small');};

                if (previousChatField) {
                    previousChatField.style.display = 'none';
                    previousInputMessageField.style.display = 'none';
                };

                chatField.style.display = 'flex';
                inputMessageField.style.display = 'flex';
                closeFileInput();
                inputMessageField.focus()
            }, 250);
        } else {
            chatContent.classList.add('show-chat-field');
            headerUserName.innerHTML = userName;
            headerUserLink.href = `${window.location.origin}/profile/${ccsContainerUsername}`;
            headerActivity.innerHTML = userActivity.innerHTML;
            chatContentHeaderUserinfoActivity.style.display = 'block';
            chatContentHeaderUserinfoActivityTyping.style.display = 'none';
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
        inputMessageField.focus()
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
    inputFileSend.setAttribute('onclick', 'onContentSend()')
            
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

    scrollDown = document.querySelector('.chat-content-input-scrollDown');
    scrollDown.classList.add('chat-content-input-scrollDown-movetop');
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

    scrollDown = document.querySelector('.chat-content-input-scrollDown');
    scrollDown.classList.remove('chat-content-input-scrollDown-movetop');
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
                emojiList = emojiList + `<div class="chat-content-input-container-emoji-emoji" onclick="setReactionMessage(this, messageActionsId)">${emojiSymbol}</div>`;
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
    var reactionEmojiContainer = document.querySelector('.message-actions-reaction-emoji-container');

    emojiList = createEmoji(true);
    emojiListReaction = createEmoji(false);

    reactionEmojiContainer.appendChild(emojiListReaction);
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
    chatChangeSendInputButton()
}

var showButtonScrollDown = false;
function chatFieldScrolled(field) {
    fieldHeight = field.scrollHeight - field.offsetHeight;
    fieldPosition = field.scrollTop;
    var fieldId = field.getAttribute('chat-id');

    if ((field.scrollTop == 0) && chatMessagesDataload[fieldId]) {
        loadMessages(false)
    };

    if (((fieldHeight-fieldPosition) > 1000) && !showButtonScrollDown) {
        scrollDown = document.querySelector('.chat-content-input-scrollDown');
        scrollDown.classList.add('chat-content-input-scrollDown-show');
        showButtonScrollDown = true;
    } else if (((fieldHeight-fieldPosition) < 1000) && showButtonScrollDown) {
        scrollDown = document.querySelector('.chat-content-input-scrollDown');
        scrollDown.classList.remove('chat-content-input-scrollDown-show');
        showButtonScrollDown = false;
    };
};

function deleteMessage(element, chatFieldId) {
    var messageContainer = document.querySelector(`[message-id='${parseInt(element)}'].ccc-container`);
    var chatField = document.querySelector(`[chat-id='${chatFieldId}'].chat-content-chat`);
    var ccsContainerInfoMessage = document.querySelector(`[chat-id='${chatFieldId}'].ccs-container-info-message`);
    ccsContainerInfoMessage.innerHTML = '';
    hideMessageActions();

    messageContainer.style.height = `${messageContainer.offsetHeight}px`;
    
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.height = '0px';
    }, 150);

    setTimeout(() => {
        chatField.removeChild(messageContainer);
    }, 1000)
}

function setReactionEmoji() {
    var actionContainer = document.querySelector('.message-actions-container');
    var reactionEmoji = document.querySelector('.message-actions-reaction-emoji');

    reactionEmoji.style.height = '100%';
    reactionEmoji.style.opacity = '1';

    actionContainer.style.backgroundColor = 'rgb(108 139 172)';
};

function closesetReactionEmoji() {
    var actionContainer = document.querySelector('.message-actions-container');
    var reactionEmoji = document.querySelector('.message-actions-reaction-emoji');

    reactionEmoji.style.height = '0%';
    reactionEmoji.style.opacity = '0';

    actionContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.233)';
}

function onkeypressSendMessage(event) {
    if (event.key === 'Enter') {
        onContentSend();
    }

    if (userTyping) {
        userTyping = false;
        webSocketChat.send(JSON.stringify({
            'send_type': 'chat_typing',
            'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
            'from_user': userId,
        }));
        setTimeout(() => {userTyping = true}, 5000);
    }
};

function onContentSend() {
    var chatContentInputMessage = document.querySelector(`[chat-id='${chatId}'].chat-content-input-message`);
    var messageType = '';
    var tempMessage = null;
    
    if (chatContentInputMessage.value.replace(/ /g, '') != '') {
        if (!replyStatus && !fileStatus) {
            messageType = 'text';

        } else if (replyStatus) {
            messageType = 'reply';

        } else if (fileStatus) {
            if (['image', 'video'].includes(fileType)) {
                messageType = `text-${fileType}`;
            } else {
                messageType = 'file';
            };
        };
    } else if (fileStatus) {
        if (['image', 'video'].includes(fileType)) {
            messageType = fileType;
            tempMessage = fileName;
        } else {
            messageType = 'file';
            tempMessage = fileName;
        };
    };

    if ((chatContentInputMessage.value.replace(/ /g, '') == '') && !fileStatus) {
        return
    }

    if (fileStatus) {
        var fileContentReader
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            fileContentReader = event.target.result.split(',')[1];
            
            webSocketChat.send(JSON.stringify({
                'send_type': 'chat_message',
                'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
                'type': messageType,
                'message': tempMessage ? tempMessage : chatContentInputMessage.value,
                'reply_id': replyStatus ? replyMessageId : null,
                'reply_message': replyStatus ? replyMessageContent : null,
                'forwarded_content': null,
                'file': fileContentReader,
                'file_name': fileName,
                'from_user': userId,
                'to_user': chatId,
            }));

            chatContentInputMessage.value = '';
            setTimeout(() => {userTyping = true}, 250)
        };
        fileReader.readAsDataURL(new Blob(fileContent, {type: fileContent.type}));

    } else {
        webSocketChat.send(JSON.stringify({
            'send_type': 'chat_message',
            'target_user_uuid': document.querySelector(`[chat-id='${chatId}'].ccs-container-uuid`).innerHTML,
            'type': messageType,
            'message': tempMessage ? tempMessage : chatContentInputMessage.value,
            'reply_id': replyStatus ? replyMessageId : null,
            'reply_message': replyStatus ? replyMessageContent : null,
            'forwarded_content': null,
            'file': null,
            'file_name': null,
            'from_user': userId,
            'to_user': chatId,
        }));

        chatContentInputMessage.value = '';
        setTimeout(() => {userTyping = true}, 250)
    };
    
    if (fileStatus) {
        closeFileInput()
    };

    if (replyStatus) {
        hideReplyContainer()
    };

    chatChangeSendInputButton()

};


function loadMessages(preload) {
    if (chatMessagesDataload[chatId]) {
        chatMessagesDataload[chatId] = false;

        $.ajax({
            url: '/api/v1/chat/message/',
            method: 'get',
            dataType: 'json',
            data: {offset: chatMessagesOffset[chatId], interlocutor: chatId},
            success: function(data){
                data.messages.reverse()

                if (preload) {
                    data.messages.forEach((message) => {
                        newMessage(message, true, false);
                    });
                } else {
                    data.messages.reverse().forEach((message) => {
                        newMessage(message, false, true);
                    });
                };

                setTimeout(() => {
                    if (data.messages.length == 15) {
                        chatMessagesDataload[chatId] = true;
                    };
                }, 100);
            }
        });

        chatMessagesOffset[chatId] += 15;

    };
};
