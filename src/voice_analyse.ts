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

// cross-browser definition
// @ts-ignore
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// @ts-ignore
AudioContext = window.AudioContext // Default
// @ts-ignore
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false;

export interface SoundObj {
    volume: number;
    number: number;
}

export interface Visualizer {
    visualize: (soundObjs: SoundObj[]) => void;
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

    visualizers: Visualizer[] = [];

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

    addVisualizer(visualizer: Visualizer) {
        this.visualizers.push(visualizer);
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
        const soundObjs = this.calculateSoundObjs();
        this.visualizers.forEach(each => each.visualize(soundObjs));
    }

    calculateSoundObjs() {
        let fsDivN = this.audioContext!.sampleRate / this.audioAnalyser!.fftSize;
        let spectrums = new Uint8Array(this.audioAnalyser!.frequencyBinCount);
        this.audioAnalyser!.getByteFrequencyData(spectrums);

        // convert spectrum's format from Hz to 1/12 octave

        let A4 = 440;

        /*
        class Octave{

            constructor(a){
                this.b      = a *  Math.pow(2, 2/12);
                this.aSharp = a *  Math.pow(2, 1/12);
                this.a = a;
                this.gSharp = a *  Math.pow(2, -1/12);
                this.g      = a *  Math.pow(2, -2/12);
                this.fSharp = a *  Math.pow(2, -3/12);
                this.f      = a *  Math.pow(2, -4/12);
                this.e      = a *  Math.pow(2, -5/12);
                this.dSharp = a *  Math.pow(2, -6/12);
                this.d      = a *  Math.pow(2, -7/12);
                this.cSharp = a *  Math.pow(2, -8/12);
                this.c      = a *  Math.pow(2, -9/12);
            }
        }
        */

        let octaver = (a: number) => {

            let result = [];
            result.push(a *  Math.pow(2, -9/12));
            result.push(a *  Math.pow(2, -8/12));
            result.push(a *  Math.pow(2, -7/12));
            result.push(a *  Math.pow(2, -6/12));
            result.push(a *  Math.pow(2, -5/12));
            result.push(a *  Math.pow(2, -4/12));
            result.push(a *  Math.pow(2, -3/12));
            result.push(a *  Math.pow(2, -2/12));
            result.push(a *  Math.pow(2, -1/12));
            result.push(a);
            result.push(a *  Math.pow(2, 1/12));
            result.push(a *  Math.pow(2, 2/12));

            return result;
        };

        let scale = [];

        for(let i = -4; i < 7; i++){
            let a = A4 * Math.pow(2, i);
            scale.push(octaver(a));
        }

        scale = scale.flat();
        scale.unshift(0);
        // scale became 1-based for the convenience below

        let scaleVolume = [];

        let maxFreq = 22050;
        let resolution = maxFreq / this.audioAnalyser!.frequencyBinCount;


        for (let i = 0, j = 0; i < spectrums.length; j++) {

            for (; i < spectrums.length; i++) {
                if ((i+1) * resolution >= (scale[j] + scale[j+1])/2) {
                    break;
                }
            }
            for (; (i+1) * resolution <= (scale[j+1] + scale[j+2])/2; i++) {
                if (scaleVolume.length < j+1) {
                    scaleVolume.push(spectrums[i]);
                } else {
                    if (scaleVolume[j] < spectrums[i]) {
                        scaleVolume[j] = spectrums[i];
                    }
                }
            }

        }


        // applying ralative key transpose and casing scaleVolume into soundObjs
        if (this.isDefinite === false && this.isWhichRelative < 0) {
            for (let i = 0; i < Math.abs(this.isWhichRelative); i++) {
                scaleVolume.unshift(0);
            }
        } else if (this.isDefinite === false && this.isWhichRelative > 0) {
            for (let i = 0; i < this.isWhichRelative; i++) {
                scaleVolume.shift();
            }
        }

        if (this.adjustment === true) {
            scaleVolume.unshift(0);
        }

        let soundObjs: SoundObj[] = [];
        let soundObjsForSort: SoundObj[] = [];
        scaleVolume.forEach((each, i) => soundObjs.push({volume: each, number: i}));
        scaleVolume.forEach((each, i) => soundObjsForSort.push({volume: each, number: i}));

        // volume filter
        if (this.filterVal !== 0) {
            soundObjsForSort.sort((a, b) => b.volume - a.volume);
            let loudests = soundObjsForSort.slice(0, this.filterVal);
            for (let i = 0; i < soundObjs.length; i++) {
                let flag = false;
                for (let j = 0; j < loudests.length; j++) {
                    if (soundObjs[i].number === loudests[j].number) {
                        flag = true;
                    }
                }
                if (flag === false) {
                    soundObjs[i].volume = soundObjs[i].volume * 0.2;
                }
            }
        }

        return soundObjs;
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
