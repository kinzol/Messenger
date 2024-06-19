var recordStatus = false;
var cameraStyleStory = true;

let mediaRecorder;
let recordedChunks = [];
var url;

navigator.mediaDevices.getUserMedia({ video: true, audio: true})
.then(stream => {
    streamSave = stream;
    liveStream = stream;
    mediaRecorder = new MediaRecorder(stream);
    var videoCamera = document.querySelector('.camera-video');
    var cameraVideoBackground = document.querySelector('.camera-video-background');
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
    cameraVideoBackground.srcObject = stream;
    
    recordButton.classList.add('camera-record-story-show');
})
.catch(err => {
    var cameraError = document.querySelector('.camera-error');
    cameraError.classList.add('camera-error-show');
    notification(3, 'An error occurred while accessing the camera!');
    setTimeout(() => {window.location.href = window.location.origin}, 2000)
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
    var cameraTimeline = document.querySelector('.camera-timeline');

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
        cameraTimeline.classList.remove('camera-timeline-hide');
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

        liveStart.style.display = 'flex';
        liveStart.classList.add('live-start-show');
    } else {
        cameraStyle.classList.remove('camera-style-right');
        cameraStyleButtonStory.classList.remove('camera-style-button-hide');
        cameraStyleButtonLive.classList.add('camera-style-button-hide');
        cameraStyleStory = true;

        cameraRecordStory.classList.add('camera-record-story-show');

        liveStart.classList.remove('live-start-show');
        setTimeout(() => liveStart.style.display = 'none', 250);
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


function reloadResult() {
    confirmationDialog("Are you sure you want to record story again?").then((value) => {
        if (value) {
            location.reload();
        };
    });
};


function closeCreateStory() {
    if (recordedChunks.length != 0 || recordStatus == true) {
        confirmationDialog("Are you sure you want to close this page?").then((value) => {
            if (value) {
                window.location.href = window.location.origin;
            };
        });
    } else {
        window.location.href = window.location.origin;
    };
};


function publishStory() {
    confirmationDialog("Are you sure you want to publish a story?").then((value) => {
        if (value) {
            var videoResultDuration = document.querySelector('.camera-video-result').duration;
            var file = new File(recordedChunks, 'video.mp4', { type: 'video/mp4' });
            var formData = new FormData();
            formData.append('video_content', file);
            formData.append('video_duration', videoResultDuration);

            $.ajax({
                url: '/api/v1/story/',
                method: 'post',
                dataType: 'json',
                processData: false,
                contentType: false,
                data: formData,
                success: function(data){
                    console.log(data)
                    if (data.status) {
                        window.location.href = `${window.location.origin}/`;
                    } else {
                        notification(3, 'An error occurred while publishing story!');
                    };
                }
            });
        };
    });
};


$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    }
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
