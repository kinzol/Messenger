var recordStatus = false;
var cameraStyleStory = true;

let mediaRecorder;
let recordedChunks = [];
var url;

navigator.mediaDevices.getUserMedia({ video: true, audio: true})
.then(stream => {
    streamSave = stream;
    mediaRecorder = new MediaRecorder(stream);
    var videoCamera = document.querySelector('.camera-video');
    var resultVideoCamera = document.querySelector('.camera-video-result');

    mediaRecorder.ondataavailable = function(e) {
        recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = function() {
        var blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        url = URL.createObjectURL(blob);


        resultVideoCamera.src = url;
        resultVideoCamera.style.display = 'flex';
        videoCamera.style.display = 'none';

    };

    var recordButton = document.querySelector('.camera-record-story');
    videoCamera.srcObject = stream;
    recordButton.classList.add('camera-record-story-show');
})
.catch(err => {
    var cameraError = document.querySelector('.camera-error');
    cameraError.classList.add('camera-error-show');
});




function changeMuted() {
    var cameraVideoResult = document.querySelector('.camera-video-result');
    var cameraVideoResultMuted = document.querySelector('.camera-video-result-muted');

    if (cameraVideoResult.muted) {
        cameraVideoResult.muted = false;
        cameraVideoResultMuted.src = svgSoundMax;
    } else {
        cameraVideoResult.muted = true;
        cameraVideoResultMuted.src = svgSoundMuted;
    };

    cameraVideoResultMuted.classList.add('camera-video-result-muted-show');
    setTimeout(() => cameraVideoResultMuted.classList.remove('camera-video-result-muted-show'), 500);
};



function cameraRecord() {
    var cameraStyle = document.querySelector('.camera-style');
    var recordButton = document.querySelector('.camera-record-story');
    var recordButtonStop = document.querySelector('.camera-record-story-stop');
    var recordTimelineMove = document.querySelector('.camera-timeline-move');
    var recordTimeline = document.querySelector('.camera-timeline');
    var cameraVideoResultButtons = document.querySelector('.camera-video-result-buttons');

    recordTimelineMove.backgroundColor = '#ffffffce';

    if (recordStatus) {
        recordButton.classList.add('camera-record-story-hide');
        cameraVideoResultButtons.style.display = 'flex';
        cameraVideoResultButtons.style.opacity = '1';
        setTimeout(() => recordButton.style.display = 'none', 250);
        recordTimelineMove.classList.remove('camera-timeline-move-start');
        recordTimeline.classList.add('camera-timeline-hide');
        recordStatus = false;
        mediaRecorder.stop();
    } else {
        recordButton.classList.add('camera-record-story-recording');
        recordButtonStop.classList.add('camera-record-story-stop-show');
        recordTimelineMove.classList.add('camera-timeline-move-start');
        cameraStyle.style.opacity = "0";
        setTimeout(() => cameraStyle.style.display = 'none', 250)
        recordStatus = true;
        mediaRecorder.start();

        setTimeout(() => {
            if (recordStatus) {
                recordTimelineMove.style.backgroundColor = '#f43f38';
            };
        }, 45000);

        setTimeout(() => {
            if (recordStatus) {
                cameraRecord();
            };
        }, 60000);
    };
};


function changeStyle() {
    var cameraStyle = document.querySelector('.camera-style');
    var cameraStyleButtonStory = document.querySelector('.camera-style-button-story');
    var cameraStyleButtonLive = document.querySelector('.camera-style-button-live');

    var cameraRecordStory = document.querySelector('.camera-record-story');
    var cameraTimeline = document.querySelector('.camera-timeline');
    var liveStart = document.querySelector('.live-start');

    if (cameraStyleStory) {
        cameraStyle.classList.add('camera-style-right');
        cameraStyleButtonStory.classList.add('camera-style-button-hide');
        cameraStyleButtonLive.classList.remove('camera-style-button-hide');
        cameraStyleStory = false;

        cameraRecordStory.classList.remove('camera-record-story-show');
        cameraTimeline.style.opacity = '0';

        liveStart.style.display = 'flex';
        liveStart.classList.add('live-start-show');
    } else {
        cameraStyle.classList.remove('camera-style-right');
        cameraStyleButtonStory.classList.remove('camera-style-button-hide');
        cameraStyleButtonLive.classList.add('camera-style-button-hide');
        cameraStyleStory = true;

        cameraRecordStory.classList.add('camera-record-story-show');
        cameraTimeline.style.opacity = '1';

        liveStart.classList.remove('live-start-show');
        setTimeout(() => liveStart.style.display = 'flex', 250);
    };
};


function liveStart() {
    var liveStart = document.querySelector('.live-start');
    var liveControls = document.querySelector('.live-controls');

    var cameraStyle = document.querySelector('.camera-style');
    var cameraTopButtons = document.querySelector('.camera-top-buttons');

    liveStart.classList.remove('live-start-show');
    cameraStyle.style.opacity = '0';
    cameraTopButtons.style.opacity = '0';
    setTimeout(() => cameraStyle.style.display = 'none', 250);
    setTimeout(() => cameraTopButtons.style.display = 'none', 250);

    liveControls.style.display = 'flex';
    liveControls.style.opacity = '1';
    timerStart();
};


function changeLiveUserCount() {
    var element = document.querySelector('.live-user-counter-num');
    element.innerHTML = element.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
