/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils';
import * as audio from './audio';
import * as canvas from './canvas';
import * as circle from "./classes/circle";
import * as canvasInterfaces from "./interfaces/canvas-interfaces";


const drawParams : canvasInterfaces.DrawParams = {
    showGradient: true,
    showBars: true,
    showCircles: true,
    showNoise: false,
    showInvert: false,
    showEmboss: false,
    highshelf: false,
    lowshelf: false
};

let circleSprite1 : circle.CircleSprite,
circleSprite2 : circle.CircleSprite,
circleSprite3  : circle.CircleSprite,
circleSprite4 : circle.CircleSprite,
audioFilenames : string[], 
audioMetadata : string[],
trackSelect : HTMLSelectElement;
let DEFAULTS;

const jsonDataFill = (jsonData) : void =>
{
    const titleAV = document.querySelector("#title-av") as HTMLTitleElement;
    titleAV.innerHTML = jsonData.title;

    const headingAV = document.querySelector("#heading-av") as HTMLHeadingElement;
    headingAV.innerHTML = jsonData.title;

    circleSprite1 = new circle.CircleSprite(jsonData.spriteValues.x[0], jsonData.spriteValues.y[0], jsonData.spriteValues.radius[0], jsonData.spriteValues.xMoveSpeed[0],jsonData.spriteValues.yMoveSpeed[0],canvas.canvasWidth,canvas.canvasHeight);
    circleSprite2 = new circle.CircleSprite(jsonData.spriteValues.x[1], jsonData.spriteValues.y[1], jsonData.spriteValues.radius[1], jsonData.spriteValues.xMoveSpeed[1],jsonData.spriteValues.yMoveSpeed[1],canvas.canvasWidth,canvas.canvasHeight);
    circleSprite3 = new circle.CircleSprite(jsonData.spriteValues.x[2], jsonData.spriteValues.y[2], jsonData.spriteValues.radius[2], jsonData.spriteValues.xMoveSpeed[2],jsonData.spriteValues.yMoveSpeed[2],canvas.canvasWidth,canvas.canvasHeight);
    circleSprite4 = new circle.CircleSprite(jsonData.spriteValues.x[3], jsonData.spriteValues.y[3], jsonData.spriteValues.radius[3], jsonData.spriteValues.xMoveSpeed[3],jsonData.spriteValues.yMoveSpeed[3],canvas.canvasWidth,canvas.canvasHeight);
    audioFilenames = new Array(jsonData.sounds.filenames[0],jsonData.sounds.filenames[1],jsonData.sounds.filenames[2]);
    audioMetadata = new Array(jsonData.sounds.track[0],jsonData.sounds.track[1],jsonData.sounds.track[2]);

    trackSelect = document.querySelector("#track-select") as HTMLSelectElement;

    for (let i = 0; i < 3; i += 1)
    {
        let newOption = document.createElement('option');
        newOption.text = jsonData.sounds.track[i];
        newOption.value = jsonData.sounds.filenames[i];

        trackSelect.add(newOption,null);
    }

    // 1 - here we are faking an enumeration
    DEFAULTS = Object.freeze({
        sound1: audioFilenames[0],
    });
}

const init = () : void => { // sets up the infinite loop
    console.log("init called");
    console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
    audio.setupWebaudio(DEFAULTS.sound1);
    let canvasElement = document.querySelector("canvas") as HTMLCanvasElement; // hookup <canvas> element
    setupUI(canvasElement);
    canvas.setupCanvas(canvasElement, audio.analyserNode);
    loop();
}

const toggleHighshelf = () : void => {
    if (drawParams.highshelf) {
        audio.highShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
        audio.highShelfBiquadFilterNode.gain.setValueAtTime(25, audio.audioCtx.currentTime);
    } else {
        audio.highShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
}

const toggleLowshelf = () : void => {
    if (drawParams.lowshelf) {
        audio.lowShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
        audio.lowShelfBiquadFilterNode.gain.setValueAtTime(15, audio.audioCtx.currentTime);
    } else {
        audio.lowShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
}



const setupUI = (canvasElement : HTMLCanvasElement) : void => { // sets up the UI
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fs-btn") as HTMLButtonElement;
    const playButton = document.querySelector("#play-btn") as HTMLButtonElement;

    const highShelfCB = document.querySelector('#cb-highshelf') as HTMLInputElement;
    const lowShelfCB = document.querySelector('#cb-lowshelf') as HTMLInputElement;

    // I. set the initial state of the high shelf checkbox
    highShelfCB.checked = drawParams.highshelf;

    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    highShelfCB.onchange = e => {
        drawParams.highshelf = (e.target as HTMLInputElement).checked;
        toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };

    // III. 
    toggleHighshelf();

    // IIII. set the initial state of the low shelf checkbox
    lowShelfCB.checked = drawParams.lowshelf; 

    // IIIII. change the value of `lowshelf` every time the low shelf checkbox changes state
    lowShelfCB.onchange = e => {
        drawParams.lowshelf = (e.target as HTMLInputElement).checked;
        toggleLowshelf(); // turn on or turn off the filter, depending on the value of `lowshelf`!
    };

    // IIIIII. 
    toggleLowshelf();

    // add .onclick event to button
    fsButton.onclick = e => {
        console.log("goFullscreen() called");
        utils.goFullscreen(canvasElement);
    };

    // add .onclick event to button
    playButton.onclick = (e: MouseEvent) => {
        const btn = e.target as HTMLButtonElement;
        console.log('audioCtx.state before = ${audio.audioCtx.state}');

        // check if context is in suspended state (autoplay policy)
        if (audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
        console.log('audioCtx.state after = ${audio.audioCtx.state}');
        if (btn.dataset.playing == "no") {
            // if track is currently paused, play it
            audio.playCurrentSound();
            btn.dataset.playing = "yes"; // our CSS will set the text to "Pause"

        }
        else {
            // if track IS playing, pause it
            audio.pauseCurrentSound();
            btn.dataset.playing = "no"; // our CSS will set the text to "Play"
        }

    }

    // C - hookup volume and noise slider & label
    const volumeSlider = document.querySelector("#slider-volume") as HTMLInputElement;
    const volumeLabel = document.querySelector("#label-volume") as HTMLLabelElement;

    // add .oninput event to slider
    volumeSlider.oninput = () => {
        // set the gain
        audio.setVolume(parseFloat(volumeSlider.value));
        // update value of label to match value of slider
        volumeLabel.innerHTML = `${Math.round((parseFloat(volumeSlider.value) / 2) * 100)}`;
    };

    // set value of label to match initial value of slider
    volumeSlider.dispatchEvent(new Event("input"));

    //repeat this same process with the noise slider

    const noiseSlider = document.querySelector("#slider-noise") as HTMLInputElement;
    let noiseLabel = document.querySelector("#label-noise") as HTMLInputElement;

    noiseSlider.oninput = () => {
        canvas.editNoiseAmount(parseFloat(noiseSlider.value));
        noiseLabel.innerHTML = `${Math.round((parseFloat(noiseSlider.value) / 2) * 100)}`;
    }

    noiseSlider.dispatchEvent(new Event("input"));

    // D - hookup track <select>
    // add .onchange event to <select>
    trackSelect.onchange = () => {
        audio.loadSoundFile(trackSelect.value);
        // pause the current track if it is playing
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }

    };

    let gradientCB = document.querySelector("#cb-gradient") as HTMLInputElement;
    let barsCB = document.querySelector("#cb-bars") as HTMLInputElement;
    let circlesCB = document.querySelector("#cb-circles") as HTMLInputElement;
    let noiseCB = document.querySelector("#cb-noise") as HTMLInputElement;
    let invertCB = document.querySelector("#cb-invert")  as HTMLInputElement;
    let embossCB = document.querySelector("#cb-emboss")  as HTMLInputElement;

    gradientCB.addEventListener('change', () => {
        if (gradientCB.checked) {
            drawParams.showGradient = true;
        }
        else {
            drawParams.showGradient = false;
        }
    })

    barsCB.addEventListener('change', () => {
        if (barsCB.checked) {
            drawParams.showBars = true;
        }
        else {
            drawParams.showBars = false;
        }
    })

    circlesCB.addEventListener('change', () => {
        if (circlesCB.checked) {
            drawParams.showCircles = true;
        }
        else {
            drawParams.showCircles = false;
        }
    })

    noiseCB.addEventListener('change', () => {
        if (noiseCB.checked) {
            drawParams.showNoise = true;
        }
        else {
            drawParams.showNoise = false;
        }
    })

    invertCB.addEventListener('change', () => {
        if (invertCB.checked) {
            drawParams.showInvert = true;
        }
        else {
            drawParams.showInvert = false;
        }
    })

    embossCB.addEventListener('change', () => {
        if (embossCB.checked) {
            drawParams.showEmboss = true;
        }
        else {
            drawParams.showEmboss = false;
        }
    })
};

const loop = () => {
    setTimeout(loop, 17);
    circleSprite1.update();
    circleSprite2.update();
    circleSprite3.update();
    circleSprite4.update();
    canvas.draw(drawParams);
    circleSprite1.draw(canvas.ctx);
    circleSprite2.draw(canvas.ctx);
    circleSprite3.draw(canvas.ctx);
    circleSprite4.draw(canvas.ctx);
}

export { init, jsonDataFill };