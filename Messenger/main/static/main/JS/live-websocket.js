if (window.location.protocol == 'https:') {
    var wsStart = 'wss://';
} else {
    var wsStart = 'ws://';
};

var wsEndPoint = wsStart + window.location.host + '/ws/live/' + myUsername + '/';

var callVideo = document.querySelector('#localVideo');


const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const websocket = new WebSocket('wsEndPoint');

let localStream;
let peerConnection;

const config = {
    'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;

    websocket.onopen = () => {
        peerConnection = new RTCPeerConnection(config);
        
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                websocket.send(JSON.stringify({
                    'type': 'candidate',
                    'candidate': event.candidate
                }));
            }
        };

        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer);
            websocket.send(JSON.stringify({
                'type': 'offer',
                'offer': offer
            }));
        });
    };

    websocket.onmessage = message => {
        const data = JSON.parse(message.data);

        if (data.type === 'offer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            peerConnection.createAnswer().then(answer => {
                peerConnection.setLocalDescription(answer);
                websocket.send(JSON.stringify({
                    'type': 'answer',
                    'answer': answer
                }));
            });
        } else if (data.type === 'answer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };
}).catch(error => {
    console.error('Error accessing media devices.', error);
});