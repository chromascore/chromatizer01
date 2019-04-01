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

class VoiceAnalyzer {

    // variable definition
    audioDeviceId = '';

    localMediaStream: MediaStream | null = null;
    localScriptProcessor: ScriptProcessorNode | null = null;
    audioContext: AudioContext | null = null;
    bufferSize = 1024;
    audioData: Float32Array[] = []; // recorded audio data
    recordingFlg = false;

    // relative or definite do re mi
    isDefinite = true;
    isWhichRelative = 0;

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

    // some device needs adjustment
    adjustment = false;

    // filter values
    filterVal = 0;

    // analysis of recorded audio
    audioAnalyser: AnalyserNode | null = null;

    toDefinite() {
        this.isDefinite = true;
    }

    toRelative(relative: number) {
        this.isDefinite = false;
        this.isWhichRelative = relative;
    }

    adjust() {
        this.adjustment = !this.adjustment;
    }

    toFilter0() {
        this.filterVal = 0;
    }

    toFilter1() {
        this.filterVal = 1;
    }

    toFilter5() {
        this.filterVal = 5;
    }

    onAudioProcess(e: AudioProcessingEvent) {
        if (!this.recordingFlg) return;

        // making sound buffer
        const input = e.inputBuffer.getChannelData(0);
        const bufferData = new Float32Array(this.bufferSize);
        for (let i = 0; i < this.bufferSize; i++) {
            bufferData[i] = input[i];
        }
        this.audioData.push(bufferData);

        // analyse the sound shape
        this.analyseVoice();
    }

    analyseVoice() {
        const soundObjs = calculateSoundObjs(this.audioContext!, this.audioAnalyser!, this.isDefinite, this.isWhichRelative, this.adjustment, this.filterVal);
        visualizeWaveform(canvas, canvasContext!, soundObjs);
        visualizeCircular(canvas2, canvasContext2!, isSharp, isMono, isGerman, soundObjs);
    }

    startRecording() {
        this.audioContext = new AudioContext();

        this.recordingFlg = true;

        navigator.mediaDevices
            .enumerateDevices()
            .then(deviceInfos => this.gotDevices(deviceInfos))
            .then(() => this.getStream())
            .catch((error) => this.handleError(error));
    }

    gotDevices(deviceInfos: MediaDeviceInfo[]) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'audioinput') {
                this.audioDeviceId = deviceInfo.deviceId;
                break;
            }
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

    getStream() {
        /*
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        */

        var constraints = {
            audio: {
                deviceId: { exact: this.audioDeviceId }
            }
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => this.gotStream(stream))
            .catch(error => this.handleError(error));
    }

    gotStream(stream: MediaStream) {

        // for recording
        this.localMediaStream = stream;
        var scriptProcessor = this.audioContext!.createScriptProcessor(this.bufferSize, 1, 1);
        this.localScriptProcessor = scriptProcessor;
        var mediastreamsource = this.audioContext!.createMediaStreamSource(stream);
        mediastreamsource.connect(scriptProcessor);
        scriptProcessor.onaudioprocess = e => this.onAudioProcess(e);
        scriptProcessor.connect(this.audioContext!.destination);

        // for analysing the data
        this.audioAnalyser = this.audioContext!.createAnalyser();
        this.audioAnalyser.fftSize = 2048 * 4;

        /// i don't know where below is used??
        var frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        var timeDomainData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        mediastreamsource.connect(this.audioAnalyser);
    }

    handleError(error: any) {
        console.log('Error: ', error);
    }

    // quit recording
    endRecording() {
        this.recordingFlg = false;

        // u may send audioData to the server or something
    }
}

export default VoiceAnalyzer;
