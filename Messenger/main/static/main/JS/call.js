document.addEventListener("DOMContentLoaded", (event) => {
    connectSocket();
});


const baseURL = "/"

let localVideo = document.querySelector('#localVideo');
let remoteVideo = document.querySelector('#remoteVideo');

let otherUser = callToUser;
let remoteRTCMessage;

let iceCandidatesFromCaller = [];
let peerConnection;
let remoteStream;
let localStream;

let callInProgress = false;

//event from html
function call(type) {
    let userToCall = callToUser;
    otherUser = callToUser;
    callFormat = type;
    soundHorn.currentTime = 0
    soundHorn.play()
    callAuthor = myName;

    showCallContainer('newCall')

    beReady()
        .then(bool => {
            processCall(userToCall)
        })
}

//event from html
function answer() {
    showCallContainer(callFormat);
    soundRingtone.pause()
    beReady()
        .then(bool => {
            processAccept();
        })
}

let pcConfig = {
    "iceServers":
        [
            { "url": "stun:stun.jap.bloggernepal.com:5349" },
            {
                "url": "turn:turn.jap.bloggernepal.com:5349",
                "username": "guest",
                "credential": "somepassword"
            },
            {"url": "stun:stun.l.google.com:19302"}
        ]
};

// Set up audio and video regardless of what devices are present.
let sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

/////////////////////////////////////////////

let socket;
let callSocket;
function connectSocket() {
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";

    callSocket = new WebSocket(
        ws_scheme
        + window.location.host
        + '/ws/call/'
    );

    callSocket.onopen = event =>{
    //let's send myName to the socket
        callSocket.send(JSON.stringify({
            type: 'login',
            data: {
                name: myName
            }
        }));
    }

    callSocket.onmessage = (e) =>{
        let response = JSON.parse(e.data);
        let type = response.type;

        if(type == 'call_received') {
            callFormat = response.callFormat;
            callSourceFullName = response.sourceFullName;
            callSourceAvatar = response.sourceAvatar;

            callStopUser = response.data.caller;

            soundRingtone.currentTime = 0
            soundRingtone.play()

            showCallContainer('ringing');
            onNewCall(response.data)
        }

        if(type == 'call_answered') {
            soundHorn.pause()
            showCallContainer(callFormat);
            onCallAnswered(response.data);
        }

        if(type == 'call_stop') {
            hideCallContainer()
        }

        if(type == 'call_error') {
            notification(3, response.error)
            hideCallContainer()
        }

        if(type == 'ICEcandidate') {
            onICECandidate(response.data);
        }
    }

    const onNewCall = (data) =>{
        otherUser = data.caller;
        remoteRTCMessage = data.rtcMessage
    }

    const onCallAnswered = (data) =>{
        remoteRTCMessage = data.rtcMessage
        peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
        callInProgress = true;
    }

    const onICECandidate = (data) =>{
        let message = data.rtcMessage

        let candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });

        if (peerConnection) {
            peerConnection.addIceCandidate(candidate);
        } else {
            iceCandidatesFromCaller.push(candidate);
        }

    }

}

/**
 * 
 * @param {Object} data 
 * @param {number} data.name - the name of the user to call
 * @param {Object} data.rtcMessage - the rtc create offer object
 */
function sendCall(data) {
    callSocket.send(JSON.stringify({
        type: 'call',
        full_name: myFullName,
        avatar_url: myAvatarUrl,
        data
    }));

    //FIXME: ТУТ БУДЕТ ЧТО ТИПО Я НАЧАЛ ЗВОНОК, ГУДКИ ТУТ БУДУТ КОРОЧЕ
}



/**
 * 
 * @param {Object} data 
 * @param {number} data.caller - the caller name
 * @param {Object} data.rtcMessage - answer rtc sessionDescription object
 */
function answerCall(data) {
    callSocket.send(JSON.stringify({
        type: 'answer_call',
        data
    }));
    callInProgress = true;
}

/**
 * 
 * @param {Object} data 
 * @param {number} data.user - the other user //either callee or caller 
 * @param {Object} data.rtcMessage - iceCandidate data 
 */
function sendICEcandidate(data) {
    callSocket.send(JSON.stringify({
        type: 'ICEcandidate',
        data
    }));

}

function beReady() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(stream => {
            localStream = stream;
            // localVideo.srcObject = stream;

            return createConnectionAndAddStream()
        })
        .catch(function (e) {
            alert('getUserMedia() error: ' + e.name);
        });
}

function createConnectionAndAddStream() {
    createPeerConnection();
    peerConnection.addStream(localStream);
    return true;
}

function processCall(userName) {
    peerConnection.createOffer((sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription);
        sendCall({
            name: userName,
            callFormat: callFormat,
            sourceFullName: myFullName,
            sourceAvatar: myAvatarUrl,
            rtcMessage: sessionDescription
        })
    }, (error) => {
        console.log("Error");
    });
}

function processAccept() {

    peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
    peerConnection.createAnswer((sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription);

        if (iceCandidatesFromCaller.length > 0) {
            //I am having issues with call not being processed in real world (internet, not local)
            //so I will push iceCandidates I received after the call arrived, push it and, once we accept
            //add it as ice candidate
            //if the offer rtc message contains all thes ICE candidates we can ingore this.
            for (let i = 0; i < iceCandidatesFromCaller.length; i++) {
                //
                let candidate = iceCandidatesFromCaller[i];
                try {
                    peerConnection.addIceCandidate(candidate).then(done => {
                        console.log(done);
                    }).catch(error => {
                        console.log(error);
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            iceCandidatesFromCaller = [];
        }
        
        callAuthor = otherUser;
        answerCall({
            caller: otherUser,
            rtcMessage: sessionDescription
        })

    }, (error) => {
        console.log("Error");
    })
}

/////////////////////////////////////////////////////////

function createPeerConnection() {
    try {
        peerConnection = new RTCPeerConnection(pcConfig);
        // peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = handleIceCandidate;
        peerConnection.onaddstream = handleRemoteStreamAdded;
        peerConnection.onremovestream = handleRemoteStreamRemoved;
        return;
    } catch (e) {
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function handleIceCandidate(event) {
    if (event.candidate) {
        sendICEcandidate({
            user: otherUser,
            rtcMessage: {
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            }
        })

    }
}

function handleRemoteStreamAdded(event) {
    remoteStream = event.stream;
    // remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
}

window.onbeforeunload = function () {
    stop();
};


function stop() {
    var minutes = Math.floor(callSeconds / 60);
    var remainingSeconds = callSeconds % 60;
    var timeString = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

    if ((callSeconds > 0) && callAuthor != null) {
        webSocketChat.send(JSON.stringify({
            'send_type': 'chat_message',
            'target_user_uuid': null,
            'type': callFormat == 'Video call' ? 'video-call' : 'call',
            'message': callFormat,
            'reply_id': null,
            'reply_message': null,
            'call_time': timeString,
            'forwarded_content': null,
            'file': null,
            'file_name': null,
            'from_user': callAuthor,
            'to_user': callAuthor == myName ? callStopUser : myName,
            'new_chat': false
        }));
    }

    callSocket.send(JSON.stringify({
        type: 'call_stop',
        data: {
            name: callStopUser
        }
    }));

    hideCallContainer()
}

function mic() {
    if (localStream && localStream.getAudioTracks().length > 0) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;

        var callButtonsMic = document.querySelectorAll('.call-buttons-mic');

        callButtonsMic.forEach((e) => {
            var micButton = e.querySelector('.call-buttons-img');
            micButton.src = audioTrack.enabled ? svgMic : svgMicOff;
            e.style.backgroundColor = audioTrack.enabled ? '#ffffff3d' : '#ff0000a6';
        });
    } else {
        console.warn("No audio track available.");
    }
}

function video() {
    if (localStream && localStream.getVideoTracks().length > 0) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;

        var callButtonsMic = document.querySelectorAll('.call-buttons-video');

        callButtonsMic.forEach((e) => {
            var micButton = e.querySelector('.call-buttons-img');
            micButton.src = videoTrack.enabled ? svgVideo : svgVideoOff;
            e.style.backgroundColor = videoTrack.enabled ? '#ffffff3d' : '#ff0000a6';
        });
    } else {
        console.warn("No video track available.");
    }
}

function showCallContainer(callType) {
    var callBorder = document.querySelector('.call-border');

    if (callType == 'newCall') {

        var callStatus = document.querySelector('.call-status');
        var callInfo = document.querySelector('.call-info');
        var callButtonsYes = document.querySelector('.call-buttons-yes');
        var callInfoAvatar = document.querySelectorAll('.call-info-avatar');
        var callName = document.querySelectorAll('.call-name');

        callStatus.innerHTML = 'Calling...';
        callInfo.style.display = 'flex';
        callButtonsYes.style.display = 'none';

        callInfoAvatar.forEach((e) => {
            e.src = sourceAvatar
        })

        callName.forEach((e) => {
            e.innerHTML = sourceFullName
        })

    } else if (callType == 'ringing') {

        var callStatus = document.querySelector('.call-status');
        var callInfo = document.querySelector('.call-info');
        var callInfoAvatar = document.querySelectorAll('.call-info-avatar');
        var callName = document.querySelectorAll('.call-name');

        callStatus.innerHTML = callFormat;
        callInfo.style.display = 'flex';

        callInfoAvatar.forEach((e) => {
            e.src = callSourceAvatar
        })

        callName.forEach((e) => {
            e.innerHTML = callSourceFullName
        })

    } else if (callType == 'Video call') {
        startTimer()
        var callInfo = document.querySelector('.call-info');
        var videoAnswer = document.querySelector('.video-answer');

        callInfo.style.display = 'none';
        videoAnswer.style.display = 'flex';

    } else if (callType == 'Audio call') {
        startTimer()
        var callInfo = document.querySelector('.call-info');
        var audioAnswer = document.querySelector('.audio-answer');

        callInfo.style.display = 'none';
        audioAnswer.style.display = 'flex';
    }

    callBorder.style.display = 'flex';

    setTimeout(() => {
        callBorder.style.opacity = '1';
    }, 100);
}


function hideCallContainer() {
    var callBorder = document.querySelector('.call-border');
    var callInfo = document.querySelector('.call-info');
    var callButtonsYes = document.querySelector('.call-buttons-yes');
    var videoAnswer = document.querySelector('.video-answer');
    var audioAnswer = document.querySelector('.audio-answer');

    soundHorn.pause()
    soundRingtone.pause()
    if (callBorder.style.display == 'flex') {
        soundCallOff.play()
    }

    callBorder.style.opacity = '0';

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
    }

    peerConnection = null;
    callInProgress = false;
    callAuthor = null;

    setTimeout(() => {
        callBorder.style.display = 'none';
        audioAnswer.style.display = 'none';
        videoAnswer.style.display = 'none';
        callButtonsYes.style.display = 'flex';
        callInfo.style.display = 'none';
        resetTimer()
    }, 250);
}

let timerInterval;
let callSeconds = 0;
const divs = document.querySelectorAll('.call-status-time');

function startTimer() {
    if (timerInterval) return; // Предотвращает повторный запуск

    timerInterval = setInterval(() => {
        callSeconds++;
        updateDivs();
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null; // Устанавливаем в null, чтобы можно было запустить заново
    callSeconds = 0;
    updateDivs();
}

function updateDivs() {
    let minutes = Math.floor(callSeconds / 60);
    let remainingSeconds = callSeconds % 60;

    let timeString = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

    divs.forEach(div => {
        div.textContent = timeString;
    });
}
