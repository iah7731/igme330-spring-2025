let ctx;
let paused = false;
let canvas;
let createRectangles = true;
let createCircles = true;
let createLines = true;

import { getRandomColor } from "./utils.js"
import { getRandomInt } from "./utils.js"
import { drawRectangle } from "./canvas-utils.js"
import { drawArc } from "./canvas-utils.js"
import { drawLine } from "./canvas-utils.js"

const init = () => {
    console.log("page loaded!");
    // #2 Now that the page has loaded, start drawing!

    // A - `canvas` variable points at <canvas> tag
    canvas = document.querySelector("canvas");

    // B - the `ctx` variable points at a "2D drawing context"
    ctx = canvas.getContext("2d");

    drawRectangle(ctx, 0, 0, 640, 480, "white", 1, "black");

    setupUI();
    update();
}

const drawRandomRect = (ctx) => {
    let color = getRandomColor();
    drawRectangle(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(350, 400), getRandomInt(10, 20), color, getRandomInt(1, 25), color);
}

const drawRandomArc = (ctx) => {
    let color = getRandomColor();
    drawArc(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(10, 100), color, getRandomInt(1, 25), color);
}

const drawRandomLine = (ctx) => {
    let color = getRandomColor();
    drawLine(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(1, 25), color);
}

const update = () => {
    if (paused) {
        return;
    }
    requestAnimationFrame(update);

    if (createRectangles) {
        drawRandomRect(ctx);
    }

    if (createCircles) {
        drawRandomArc(ctx);
    }

    if (createLines) {
        drawRandomLine(ctx);
    }
}

const canvasClicked = (e) => {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    console.log(mouseX, mouseY);

    for (let i = 0; i < 10; i++) {
        let x = getRandomInt(-100, 100) + mouseX;
        let y = getRandomInt(-100, 100) + mouseY;
        let radius = getRandomInt(10, 50);
        let color = getRandomColor();
        drawArc(ctx, x, y, radius, color, 1, radius);
    }
}

const setupUI = () => {
    document.querySelector("#btn-pause").onclick = () => {
        paused = true;
    };

    document.querySelector("#btn-play").onclick = () => {
        if (paused != false) {
            paused = false;
            update();
        }

    };

    document.querySelector("#btn-clear").onclick = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 640, 480);
    };

    canvas.onclick = canvasClicked;

    document.querySelector("#cb-rectangles").onclick = (e) => {
        createRectangles = e.target.checked;
    }

    document.querySelector("#cb-circles").onclick = (e) => {
        createCircles = e.target.checked;
    }

    document.querySelector("#cb-lines").onclick = (e) => {
        createLines = e.target.checked;
    }

}

init();
