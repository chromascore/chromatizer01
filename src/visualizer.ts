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

import { SoundObj, Visualizer } from './voice_analyse';

export class WaveformVisualizer implements Visualizer {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d')!;
    }

    visualize(soundObjs: SoundObj[]) {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvasContext.beginPath();

        // display audio spectrum in 1/12octave format
        for (let i = 0; i < soundObjs.length; i++) {

            let x = (i / soundObjs.length) * this.canvas.width;
            let y = (1 - (soundObjs[i].volume) / 255) * this.canvas.height;
            if (i === 0) {
                this.canvasContext.moveTo(x, y);
            } else {
                this.canvasContext.lineTo(x, y);
            }
        }

        this.canvasContext.stroke();
    }
}

export class CircularVisualizer implements Visualizer {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    // color definite by key
    isSharp = true;
    isGerman = false;

    // black white
    isMono = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d')!;
    }

    toSharp() {
        this.isSharp = true;
        this.isMono = false;
        this.isGerman = false;
    }

    toFlat() {
        this.isSharp = false;
        this.isMono = false;
        this.isGerman = false;
    }

    toGermanSharp() {
        this.isSharp = true;
        this.isGerman =true;
    }

    toGermanFlat() {
        this.isSharp = false;
        this.isGerman =true;
    }

    toMono() {
        this.isMono = true;
        this.isGerman = false;
    }

    // draw each trapezoid
    drawTrapezoid(muki: number, r: number, level: number, sound: SoundObj) {
        const center = {x: this.canvas.width / 2, y: this.canvas.height / 2};

        this.canvasContext.beginPath();
        this.canvasContext.moveTo(center.x + Math.cos(muki - 15 * Math.PI / 180) * r * level / 10, center.y + Math.sin(muki - 15 * Math.PI / 180) * r * level / 10);
        this.canvasContext.lineTo(center.x + Math.cos(muki + 15 * Math.PI / 180) * r * level / 10, center.y + Math.sin(muki + 15 * Math.PI / 180) * r * level / 10);
        this.canvasContext.lineTo(center.x + Math.cos(muki + 15 * Math.PI / 180) * r * (level - 1) / 10, center.y + Math.sin(muki + 15 * Math.PI / 180) * r * (level - 1) / 10);
        this.canvasContext.lineTo(center.x + Math.cos(muki - 15 * Math.PI / 180) * r * (level - 1) / 10, center.y + Math.sin(muki - 15 * Math.PI / 180) * r * (level - 1) / 10);
        this.canvasContext.closePath();

        // transparency
        this.canvasContext.globalAlpha = sound.volume / 255;

        if (this.isMono === false) {
        // color definite by key
            if (this.isSharp === true && this.isGerman === false) {
                switch (sound.number % 12) {

                    case 0:
                        this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
                        break;
                    case 1:
                        this.canvasContext.fillStyle = 'rgb(0, 50, 80)';
                        break;
                    case 2:
                        this.canvasContext.fillStyle = 'rgb(0, 225, 255)';
                        break;
                    case 3:
                        this.canvasContext.fillStyle = 'rgb(0, 255, 255)';
                        break;
                    case 4:
                        this.canvasContext.fillStyle = 'rgb(255, 0, 225)';
                        break;
                    case 5:
                        this.canvasContext.fillStyle = 'rgb(60, 255, 0)';
                        break;
                    case 6:
                        this.canvasContext.fillStyle = 'rgb(0, 190, 180)';
                        break;
                    case 7:
                        this.canvasContext.fillStyle = 'rgb(255, 140, 0)';
                        break;
                    case 8:
                        this.canvasContext.fillStyle = 'rgb(255, 200, 0)';
                        break;
                    case 9:
                        this.canvasContext.fillStyle = 'rgb(0, 0, 255)';
                        break;
                    case 10:
                        this.canvasContext.fillStyle = 'rgb(0, 70, 255)';
                        break;
                    case 11:
                        this.canvasContext.fillStyle = 'rgb(255, 255, 0)';
                        break;
                }
            } else if (this.isSharp === false && this.isGerman === false) {
                switch (sound.number % 12) {

                    case 0:
                        this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
                        break;
                    case 1:
                        this.canvasContext.fillStyle = 'rgb(0, 150, 170)';
                        break;
                    case 2:
                        this.canvasContext.fillStyle = 'rgb(0, 225, 255)';
                        break;
                    case 3:
                        this.canvasContext.fillStyle = 'rgb(150, 0, 170)';
                        break;
                    case 4:
                        this.canvasContext.fillStyle = 'rgb(255, 0, 225)';
                        break;
                    case 5:
                        this.canvasContext.fillStyle = 'rgb(60, 255, 0)';
                        break;
                    case 6:
                        this.canvasContext.fillStyle = 'rgb(190, 50, 0)';
                        break;
                    case 7:
                        this.canvasContext.fillStyle = 'rgb(255, 140, 0)';
                        break;
                    case 8:
                        this.canvasContext.fillStyle = 'rgb(10, 0, 130)';
                        break;
                    case 9:
                        this.canvasContext.fillStyle = 'rgb(0, 0, 255)';
                        break;
                    case 10:
                        this.canvasContext.fillStyle = 'rgb(255, 200, 0)';
                        break;
                    case 11:
                        this.canvasContext.fillStyle = 'rgb(255, 255, 0)';
                        break;
                }
            } else if (this.isSharp === true && this.isGerman === true) {
                switch (sound.number % 12) {

                    case 0:
                        this.canvasContext.fillStyle = 'rgb(114, 47, 55)';
                        break;
                    case 1:
                        this.canvasContext.fillStyle = 'rgb(128, 0, 0)';
                        break;
                    case 2:
                        this.canvasContext.fillStyle = 'rgb(50, 50, 50)';
                        break;
                    case 3:
                        this.canvasContext.fillStyle = 'rgb(58, 57, 39)';
                        break;
                    case 4:
                        this.canvasContext.fillStyle = 'rgb(125, 249, 255)';
                        break;
                    case 5:
                        this.canvasContext.fillStyle = 'rgb(174, 255, 110)';
                        break;
                    case 6:
                        this.canvasContext.fillStyle = 'rgb(204, 255, 2)';
                        break;
                    case 7:
                        this.canvasContext.fillStyle = 'rgb(139, 149, 162)';
                        break;
                    case 8:
                        this.canvasContext.fillStyle = 'rgb(197, 209, 218)';
                        break;
                    case 9:
                        this.canvasContext.fillStyle = 'rgb(43, 98, 244)';
                        break;
                    case 10:
                        this.canvasContext.fillStyle = 'rgb(85, 85, 255)';
                        break;
                    case 11:
                        this.canvasContext.fillStyle = 'rgb(165, 251, 213)';
                        break;
                }
            } else if (this.isSharp === false && this.isGerman === true) {
                switch (sound.number % 12) {

                    case 0:
                        this.canvasContext.fillStyle = 'rgb(114, 47, 55)';
                        break;
                    case 1:
                        this.canvasContext.fillStyle = 'rgb(20, 20, 20)';
                        break;
                    case 2:
                        this.canvasContext.fillStyle = 'rgb(50, 50, 50)';
                        break;
                    case 3:
                        this.canvasContext.fillStyle = 'rgb(135, 205, 273)';
                        break;
                    case 4:
                        this.canvasContext.fillStyle = 'rgb(125, 249, 255)';
                        break;
                    case 5:
                        this.canvasContext.fillStyle = 'rgb(174, 255, 110)';
                        break;
                    case 6:
                        this.canvasContext.fillStyle = 'rgb(131, 132, 146)';
                        break;
                    case 7:
                        this.canvasContext.fillStyle = 'rgb(139, 149, 162)';
                        break;
                    case 8:
                        this.canvasContext.fillStyle = 'rgb(0, 114, 187)';
                        break;
                    case 9:
                        this.canvasContext.fillStyle = 'rgb(43, 98, 244)';
                        break;
                    case 10:
                        this.canvasContext.fillStyle = 'rgb(229, 237, 241)';
                        break;
                    case 11:
                        this.canvasContext.fillStyle = 'rgb(165, 251, 213)';
                        break;
                }
            }
        } else {
            // black and white
            this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
        }

        this.canvasContext.fill();
    }

    visualize(soundObjs: SoundObj[]) {
        // draw the visualization
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let radius = this.canvas.width / 2 - 20;


        // I failed making below into a function lol
        this.drawTrapezoid(-90 * Math.PI / 180, radius, 1, soundObjs[0]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 1, soundObjs[1]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 1, soundObjs[2]);
        this.drawTrapezoid(0, radius, 1, soundObjs[3]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 1, soundObjs[4]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 1, soundObjs[5]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 1, soundObjs[6]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 1, soundObjs[7]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 1, soundObjs[8]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 1, soundObjs[9]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 1, soundObjs[10]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 1, soundObjs[11]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 2, soundObjs[12]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 2, soundObjs[13]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 2, soundObjs[14]);
        this.drawTrapezoid(0, radius, 2, soundObjs[15]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 2, soundObjs[16]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 2, soundObjs[17]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 2, soundObjs[18]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 2, soundObjs[19]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 2, soundObjs[20]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 2, soundObjs[21]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 2, soundObjs[22]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 2, soundObjs[23]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 3, soundObjs[24]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 3, soundObjs[25]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 3, soundObjs[26]);
        this.drawTrapezoid(0, radius, 3, soundObjs[27]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 3, soundObjs[28]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 3, soundObjs[29]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 3, soundObjs[30]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 3, soundObjs[31]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 3, soundObjs[32]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 3, soundObjs[33]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 3, soundObjs[34]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 3, soundObjs[35]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 4, soundObjs[36]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 4, soundObjs[37]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 4, soundObjs[38]);
        this.drawTrapezoid(0, radius, 4, soundObjs[39]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 4, soundObjs[40]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 4, soundObjs[41]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 4, soundObjs[42]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 4, soundObjs[43]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 4, soundObjs[44]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 4, soundObjs[45]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 4, soundObjs[46]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 4, soundObjs[47]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 5, soundObjs[48]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 5, soundObjs[49]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 5, soundObjs[50]);
        this.drawTrapezoid(0, radius, 5, soundObjs[51]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 5, soundObjs[52]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 5, soundObjs[53]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 5, soundObjs[54]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 5, soundObjs[55]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 5, soundObjs[56]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 5, soundObjs[57]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 5, soundObjs[58]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 5, soundObjs[59]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 6, soundObjs[60]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 6, soundObjs[61]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 6, soundObjs[62]);
        this.drawTrapezoid(0, radius, 6, soundObjs[63]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 6, soundObjs[64]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 6, soundObjs[65]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 6, soundObjs[66]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 6, soundObjs[67]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 6, soundObjs[68]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 6, soundObjs[69]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 6, soundObjs[70]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 6, soundObjs[71]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 7, soundObjs[72]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 7, soundObjs[73]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 7, soundObjs[74]);
        this.drawTrapezoid(0, radius, 7, soundObjs[75]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 7, soundObjs[76]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 7, soundObjs[77]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 7, soundObjs[78]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 7, soundObjs[79]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 7, soundObjs[80]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 7, soundObjs[81]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 7, soundObjs[82]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 7, soundObjs[83]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 8, soundObjs[84]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 8, soundObjs[85]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 8, soundObjs[86]);
        this.drawTrapezoid(0, radius, 8, soundObjs[87]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 8, soundObjs[88]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 8, soundObjs[89]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 8, soundObjs[90]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 8, soundObjs[91]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 8, soundObjs[92]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 8, soundObjs[93]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 8, soundObjs[94]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 8, soundObjs[95]);


        this.drawTrapezoid(-90 * Math.PI / 180, radius, 9, soundObjs[96]);
        this.drawTrapezoid(-60 * Math.PI / 180, radius, 9, soundObjs[97]);
        this.drawTrapezoid(-30 * Math.PI / 180, radius, 9, soundObjs[98]);
        this.drawTrapezoid(0, radius, 9, soundObjs[99]);
        this.drawTrapezoid(30 * Math.PI / 180, radius, 9, soundObjs[100]);
        this.drawTrapezoid(60 * Math.PI / 180, radius, 9, soundObjs[101]);
        this.drawTrapezoid(90 * Math.PI / 180, radius, 9, soundObjs[102]);
        this.drawTrapezoid(120 * Math.PI / 180, radius, 9, soundObjs[103]);
        this.drawTrapezoid(150 * Math.PI / 180, radius, 9, soundObjs[104]);
        this.drawTrapezoid(180 * Math.PI / 180, radius, 9, soundObjs[105]);
        this.drawTrapezoid(210 * Math.PI / 180, radius, 9, soundObjs[106]);
        this.drawTrapezoid(240 * Math.PI / 180, radius, 9, soundObjs[107]);
    }
}
