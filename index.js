
        var startButton = document.getElementById('startButton');
        var endButton = document.getElementById('endButton');

        startButton.addEventListener('click', startStreaming);
        endButton.addEventListener('click', endStreaming);

        var localStream; // To store the local stream
        var peerConnections = []; // To store peer connections

        function startStreaming() {
            alert('Starting streaming...');

            // Get access to the user's camera
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function (stream) {
                    var localVideo = document.getElementById('localVideo');
                    localVideo.srcObject = stream;

                    localStream = stream; // Store the local stream

                    // Start streaming to other users
                    startStreamingToOtherUsers();
                })
                .catch(function (err) {
                    console.error('Error accessing the camera: ', err);
                });
        }

        function startStreamingToOtherUsers() {
            // Connect to signaling server (you need to implement this)
            // Example:
            var signalingChannel = new WebSocket('ws://localhost:8080');

            // Event handler for incoming messages from signaling server
            signalingChannel.onmessage = function (event) {
                var signal = JSON.parse(event.data);
                if (signal.type === 'offer') {
                    // Handle offer
                } else if (signal.type === 'answer') {
                    // Handle answer
                } else if (signal.type === 'candidate') {
                    // Handle ICE candidate
                }
            };

            // Send signaling message
            function sendSignal(signal) {
                signalingChannel.send(JSON.stringify(signal));
            }

            // Example of sending an offer
            function sendOffer(peerConnection) {
                peerConnection.createOffer()
                    .then(function(offer) {
                        return peerConnection.setLocalDescription(offer);
                    })
                    .then(function() {
                        // Send the offer to the other peer
                        sendSignal({ type: 'offer', sdp: peerConnection.localDescription });
                    })
                    .catch(function(err) {
                        console.error('Error creating offer: ', err);
                    });
            }

            // Connect to other users and start streaming
            // For simplicity, let's assume there are four users
            // You may need to adjust this logic based on your actual application
            for (var i = 0; i < 4; i++) {
                var peerConnection = new RTCPeerConnection();

                // Add the user's stream to the peer connection
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

                // Event handler for receiving remote stream
                peerConnection.ontrack = function(event) {
                    var remoteVideo = document.getElementById('remoteVideo' + i);
                    remoteVideo.srcObject = event.streams[0];
                };

                // Save the peer connection
                peerConnections.push(peerConnection);

                // Send offer to the other user
                sendOffer(peerConnection);
            }
        }

        function endStreaming() {
            alert('Ending streaming...');

            // Stop the local stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            // Stop all peer connections
            peerConnections.forEach(function(peerConnection) {
                peerConnection.close();
            });

            // Clear all remote video elements
            for (var i = 1; i <= 3; i++) {
                var remoteVideo = document.getElementById('remoteVideo' + i);
                remoteVideo.srcObject = null;
            }
        }
 