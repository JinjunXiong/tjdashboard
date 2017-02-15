var server = require("./server");
var tjbot = require('tjbot');
var config = require('./config');
var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var request = require("request");
var fs = require('fs');

// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
var VOICE = config.voice;
var WORKSPACEID = config.conversationWorkspaceId;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['microphone', 'speaker', 'led', 'servo'];

// Set up configuration paramters
var tjConfig = {
    verboseLogging: true, //enable console debugging
    servoPin: 7 // set servo pin
};

// instantiate our TJBot!
var tj = new tjbot(hardware, tjConfig, credentials);
tj.shine("magenta")

tj.listen(function(msg) {
    logSpeak("you", msg);
    // send to the conversation service
    tj.converse(WORKSPACEID, msg, function(response, responseText) {
        // speak the result
        if (response.output.text.length > 0) {
            //console.log(response)
            conversation_response = response.output.text[0];
            if (conversation_response != undefined) {
                var matchedIntent = response.intents[0].intent; // intent with the highest confidence
                var intentconfidence = response.intents[0].confidence;
                console.log("> intents : ", response.intents);

                if (intentconfidence > 0.5) {
                    tj.shine("green");
                    if (matchedIntent == "dance") {
                        logSpeak("TJBot", conversation_response);
                        tj.speakAsync(conversation_response).then(function() {
                            dance("club.wav")
                        });
                        //dance();
                    } else if (matchedIntent == "wave") {
                        logSpeak("TJBot", conversation_response);
                        tj.speakAsync(conversation_response).then(function() {
                            // wave
                            tj.wave();
                            tj.wave();
                            tj.shine("white");
                        })
                    } else if (matchedIntent == "see") {
                        logSpeak("TJBot", conversation_response);
                        tj.speakAsync(conversation_response).then(function() {
                            tj.captureImage().then(function(filePath) {
                                tj.callVisualRecognition().then(function(response) {
                                    logVision("tjbot", response)
                                    console.log(" ... response .. ", response.description)
                                    if (response.description != null) {
                                        logSpeak("TJBot", response.description);
                                        tj.speakAsync(response.description).then(function() {
                                            tj.shine("white");
                                        })
                                    }
                                });
                            })

                        });
                    } else if (matchedIntent == "off_topic") {
                        // do nothing
                    } else {
                        logSpeak("TJBot", conversation_response);
                        tj.speakAsync(conversation_response).then(function() {
                            tj.shine("white");
                        });
                    }

                } else {
                    tj.shine("red");
                    setTimeout(function() {
                        tj.shine("white");
                    }, 800);
                }

            } else {
                tj.shine("red");
                console.log("The response (output) text from your conversation is empty. Please check your conversation flow \n" + JSON.stringify(response))
            }
        } else {
            console.error("The conversation service did not return any response text.");
        }
        //console.log("conversation response", response)
    });

});


/**
 * [dance play a soundFile and dance to its beats]
 * @param  {[type]} soundFile [soundfile to be decoded and danced to]
 * @return {[type]}           [description]
 */
function dance(soundFile) {
    // Decode the sound file to get its digital signal data
    var audioContext = new AudioContext
    fs.readFile(soundFile, function(err, buf) {
        if (err) throw err
        audioContext.decodeAudioData(buf, function(audioBuffer) {
            console.log("> finished decoding sound file ", soundFile);
            findPeaks(audioBuffer.getChannelData(0), audioBuffer.sampleRate, soundFile);
        }, function(err) {
            throw err
        })
    })

}

/**
 * [_findPeaks find peaks or high energy positions in audioBuffer data and move arm based on that to simulate dance.]
 * @param  {[type]} audioBuffer [decoded audio data]
 * @param  {[type]} sampleRate  [audio sample rate]
 * @return {[type]}             [description]
 */
function findPeaks(audioBuffer, sampleRate, soundFile) {
    var interval = 0.05 * 1000;
    var index = 0;
    var step = Math.round(sampleRate * (interval / 1000));
    var max = 0;
    var prevmax = 0;
    var prevdiffthreshold = 0.3;

    var sampleSound = setInterval(function() {
        if (index >= audioBuffer.length) {
            clearInterval(sampleSound);
            tj.shine("white");
            return;
        }
        for (var i = index; i < index + step; i++) {
            max = audioBuffer[i] > max ? audioBuffer[i].toFixed(1) : max;
        }
        // Spot a significant increase or peak? Wave Arm
        if (max - prevmax >= prevdiffthreshold) {
            // do some funky waving.
            var delay = 300;
            tj.raiseArm();
            setTimeout(function() {
                tj.lowerArm();
            }, delay);
        }
        prevmax = max;
        max = 0;
        index += step;
    }, interval);
    tj.playSound(soundFile);
}

function logVision(sender, message, response) {
    var message = {
        type: "vision",
        title: "What TJBot Sees",
        sender: sender,
        transcript: response.description,
        description: "",
        imageurl: "img/screen.jpg",
        timestamp: Date.now(),
        tags: [{
            title: "visual recognition",
            url: "#"
        }, {
            title: "camera",
            url: "#"
        }],
        visiontags: [{
            title: "visual recognition",
            url: "#"
        }, {
            title: "camera",
            url: "#"
        }],
        confidence: 1
    }
    console.log(message)
    dashboard.sendEvent(message)
}

function logSpeak(sender, message) {

    var message = {
        type: "speech",
        sender: sender,
        title: sender == "you" ? "What TJBot thinks you said" : "WHat TJBot says",
        transcript: message,
        description: "",
        timestamp: Date.now(),
        tags: [{
            title: "speech to text",
            url: "#"
        }, {
            title: "text to speech",
            url: "#"
        }, {
            title: "microphone",
            url: "#"
        }, {
            title: "speaker",
            url: "#"
        }],
        confidence: 1
    }
    console.log(message)
    dashboard.sendEvent(message)
}
