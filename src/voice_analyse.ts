/*
Author: https://twitter.com/chromascore

This code used below: 
    https://qiita.com/mhagita/items/6c7d73932d9a207eb94d
    https://simpl.info/getusermedia/sources/

It seems like I should set the license when
I make something using other people's works,
so I put this below:

Copyright

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { calculateSoundObjs, visualizeWaveform, visualizeCircular } from './visualizer';

// cross-browser definition
// @ts-ignore
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// @ts-ignore
AudioContext = window.AudioContext // Default
// @ts-ignore
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false; 

// variable definition
//let audioSelect = document.querySelector('select#audioSource');
let audioSelect = '';

let localMediaStream = null;
let localScriptProcessor = null;
let audioContext: AudioContext | null = null;
let bufferSize = 1024;
let audioData = []; // recorded audio data
let recordingFlg = false;

// canvas
let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let canvasContext = canvas.getContext('2d');

let canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
let canvasContext2 = canvas2.getContext('2d');

// color definite by key
let isSharp = true;
let isGerman = false;

export const toSharp = () => {
    isSharp = true;
    isMono = false;
    isGerman = false;
}
export const toFlat = () => {
    isSharp = false;
    isMono = false;
    isGerman = false;
}

export const toGermanSharp = () => {
    isSharp = true;
    isGerman =true;
}

export const toGermanFlat = () => {
    isSharp = false;
    isGerman =true;
}

// black white
let isMono = false;

export const toMono = () => {
    isMono = true;
    isGerman = false;
}

// relative or definite do re mi
let isDefinite = true;
let isWhichRelative = 0;

/*
class keys {
    
    CFlat: -1,
    GFlat: -6,
    DFlat: 1,
    AFlat: -4,
    EFlat: 3,
    BFlat: -2,
    F: 5,
    
    C: 0,

    G: -5,
    D: 2,
    A: -3,
    E: 4,
    B: -1,
    FSharp: 6,
    CSharp: 1
}
*/

export const toDefinite = () => {
    isDefinite = true;
}

export const toRelative = (relative: number) => {
    isDefinite = false;
    isWhichRelative = relative;
}

// some device needs adjustment
let adjustment = false;
export const adjust = () => {
    if (adjustment == false) {
        adjustment = true;
    } else {
        adjustment = false;
    }
}

// filter values
let filterVal = 0;

export const toFilter0 = () => {
    filterVal = 0;
}
export const toFilter1 = () => {
    filterVal = 1;
}
export const toFilter5 = () => {
    filterVal = 5;
}

// analysis of recorded audio
let audioAnalyser: AnalyserNode | null = null;


// making a recording buffer (while recording, repeatedly called)
let onAudioProcess = (e: AudioProcessingEvent) => {
    if (!recordingFlg) return;

    // making sound buffer
    let input = e.inputBuffer.getChannelData(0);
    let bufferData = new Float32Array(bufferSize);
    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = input[i];
    }
    audioData.push(bufferData);

    // analyse the sound shape
    analyseVoice();
}

// for analysing the recorded sound
let analyseVoice = () => {
    const soundObjs = calculateSoundObjs(audioContext!, audioAnalyser!, isDefinite, isWhichRelative, adjustment, filterVal);
    visualizeWaveform(canvas, canvasContext!, soundObjs);
    visualizeCircular(canvas2, canvasContext2!, isSharp, isMono, isGerman, soundObjs);
}


// start analysing
export const startRecording = () => {

    audioContext = new AudioContext();
    
    recordingFlg = true;

    navigator.mediaDevices.enumerateDevices().then(gotDevices).then(getStream).catch(handleError);

    function gotDevices(deviceInfos: MediaDeviceInfo[]) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            audioSelect = deviceInfo.deviceId;
            break;
            /*
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
                audioSelect.appendChild(option);
            } else {
                console.log('Found one other kind of source/device: ', deviceInfo);
            }
            */
        }
    }

    function getStream() {
        /*
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        */
      
        var constraints = {
            audio: {
                deviceId: {exact: audioSelect}
            }
        };
      
        navigator.mediaDevices.getUserMedia(constraints).
            then(gotStream).catch(handleError);
    }

    function gotStream(stream: MediaStream) {
     
        // for recording
        localMediaStream = stream;
        var scriptProcessor = audioContext!.createScriptProcessor(bufferSize, 1, 1);
        localScriptProcessor = scriptProcessor;
        var mediastreamsource = audioContext!.createMediaStreamSource(stream);
        mediastreamsource.connect(scriptProcessor);
        scriptProcessor.onaudioprocess = onAudioProcess;
        scriptProcessor.connect(audioContext!.destination);

        // for analysing the data
        audioAnalyser = audioContext!.createAnalyser();
        audioAnalyser.fftSize = 2048 * 4;
        
        /// i don't know where below is used??
        var frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
        var timeDomainData = new Uint8Array(audioAnalyser.frequencyBinCount);
        mediastreamsource.connect(audioAnalyser);
    }

    function handleError(error: any) {
        console.log('Error: ', error);
    }

    // below did not work for iphone
    /*
    audioContext = new AudioContext();
    
    recordingFlg = true;
    navigator.mediaDevices.getUserMedia({audio: true}).then(
        
        function(stream) {
        // for recording
        localMediaStream = stream;
        var scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        localScriptProcessor = scriptProcessor;
        var mediastreamsource = audioContext.createMediaStreamSource(stream);
        mediastreamsource.connect(scriptProcessor);
        scriptProcessor.onaudioprocess = onAudioProcess;
        scriptProcessor.connect(audioContext.destination);

        // for sound analysis
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 2048 * 8;
        ///where is below used?
        frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
        timeDomainData = new Uint8Array(audioAnalyser.frequencyBinCount);
        mediastreamsource.connect(audioAnalyser);
        }
    ).catch(
        function(e) {
            console.log(e);
        }
    );
    */
}

// quit recording
export const endRecording = function() {
    recordingFlg = false;

    // u may send audioData to the server or something
}
