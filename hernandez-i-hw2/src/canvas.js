import * as utils from './utils.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, frequencyDataRadioButton, timeDomainRadioButton;
let noiseAmount = 0.05;


const setupCanvas = (canvasElement, analyserNodeRef) => { // sets up the canvas
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "#d70071" }, { percent: 1, color: "#0035a9" }, { percent: .5, color: "#9c4e97" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);
    frequencyDataRadioButton = document.querySelector("#radio-frequency-data");
    timeDomainRadioButton = document.querySelector("#radio-time-domain");
}

const drawCircle = (ctx, color, x, y, radius) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

const draw = (params = {}) => { // draws to the canvas each frame
    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference"
    if (frequencyDataRadioButton.checked) {
        analyserNode.getByteFrequencyData(audioData);
    }
    if (timeDomainRadioButton.checked) {
        analyserNode.getByteTimeDomainData(audioData);
    }

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // 4 - draw bars

    let barSpacing = 4;
    let margin = 5;
    let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
    let barWidth = screenWidthForBars / audioData.length;

    if (params.showBars && frequencyDataRadioButton.checked) {

        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.strokeStyle = 'rgba(0,0,0,0.50)';
        // loop through the data and draw!
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
        }

        ctx.restore();
    }
    else if (params.showBars && timeDomainRadioButton.checked) {
        let barHeight = 10;
        let topSpacing = 100;

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.50)';
        ctx.fillStyle = 'rgba(0,0,0,0.50)';
        // loop through the data and draw!
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
        }

        ctx.restore();
    }

    // 5 - draw circles
    if (params.showCircles && frequencyDataRadioButton.checked) {
        let maxRadius = canvasHeight / 4;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < audioData.length; i++) {
            // red-ish circles
            let percent = audioData[i] / 255;
            let circleRadius = percent * maxRadius;
            drawCircle(ctx, utils.makeColor(99, 177, 104, .34 - percent / 3.0), canvasWidth / 2, canvasHeight / 2, circleRadius);

            // blue-ish circles, bigger, more transparent
            drawCircle(ctx, utils.makeColor(40, 255, 142, .10 - percent / 10.0), canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5);

            // yellow-ish circles, smaller
            drawCircle(ctx, utils.makeColor(255, 202, 86, .5 - percent / 5.0), canvasWidth / 2, canvasHeight / 2, circleRadius * .50);
        }
        ctx.restore();
    }

    else if (params.showCircles && timeDomainRadioButton.checked) {

        let maxRadius = canvasHeight / 8;
        ctx.save();
        ctx.globalAlpha = 0.5;

        for (let i = 0; i < audioData.length; i++) {
            if (audioData[i] / 255 >= 0.502) {
                // orange circles
                let percent = audioData[i] / 255;
                let circleRadius = percent * maxRadius;
                drawCircle(ctx, utils.makeColor(245, 150, 42, .34 - percent / 3.0), canvasWidth / 2, (canvasHeight / 2) + 125, circleRadius);

                // red circles, bigger, more transparent
                drawCircle(ctx, utils.makeColor(245, 65, 22, .10 - percent / 10.0), canvasWidth / 2, (canvasHeight / 2) + 125, circleRadius * 1.5);

                // yellow circles, smaller
                drawCircle(ctx, utils.makeColor(245, 211, 78, .5 - percent / 5.0), canvasWidth / 2, (canvasHeight / 2) + 125, circleRadius * .50, 0);
            }

        }
        ctx.restore();

    }

    // 6 - bitmap manipulation
    // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
    // regardless of whether or not we are applying a pixel effect
    // At some point, refactor this code so that we are looping though the image data only if
    // it is necessary

    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array

    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // not using here

    for (let i = 0; i < length; i += 4) {
        // C) randomly change every nth pixel to black depending on user input
        if (params.showNoise && Math.random() < noiseAmount) {
            // data[i] is the red channel
            // data[i+1] is the green channel
            // data[i+2] is the blue channel
            // data[i+3] is the alpha channel
            data[i] = data[i + 1] = data[i + 2] = 0; // zero out the red and green and blue channels
            data[i] = 0; // make the red channel 100% red
        } // end if

        // invert?
        if (params.showInvert) {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;
            data[i + 1] = 255 - green;
            data[i + 2] = 255 - blue;
            //data[i+3] is the alpha, but we're leaving that alone

            // set red
            // set green
            // set blue
        }

    } // end for

    if (params.showEmboss) {
        // note we are stepping though *each* sub-pixel
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue; // skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }
    // D) copy data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

class CircleSprite {
    constructor(x, y, radius, xMoveSpeed, yMoveSpeed) { //assign values to the circle
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = utils.makeColor(0, 0, 0, 255);
        this.xMoveSpeed = xMoveSpeed;
        this.yMoveSpeed = yMoveSpeed
    }

    update() { // update the ball's position and bounce it off the corners of the canvas if audio is playing
        this.colorUpdate();
        if(document.querySelector("#play-btn").dataset.playing == "yes")
        {
            if (this.x + this.xMoveSpeed > canvasWidth - this.radius || this.x + this.xMoveSpeed < this.radius) {
                this.xMoveSpeed = -this.xMoveSpeed;
            }
            if (this.y + this.yMoveSpeed > canvasHeight - this.radius || this.y + this.yMoveSpeed < this.radius) {
                this.yMoveSpeed = -this.yMoveSpeed;
            }
    
            this.x += this.xMoveSpeed;
            this.y += this.yMoveSpeed;
        }
    }

    draw(ctx) { //draw the circle if audio is playing
        if(document.querySelector("#play-btn").dataset.playing == "yes")
        {
            drawCircle(ctx, this.color, this.x, this.y, this.radius);
        }
    }

    colorUpdate() { //change the color based on the average of audioData
        let newColor = 0;
        for (let i = 0; i < audioData.length; i++) {
            newColor += audioData[i];
        }

        newColor = newColor / audioData.length;

        this.color = utils.makeColor(newColor, newColor, newColor, 255);
    }
}

const editNoiseAmount = (num) =>
{
    noiseAmount = num;
}

export { setupCanvas, draw, CircleSprite, ctx, editNoiseAmount};