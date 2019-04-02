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

interface SoundObj {
    volume: number;
    number: number;
}

// for analysing the recorded sound
export const calculateSoundObjs = (
    audioContext: AudioContext,
    audioAnalyser: AnalyserNode,
    isDefinite: boolean,
    isWhichRelative: number,
    adjustment: boolean,
    filterVal: number
): SoundObj[] => {
    
    let fsDivN = audioContext.sampleRate / audioAnalyser.fftSize;
    let spectrums = new Uint8Array(audioAnalyser.frequencyBinCount);
    audioAnalyser.getByteFrequencyData(spectrums);

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

    let octaver = (a: number): number[] => {
    
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
    let resolution = maxFreq / audioAnalyser.frequencyBinCount;


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
    if (isDefinite === false && isWhichRelative < 0) {
        for (let i = 0; i < Math.abs(isWhichRelative); i++) {
            scaleVolume.unshift(0);
        }
    } else if (isDefinite === false && isWhichRelative > 0) {
        for (let i = 0; i < isWhichRelative; i++) {
            scaleVolume.shift();
        }
    }

    if (adjustment === true) {
        scaleVolume.unshift(0);
    }

    let soundObjs: SoundObj[] = [];
    let soundObjsForSort: SoundObj[] = [];
    scaleVolume.forEach((each, i) => soundObjs.push({volume: each, number: i}));
    scaleVolume.forEach((each, i) => soundObjsForSort.push({volume: each, number: i}));

    // volume filter
    if (filterVal !== 0) {
        soundObjsForSort.sort((a, b) => b.volume - a.volume);
        let loudests = soundObjsForSort.slice(0, filterVal);
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
};

export const visualizeWaveform = (
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D,
    soundObjs: SoundObj[]
): void => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.beginPath();

    // display audio spectrum in 1/12octave format
    for (let i = 0; i < soundObjs.length; i++) {

        let x = (i / soundObjs.length) * canvas.width;
        let y = (1 - (soundObjs[i].volume) / 255) * canvas.height;
        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }
    }

    canvasContext.stroke();
};

export const visualizeCircular = (
    canvas: HTMLCanvasElement,
    canvasContext2: CanvasRenderingContext2D,
    isSharp: boolean,
    isMono: boolean,
    isGerman: boolean,
    soundObjs: SoundObj[]
): void => {

    // draw the visualization
    canvasContext2.clearRect(0, 0, canvas.width, canvas.height);

    let center = {x: canvas.width / 2, y: canvas.height / 2};
    let radius = canvas.width / 2 - 20;

    // draw each trapezoid
    let drawTrapezoid = (muki: number, r: number, level: number, sound: SoundObj): void => {

        canvasContext2.beginPath();
        canvasContext2.moveTo(center.x + Math.cos(muki - 15 * Math.PI / 180) * r * level / 10, center.y + Math.sin(muki - 15 * Math.PI / 180) * r * level / 10);
        canvasContext2.lineTo(center.x + Math.cos(muki + 15 * Math.PI / 180) * r * level / 10, center.y + Math.sin(muki + 15 * Math.PI / 180) * r * level / 10);
        canvasContext2.lineTo(center.x + Math.cos(muki + 15 * Math.PI / 180) * r * (level - 1) / 10, center.y + Math.sin(muki + 15 * Math.PI / 180) * r * (level - 1) / 10);
        canvasContext2.lineTo(center.x + Math.cos(muki - 15 * Math.PI / 180) * r * (level - 1) / 10, center.y + Math.sin(muki - 15 * Math.PI / 180) * r * (level - 1) / 10);
        canvasContext2.closePath();
        
        // transparency
        canvasContext2.globalAlpha = sound.volume / 255;

        if (isMono === false) {
        // color definite by key
            if (isSharp === true && isGerman === false) {
                switch (sound.number % 12) {

                    case 0:
                        canvasContext2.fillStyle = 'rgb(0, 0, 0)';
                        break;
                    case 1:
                        canvasContext2.fillStyle = 'rgb(0, 50, 80)';
                        break;
                    case 2:
                        canvasContext2.fillStyle = 'rgb(0, 225, 255)';
                        break;
                    case 3:
                        canvasContext2.fillStyle = 'rgb(0, 255, 255)';
                        break;
                    case 4:
                        canvasContext2.fillStyle = 'rgb(255, 0, 225)';
                        break;
                    case 5:
                        canvasContext2.fillStyle = 'rgb(60, 255, 0)';
                        break;
                    case 6:
                        canvasContext2.fillStyle = 'rgb(0, 190, 180)';
                        break;
                    case 7:
                        canvasContext2.fillStyle = 'rgb(255, 140, 0)';
                        break;
                    case 8:
                        canvasContext2.fillStyle = 'rgb(255, 200, 0)';
                        break;
                    case 9:
                        canvasContext2.fillStyle = 'rgb(0, 0, 255)';
                        break;
                    case 10:
                        canvasContext2.fillStyle = 'rgb(0, 70, 255)';
                        break;
                    case 11:
                        canvasContext2.fillStyle = 'rgb(255, 255, 0)';
                        break;
                }
            } else if (isSharp === false && isGerman === false) {
                switch (sound.number % 12) {

                    case 0:
                        canvasContext2.fillStyle = 'rgb(0, 0, 0)';
                        break;
                    case 1:
                        canvasContext2.fillStyle = 'rgb(0, 150, 170)';
                        break;
                    case 2:
                        canvasContext2.fillStyle = 'rgb(0, 225, 255)';
                        break;
                    case 3:
                        canvasContext2.fillStyle = 'rgb(150, 0, 170)';
                        break;
                    case 4:
                        canvasContext2.fillStyle = 'rgb(255, 0, 225)';
                        break;
                    case 5:
                        canvasContext2.fillStyle = 'rgb(60, 255, 0)';
                        break;
                    case 6:
                        canvasContext2.fillStyle = 'rgb(190, 50, 0)';
                        break;
                    case 7:
                        canvasContext2.fillStyle = 'rgb(255, 140, 0)';
                        break;
                    case 8:
                        canvasContext2.fillStyle = 'rgb(10, 0, 130)';
                        break;
                    case 9:
                        canvasContext2.fillStyle = 'rgb(0, 0, 255)';
                        break;
                    case 10:
                        canvasContext2.fillStyle = 'rgb(255, 200, 0)';
                        break;
                    case 11:
                        canvasContext2.fillStyle = 'rgb(255, 255, 0)';
                        break;
                }
            } else if (isSharp === true && isGerman === true) {
                switch (sound.number % 12) {

                    case 0:
                        canvasContext2.fillStyle = 'rgb(114, 47, 55)';
                        break;
                    case 1:
                        canvasContext2.fillStyle = 'rgb(128, 0, 0)';
                        break;
                    case 2:
                        canvasContext2.fillStyle = 'rgb(50, 50, 50)';
                        break;
                    case 3:
                        canvasContext2.fillStyle = 'rgb(58, 57, 39)';
                        break;
                    case 4:
                        canvasContext2.fillStyle = 'rgb(125, 249, 255)';
                        break;
                    case 5:
                        canvasContext2.fillStyle = 'rgb(174, 255, 110)';
                        break;
                    case 6:
                        canvasContext2.fillStyle = 'rgb(204, 255, 2)';
                        break;
                    case 7:
                        canvasContext2.fillStyle = 'rgb(139, 149, 162)';
                        break;
                    case 8:
                        canvasContext2.fillStyle = 'rgb(197, 209, 218)';
                        break;
                    case 9:
                        canvasContext2.fillStyle = 'rgb(43, 98, 244)';
                        break;
                    case 10:
                        canvasContext2.fillStyle = 'rgb(85, 85, 255)';
                        break;
                    case 11:
                        canvasContext2.fillStyle = 'rgb(165, 251, 213)';
                        break;
                }
            } else if (isSharp === false && isGerman === true) {
                switch (sound.number % 12) {

                    case 0:
                        canvasContext2.fillStyle = 'rgb(114, 47, 55)';
                        break;
                    case 1:
                        canvasContext2.fillStyle = 'rgb(20, 20, 20)';
                        break;
                    case 2:
                        canvasContext2.fillStyle = 'rgb(50, 50, 50)';
                        break;
                    case 3:
                        canvasContext2.fillStyle = 'rgb(135, 205, 273)';
                        break;
                    case 4:
                        canvasContext2.fillStyle = 'rgb(125, 249, 255)';
                        break;
                    case 5:
                        canvasContext2.fillStyle = 'rgb(174, 255, 110)';
                        break;
                    case 6:
                        canvasContext2.fillStyle = 'rgb(131, 132, 146)';
                        break;
                    case 7:
                        canvasContext2.fillStyle = 'rgb(139, 149, 162)';
                        break;
                    case 8:
                        canvasContext2.fillStyle = 'rgb(0, 114, 187)';
                        break;
                    case 9:
                        canvasContext2.fillStyle = 'rgb(43, 98, 244)';
                        break;
                    case 10:
                        canvasContext2.fillStyle = 'rgb(229, 237, 241)';
                        break;
                    case 11:
                        canvasContext2.fillStyle = 'rgb(165, 251, 213)';
                        break;
                }
            }
        } else {
            // black and white
            canvasContext2.fillStyle = 'rgb(0, 0, 0)';
        }
        
        
        canvasContext2.fill();
    };

    // I failed making below into a function lol
    drawTrapezoid(-90 * Math.PI / 180, radius, 1, soundObjs[0]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 1, soundObjs[1]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 1, soundObjs[2]);
    drawTrapezoid(0, radius, 1, soundObjs[3]);
    drawTrapezoid(30 * Math.PI / 180, radius, 1, soundObjs[4]);
    drawTrapezoid(60 * Math.PI / 180, radius, 1, soundObjs[5]);
    drawTrapezoid(90 * Math.PI / 180, radius, 1, soundObjs[6]);
    drawTrapezoid(120 * Math.PI / 180, radius, 1, soundObjs[7]);
    drawTrapezoid(150 * Math.PI / 180, radius, 1, soundObjs[8]);
    drawTrapezoid(180 * Math.PI / 180, radius, 1, soundObjs[9]);
    drawTrapezoid(210 * Math.PI / 180, radius, 1, soundObjs[10]);
    drawTrapezoid(240 * Math.PI / 180, radius, 1, soundObjs[11]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 2, soundObjs[12]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 2, soundObjs[13]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 2, soundObjs[14]);
    drawTrapezoid(0, radius, 2, soundObjs[15]);
    drawTrapezoid(30 * Math.PI / 180, radius, 2, soundObjs[16]);
    drawTrapezoid(60 * Math.PI / 180, radius, 2, soundObjs[17]);
    drawTrapezoid(90 * Math.PI / 180, radius, 2, soundObjs[18]);
    drawTrapezoid(120 * Math.PI / 180, radius, 2, soundObjs[19]);
    drawTrapezoid(150 * Math.PI / 180, radius, 2, soundObjs[20]);
    drawTrapezoid(180 * Math.PI / 180, radius, 2, soundObjs[21]);
    drawTrapezoid(210 * Math.PI / 180, radius, 2, soundObjs[22]);
    drawTrapezoid(240 * Math.PI / 180, radius, 2, soundObjs[23]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 3, soundObjs[24]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 3, soundObjs[25]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 3, soundObjs[26]);
    drawTrapezoid(0, radius, 3, soundObjs[27]);
    drawTrapezoid(30 * Math.PI / 180, radius, 3, soundObjs[28]);
    drawTrapezoid(60 * Math.PI / 180, radius, 3, soundObjs[29]);
    drawTrapezoid(90 * Math.PI / 180, radius, 3, soundObjs[30]);
    drawTrapezoid(120 * Math.PI / 180, radius, 3, soundObjs[31]);
    drawTrapezoid(150 * Math.PI / 180, radius, 3, soundObjs[32]);
    drawTrapezoid(180 * Math.PI / 180, radius, 3, soundObjs[33]);
    drawTrapezoid(210 * Math.PI / 180, radius, 3, soundObjs[34]);
    drawTrapezoid(240 * Math.PI / 180, radius, 3, soundObjs[35]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 4, soundObjs[36]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 4, soundObjs[37]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 4, soundObjs[38]);
    drawTrapezoid(0, radius, 4, soundObjs[39]);
    drawTrapezoid(30 * Math.PI / 180, radius, 4, soundObjs[40]);
    drawTrapezoid(60 * Math.PI / 180, radius, 4, soundObjs[41]);
    drawTrapezoid(90 * Math.PI / 180, radius, 4, soundObjs[42]);
    drawTrapezoid(120 * Math.PI / 180, radius, 4, soundObjs[43]);
    drawTrapezoid(150 * Math.PI / 180, radius, 4, soundObjs[44]);
    drawTrapezoid(180 * Math.PI / 180, radius, 4, soundObjs[45]);
    drawTrapezoid(210 * Math.PI / 180, radius, 4, soundObjs[46]);
    drawTrapezoid(240 * Math.PI / 180, radius, 4, soundObjs[47]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 5, soundObjs[48]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 5, soundObjs[49]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 5, soundObjs[50]);
    drawTrapezoid(0, radius, 5, soundObjs[51]);
    drawTrapezoid(30 * Math.PI / 180, radius, 5, soundObjs[52]);
    drawTrapezoid(60 * Math.PI / 180, radius, 5, soundObjs[53]);
    drawTrapezoid(90 * Math.PI / 180, radius, 5, soundObjs[54]);
    drawTrapezoid(120 * Math.PI / 180, radius, 5, soundObjs[55]);
    drawTrapezoid(150 * Math.PI / 180, radius, 5, soundObjs[56]);
    drawTrapezoid(180 * Math.PI / 180, radius, 5, soundObjs[57]);
    drawTrapezoid(210 * Math.PI / 180, radius, 5, soundObjs[58]);
    drawTrapezoid(240 * Math.PI / 180, radius, 5, soundObjs[59]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 6, soundObjs[60]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 6, soundObjs[61]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 6, soundObjs[62]);
    drawTrapezoid(0, radius, 6, soundObjs[63]);
    drawTrapezoid(30 * Math.PI / 180, radius, 6, soundObjs[64]);
    drawTrapezoid(60 * Math.PI / 180, radius, 6, soundObjs[65]);
    drawTrapezoid(90 * Math.PI / 180, radius, 6, soundObjs[66]);
    drawTrapezoid(120 * Math.PI / 180, radius, 6, soundObjs[67]);
    drawTrapezoid(150 * Math.PI / 180, radius, 6, soundObjs[68]);
    drawTrapezoid(180 * Math.PI / 180, radius, 6, soundObjs[69]);
    drawTrapezoid(210 * Math.PI / 180, radius, 6, soundObjs[70]);
    drawTrapezoid(240 * Math.PI / 180, radius, 6, soundObjs[71]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 7, soundObjs[72]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 7, soundObjs[73]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 7, soundObjs[74]);
    drawTrapezoid(0, radius, 7, soundObjs[75]);
    drawTrapezoid(30 * Math.PI / 180, radius, 7, soundObjs[76]);
    drawTrapezoid(60 * Math.PI / 180, radius, 7, soundObjs[77]);
    drawTrapezoid(90 * Math.PI / 180, radius, 7, soundObjs[78]);
    drawTrapezoid(120 * Math.PI / 180, radius, 7, soundObjs[79]);
    drawTrapezoid(150 * Math.PI / 180, radius, 7, soundObjs[80]);
    drawTrapezoid(180 * Math.PI / 180, radius, 7, soundObjs[81]);
    drawTrapezoid(210 * Math.PI / 180, radius, 7, soundObjs[82]);
    drawTrapezoid(240 * Math.PI / 180, radius, 7, soundObjs[83]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 8, soundObjs[84]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 8, soundObjs[85]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 8, soundObjs[86]);
    drawTrapezoid(0, radius, 8, soundObjs[87]);
    drawTrapezoid(30 * Math.PI / 180, radius, 8, soundObjs[88]);
    drawTrapezoid(60 * Math.PI / 180, radius, 8, soundObjs[89]);
    drawTrapezoid(90 * Math.PI / 180, radius, 8, soundObjs[90]);
    drawTrapezoid(120 * Math.PI / 180, radius, 8, soundObjs[91]);
    drawTrapezoid(150 * Math.PI / 180, radius, 8, soundObjs[92]);
    drawTrapezoid(180 * Math.PI / 180, radius, 8, soundObjs[93]);
    drawTrapezoid(210 * Math.PI / 180, radius, 8, soundObjs[94]);
    drawTrapezoid(240 * Math.PI / 180, radius, 8, soundObjs[95]);


    drawTrapezoid(-90 * Math.PI / 180, radius, 9, soundObjs[96]);
    drawTrapezoid(-60 * Math.PI / 180, radius, 9, soundObjs[97]);
    drawTrapezoid(-30 * Math.PI / 180, radius, 9, soundObjs[98]);
    drawTrapezoid(0, radius, 9, soundObjs[99]);
    drawTrapezoid(30 * Math.PI / 180, radius, 9, soundObjs[100]);
    drawTrapezoid(60 * Math.PI / 180, radius, 9, soundObjs[101]);
    drawTrapezoid(90 * Math.PI / 180, radius, 9, soundObjs[102]);
    drawTrapezoid(120 * Math.PI / 180, radius, 9, soundObjs[103]);
    drawTrapezoid(150 * Math.PI / 180, radius, 9, soundObjs[104]);
    drawTrapezoid(180 * Math.PI / 180, radius, 9, soundObjs[105]);
    drawTrapezoid(210 * Math.PI / 180, radius, 9, soundObjs[106]);
    drawTrapezoid(240 * Math.PI / 180, radius, 9, soundObjs[107]);

    //canvasContext.stroke();

};
