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