document.addEventListener("DOMContentLoaded", (event) => {
    liveConnectSocket();
});




let livelocalVideo = document.querySelector('.camera-video');
let liveremoteVideo = document.querySelector('#liveremoteVideo');

let liveotherUser = livename;
let liveRemoteRTCMessage;

let liveIceCandidatesFromCaller = [];
let livepeerConnection;
let liveRemoteStream;

let liveCallInProgress = false;

//event from html
function livecall(type) {
    let userToLive = livename;
    liveotherUser = livename;

    liveBeReady()
        .then(bool => {
            processCall(userToLive)
        })
}

//event from html
function answer() {
    liveBeReady()
        .then(bool => {
            processAccept();
        })
}

let livePcConfig = {
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
let liveSdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

/////////////////////////////////////////////

let lSocket;
let liveSocket;
function liveConnectSocket() {
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    console.log(ws_scheme);

    liveSocket = new WebSocket(
        ws_scheme
        + window.location.host
        + '/ws/live/' + livename + '/'
    );

    liveSocket.onopen = (e) =>{console.warn('ws con live')}
    liveSocket.onclose = (e) =>{console.warn('ws close live')}
    liveSocket.onerror = (e) =>{console.warn('ws error live')}

}

/**
 * 
 * @param {Object} data 
 * @param {number} data.name - the name of the user to call
 * @param {Object} data.rtcMessage - the rtc create offer object
 */
function sendCall(data) {
    liveSocket.send(JSON.stringify({
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
    //to answer a call
    // lSocket.emit("answerCall", data);
    liveSocket.send(JSON.stringify({
        type: 'answer_call',
        data
    }));
    liveCallInProgress = true;
}

/**
 * 
 * @param {Object} data 
 * @param {number} data.user - the other user //either callee or caller 
 * @param {Object} data.rtcMessage - iceCandidate data 
 */
function sendICEcandidate(data) {
    //send only if we have caller, else no need to
    console.log("Send ICE candidate");
    // lSocket.emit("ICEcandidate", data)
    console.warn(data)
    liveSocket.send(JSON.stringify({
        type: 'ICEcandidate',
        data
    }));

}

function liveBeReady() {
    livelocalVideo.srcObject = liveStream;
    return createConnectionAndAddStream()
}

function createConnectionAndAddStream() {
    createPeerConnection();
    console.warn(liveStream)
    livepeerConnection.addStream(liveStream);
    return true;
}

function processCall() {
    livepeerConnection.createOffer((sessionDescription) => {
    livepeerConnection.setLocalDescription(sessionDescription);
    }, (error) => {
        console.log("Error");
    });
}

function processAccept() {

    livepeerConnection.setRemoteDescription(new RTCSessionDescription(liveRemoteRTCMessage));
    livepeerConnection.createAnswer((sessionDescription) => {
        livepeerConnection.setLocalDescription(sessionDescription);

        if (liveIceCandidatesFromCaller.length > 0) {
            //I am having issues with call not being processed in real world (internet, not local)
            //so I will push iceCandidates I received after the call arrived, push it and, once we accept
            //add it as ice candidate
            //if the offer rtc message contains all thes ICE candidates we can ingore this.
            for (let i = 0; i < liveIceCandidatesFromCaller.length; i++) {
                //
                let candidate = liveIceCandidatesFromCaller[i];
                console.log("ICE candidate Added From queue");
                try {
                    livepeerConnection.addIceCandidate(candidate).then(done => {
                        console.log(done);
                    }).catch(error => {
                        console.log(error);
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            liveIceCandidatesFromCaller = [];
            console.log("ICE candidate queue cleared");
        } else {
            console.log("NO Ice candidate in queue");
        }
        
        callAuthor = liveotherUser;
        answerCall({
            caller: liveotherUser,
            rtcMessage: sessionDescription
        })

    }, (error) => {
        console.log("Error");
    })
}

/////////////////////////////////////////////////////////

function createPeerConnection() {
    try {
        livepeerConnection = new RTCPeerConnection(livePcConfig);
        // livepeerConnection = new RTCPeerConnection();
        livepeerConnection.onicecandidate = handleIceCandidate;
        livepeerConnection.onaddstream = handleRemoteStreamAdded;
        livepeerConnection.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
        return;
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function handleIceCandidate(event) {
    // console.log('icecandidate event: ', event);
    if (event.candidate) {
        console.log("Local ICE candidate");
        console.warn(liveotherUser)
        sendICEcandidate({
            user: liveotherUser,
            rtcMessage: {
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            }
        })

    } else {
        console.log('End of candidates.');
    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    liveRemoteStream = event.stream;
    liveremoteVideo.srcObject = liveRemoteStream;
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
    liveremoteVideo.srcObject = null;
    livelocalVideo.srcObject = null;
}