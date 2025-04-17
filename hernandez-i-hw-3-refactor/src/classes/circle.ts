import * as utils from '../utils';
import * as canvas from '../canvas';

class CircleSprite {
    private x: number;
    private y: number;
    private radius: number;
    private color: string;
    private xMoveSpeed: number;
    private yMoveSpeed: number;
    private canvasWidth: number;
    private canvasHeight: number;

    constructor(
        x :number, 
        y: number, 
        radius:number, 
        xMoveSpeed:number, 
        yMoveSpeed:number,
        canvasWidth:number,
        canvasHeight:number)

        { //assign values to the circle
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = utils.makeColor(0, 0, 0, 255);
        this.xMoveSpeed = xMoveSpeed;
        this.yMoveSpeed = yMoveSpeed
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update = () : void => { // update the ball's position and bounce it off the corners of the canvas if audio is playing
        this.colorUpdate();

        const playBtn = document.querySelector("#play-btn") as HTMLButtonElement;

        if(playBtn.dataset.playing == "yes")
        {
            if (this.x + this.xMoveSpeed > this.canvasWidth - this.radius || this.x + this.xMoveSpeed < this.radius) {
                this.xMoveSpeed = -this.xMoveSpeed;
            }
            if (this.y + this.yMoveSpeed > this.canvasHeight - this.radius || this.y + this.yMoveSpeed < this.radius) {
                this.yMoveSpeed = -this.yMoveSpeed;
            }
    
            this.x += this.xMoveSpeed;
            this.y += this.yMoveSpeed;
        }
    }

    draw = (ctx : CanvasRenderingContext2D) : void => { //draw the circle if audio is playing

        const playBtn = document.querySelector("#play-btn") as HTMLButtonElement; // grab the button

        if(playBtn.dataset.playing == "yes")
        {
            utils.drawCircle(ctx, this.color, this.x, this.y, this.radius);
        }
    }

    colorUpdate = () : void => { //change the color based on the average of audioData
        let newColor = 0;
        for (let i = 0; i < canvas.audioData.length; i++) {
            newColor += canvas.audioData[i];
        }

        newColor = newColor / canvas.audioData.length;

        this.color = utils.makeColor(newColor, newColor, newColor, 255);
    }
}

export {CircleSprite};