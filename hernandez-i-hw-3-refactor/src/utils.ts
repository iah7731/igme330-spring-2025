import * as utilsInterfaces from "./interfaces/utils-interfaces";

const makeColor = (red : number, green : number, blue : number, alpha : number = 1) : string => { //formats input into colors
    return `rgba(${red},${green},${blue},${alpha})`;
  };
  
  const getRandom = (min : number, max : number) : number => { //gets random num
    return Math.random() * (max - min) + min;
  };
  
  const getRandomColor = () : string => { //gets random color
    const floor = 35; // so that colors are not too bright or too dark 
    const getByte = () => getRandom(floor,255-floor);
    return `rgba(${getByte()},${getByte()},${getByte()},1)`;
  };
  
  const getLinearGradient = (
    ctx : CanvasRenderingContext2D,
    startX : number,
    startY : number,
    endX : number,
    endY : number,
    colorStops : utilsInterfaces.ColorStopList) : CanvasGradient => { //creates a gradient
    let lg = ctx.createLinearGradient(startX,startY,endX,endY);
    for(let stop of colorStops){
      lg.addColorStop(stop.percent,stop.color);
    }
    return lg;
  };
  
  // https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
  const goFullscreen = (element) => { // sets the canvas to full screen
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
    // .. and do nothing if the method is not supported
  };

  const drawCircle = (ctx : CanvasRenderingContext2D, color : string, x : number, y : number,radius : number) : void => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
  }
  
  export {makeColor, getRandomColor, getLinearGradient, goFullscreen, drawCircle};