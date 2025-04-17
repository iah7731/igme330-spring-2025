import * as audioEnums from './enums/audio-enums';

// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**

let audioCtx : AudioContext;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph

let element : HTMLAudioElement;
let sourceNode : MediaElementAudioSourceNode;
let analyserNode : AnalyserNode;
let gainNode : GainNode; 
let highShelfBiquadFilterNode : BiquadFilterNode;
let lowShelfBiquadFilterNode : BiquadFilterNode;

// **Next are "public" methods - we are going to export all of these at the bottom of this file**

const setupWebaudio = (filePath: string) : void => {
    // 1 - The | | is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext;
    audioCtx = new AudioContext;

    // 2 - this creates an <audio> element
    element = new Audio(); //document.querySelector("audio");

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    analyserNode = audioCtx.createAnalyser(); // note the UK spelling of "Analyser"
    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally
    across the sound spectrum.

    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz,
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing
    the amplitude of that frequency.
    */

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = audioEnums.WebAudioDefaults.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = audioEnums.WebAudioDefaults.gain;

    // 8 - create nodes for the high and low shelf filters
    highShelfBiquadFilterNode = audioCtx.createBiquadFilter();
    highShelfBiquadFilterNode.type = "highshelf";

    lowShelfBiquadFilterNode = audioCtx.createBiquadFilter();
    lowShelfBiquadFilterNode.type = "lowshelf";

    // 9 - connect the nodes - we now have an audio graph
    sourceNode.connect(lowShelfBiquadFilterNode);
    lowShelfBiquadFilterNode.connect(highShelfBiquadFilterNode);
    highShelfBiquadFilterNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    
}


const loadSoundFile = (filePath: string)  : void => {
    element.src = filePath;
}


const playCurrentSound = () : void => {
    element.play();
}

const pauseCurrentSound = () : void => {
    element.pause();
}

const setVolume = (value: number | string) : void => {
    value = Number(value); // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

export { audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, analyserNode, highShelfBiquadFilterNode, lowShelfBiquadFilterNode };