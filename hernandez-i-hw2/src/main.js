/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
    showGradient: true,
    showBars: true,
    showCircles: true,
    showNoise: false,
    showInvert: false,
    showEmboss: false,
    highshelf: false,
    lowshelf: false
};

let circleSprite1, circleSprite2;
let audioFilenames, audioMetadata;
debugger;
fetch('../data/av-data.json')
    .then(response => response.json())
    .then(jsonData => {
        jsonDataFill(jsonData)
    })
.catch(error => console.error("Error loading JSON:", error));

const jsonDataFill = (jsonData) =>
{
    document.querySelector("#title-av").innerHTML = jsonData.title;
    circleSprite1 = new canvas.CircleSprite(jsonData.spriteValues.x[0], jsonData.spriteValues.y[0], jsonData.spriteValues.radius[0], jsonData.spriteValues.moveSpeed[0]);
    circleSprite2 = new canvas.CircleSprite(jsonData.spriteValues.x[1], jsonData.spriteValues.y[1], jsonData.spriteValues.radius[1], jsonData.spriteValues.moveSpeed[1]);
    audioFilenames = new Array(jsonData.sounds.filenames[0],jsonData.sounds.filenames[1],jsonData.sounds.filenames[2]);
    audioMetadata = new Array(jsonData.sounds.track[0],jsonData.sounds.track[1],jsonData.sounds.track[2]);
}

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    sound1: audioFilenames[0],
});

const init = () => { // sets up the infinite loop
    console.log("init called");
    console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
    audio.setupWebaudio(DEFAULTS.sound1);
    let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    setupUI(canvasElement);
    canvas.setupCanvas(canvasElement, audio.analyserNode);
    loop();
}

const toggleHighshelf = () => {
    if (drawParams.highshelf) {
        audio.highShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
        audio.highShelfBiquadFilterNode.gain.setValueAtTime(25, audio.audioCtx.currentTime);
    } else {
        audio.highShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
}

const toggleLowshelf = () => {
    if (drawParams.lowshelf) {
        audio.lowShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
        audio.lowShelfBiquadFilterNode.gain.setValueAtTime(15, audio.audioCtx.currentTime);
    } else {
        audio.lowShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
}



const setupUI = (canvasElement) => { // sets up the UI
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fs-btn");
    const playButton = document.querySelector("#play-btn");

    // I. set the initial state of the high shelf checkbox
    document.querySelector('#cb-highshelf').checked = drawParams.highshelf; // `highshelf` is a boolean we will declare in a second

    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#cb-highshelf').onchange = e => {
        drawParams.highshelf = e.target.checked;
        toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };

    // III. 
    toggleHighshelf();

    // IIII. set the initial state of the low shelf checkbox
    document.querySelector('#cb-lowshelf').checked = drawParams.lowshelf; // `lowshelf` is a boolean we will declare in a second

    // IIIII. change the value of `lowshelf` every time the low shelf checkbox changes state
    document.querySelector('#cb-lowshelf').onchange = e => {
        drawParams.lowshelf = e.target.checked;
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
    playButton.onclick = e => {
        console.log('audioCtx.state before = ${audio.audioCtx.state}');

        // check if context is in suspended state (autoplay policy)
        if (audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
        console.log('audioCtx.state after = ${audio.audioCtx.state}');
        if (e.target.dataset.playing == "no") {
            // if track is currently paused, play it
            audio.playCurrentSound();
            e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"

        }
        else {
            // if track IS playing, pause it
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
        }

    }

    // C - hookup volume slider & label
    let volumeSlider = document.querySelector("#slider-volume");
    let volumeLabel = document.querySelector("#label-volume");

    // add .oninput event to slider
    volumeSlider.oninput = e => {
        // set the gain
        audio.setVolume(e.target.value);
        // update value of label to match value of slider
        volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
    };

    // set value of label to match initial value of slider
    volumeSlider.dispatchEvent(new Event("input"));

    // D - hookup track <select>
    let trackSelect = document.querySelector("#track-select");
    // add .onchange event to <select>
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        // pause the current track if it is playing
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }

    };

    let gradientCB = document.querySelector("#cb-gradient");
    let barsCB = document.querySelector("#cb-bars");
    let circlesCB = document.querySelector("#cb-circles");
    let noiseCB = document.querySelector("#cb-noise");
    let invertCB = document.querySelector("#cb-invert");
    let embossCB = document.querySelector("#cb-emboss");

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
    canvas.draw(drawParams);
    circleSprite1.draw(canvas.ctx);
    circleSprite2.draw(canvas.ctx);
}

export { init };