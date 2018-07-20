/*jshint esversion: 6 */

var CANVAS,
    canH,
    canW,
    ctx,
    myGame;
var myColors = new Colors();

var defaultSimSpeed = 100;

var State = {
  myReq: undefined,
  loopRunning: false,
  gameStarted: false,
  lastFrameTimeMs: 0, // The last time the loop was run
  maxFPS: 60, // The maximum FPS allowed
  simSpeed: defaultSimSpeed, // speed of simulation loop
  playTime: 0,
  frameCounter: 0,
  lastKey: 'none',
  mouseX: 0,
  mouseY: 0,
  mouseLeftDown: false,
  mouseRightDown: false
};

function softReset() {
  console.log('soft reset!');
  myGame = undefined;
  State = {
    myReq: undefined,
    loopRunning: false,
    gameStarted: false,
    lastFrameTimeMs: 0, // The last time the loop was run
    maxFPS: 60, // The maximum FPS allowed
    simSpeed: defaultSimSpeed, // speed of simulation loop
    playTime: 0,
    frameCounter: 0,
    lastKey: 'none',
    mouseX: 0,
    mouseY: 0,
    mouseLeftDown: false,
    mouseRightDown: false
  };
}

function Colors() {
  this.black = 'rgba(0, 0, 0, 1)';
  this.darkGrey = 'rgba(50, 50, 50, 1)';
  this.lightGreyTrans = 'rgba(50, 50, 50, 0.3)';
  this.greyReset = 'rgb(211,211,211)';
  this.lighterGreyReset = 'rgb(240,240,240)';
  this.lightGreyBox = 'rgba(220, 220, 220, 1)';
  this.white = 'rgba(250, 250, 250, 1)';
  this.red = 'rgba(230, 0, 0, 1)';
  this.cherry = 'rgba(242,47,8,1)';
  this.green = 'rgba(0, 230, 0, 1)';
  this.blue = 'rgba(0, 0, 230, 1)';
  this.electricBlue = 'rgba(20, 30, 230, 1)';
}

function Box(x,y,color,size) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.size =  size;
  this.xVel = 10;
  this.yVel = -10;

  this.draw = function() {
    ctx.beginPath();
    ctx.rect(this.x,this.y,this.size,this.size);
    ctx.fillStyle = this.color;
    ctx.fill();
    // ctx.stroke();
  };

  this.update = function() {
    // console.log('boxy up');
    if ((this.xVel > 0) && ((this.x + this.size + this.xVel) > canW)) {
      console.log('bounds right');
      this.xVel *= -1;
    }
    if ((this.xVel < 0) && ((this.x + this.xVel) < 0)) {
      console.log('bounds left');
      this.xVel *= -1;
    }
    if ((this.yVel > 0) && ((this.y + this.size + this.yVel) > canH)) {
      console.log('bounds bottom');
      this.yVel *= -1;
    }
    if ((this.yVel < 0) && ((this.y + this.yVel) < 0)) {
      console.log('bounds top');
      this.yVel *= -1;
    }
    this.x += this.xVel;
    this.y += this.yVel;
  };

} // end box

function Game(updateDur) {
  this.timeGap = 0;
  this.lastUpdate = 0;
  this.updateDuration = updateDur; // milliseconds duration between update()
  this.paused = false;
  this.bg = new Image();
  this.boxy = undefined;
  this.pausedTxt = undefined;
  this.mode = 'init';

  this.init = function() {
    this.bg.src = 'bg1.png';
    this.boxy = new Box(20,20,myColors.red,20);
    this.lastUpdate = performance.now();
  };

  this.pauseIt = function() {
    // console.log('GAME paused');
    myGame.paused = true;
    // this.pausedTxt.show = true;
  };
  this.unpauseIt = function() {
    // console.log('GAME un-paused');
    myGame.paused = false;
    // this.pausedTxt.show = false;
    // this prevents pac from updating many times after UNpausing
    this.lastUpdate = performance.now();
    this.timeGap = 0;
  };

  this.clearGrid = function() {
    console.log('clearGrid');
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        this.grid[r][c].color = this.boxColorOff;
        this.grid[r][c].curStatus = 'off';
        this.grid[r][c].prevStatus = 'off';
      }
    }
  };

  this.drawBG = function() { // display background over canvas
    ctx.imageSmoothingEnabled = false;  // turns off AntiAliasing
    ctx.drawImage(this.bg,4,4,CANVAS.width-10,CANVAS.height-10);
  };

  this.draw = function() {
    // draw everything!
    this.boxy.draw();
  }; // end draw

  this.update = function() {
      if (this.paused === false) { // performance based update: myGame.update() runs every myGame.updateDuration milliseconds
            this.timeGap = performance.now() - this.lastUpdate;

            if ( this.timeGap >= this.updateDuration ) { // this update is restricted to updateDuration
              let timesToUpdate = this.timeGap / this.updateDuration;
              for (let i=1; i < timesToUpdate; i++) { // update children objects
                // if (timesToUpdate > 2) {
                //   console.log('timesToUpdate = ', timesToUpdate);
                // }
                // general update area
                this.boxy.update();
              }
              this.lastUpdate = performance.now();
            } // end if

            if (this.mode === "draw") { // run this every update cycle regardless of timing
              // general draw area
            } else {
              // mode is none
            }

      } else if (this.paused === true) {
        // PAUSED! do nothin
      } else {
        console.log('game pause issue');
      }

  }; // end update

} // end myGame


//////////////////////////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////////////////////////
function clearCanvas() {
  ctx.clearRect(-1, -1, canvas.width+1, canvas.height+1); // offset by 1 px because the whole canvas is offset initially (for better pixel accuracy)
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function generalLoopReset() {
  if (State.myReq !== undefined) {  // reset game loop if already started
    cancelAnimationFrame(State.myReq);
  }
  softReset();
  myGame = new Game(State.simSpeed); // ms per update()
  myGame.init();
  State.myReq = requestAnimationFrame(gameLoop);
}

//////////////////////////////////////////////////////////////////////////////////
// KEYBINDINGS
//////////////////////////////////////////////////////////////////////////////////
function keyDown(event) {
    event.preventDefault(); // prevents page from scrolling within window frame
    myGame.lastKey = event.keyCode;
    let code = event.keyCode;
    switch (code) {
        case 37: // Left key
          if (myGame.paused === false) {
            State.lastKey = 'left';
          }
          break;
        case 39: //Right key
          if (myGame.paused === false) {
            State.lastKey = 'right';
          }
          break;
        case 38: // Up key
          if (myGame.paused === false) {
            State.lastKey = 'up';
          }
          break;
        case 40: //Down key
          if (myGame.paused === false) {
            State.lastKey = 'down';
          }
          break;
        case 32: // spacebar
          State.lastKey = 'spacebar';
          if (myGame.paused === true) {
            myGame.unpauseIt();
          } else if (myGame.paused === false) {
            myGame.pauseIt();
          } else {
            //nothin
          }
          console.log('Game pause state = ', myGame.paused);
          break;
        default: // Everything else
          console.log("key = ", code);
          console.log('key down evt ... ');
          console.dir(event);
          State.lastKey = code;
          break;
    }
}

//////////////////////////////////////////////////////////////////////////////////
// MOUSE INPUT
//////////////////////////////////////////////////////////////////////////////////
function mDown(evt) {
  if (myGame.mode === "draw") {
    if (evt.button === 0) {  // left-click
      // console.log('MOUSE: left down');
      if (State.mouseRightDown === false) { State.mouseLeftDown = true; } // only allow one mouse button down at a time, ignore change if both are down
    } else if (evt.button === 2) { // right-click
      // console.log('MOUSE: right down');
      if (State.mouseLeftDown === false) { State.mouseRightDown = true; }
    }
  } else {
    console.log('game not in draw mode');
  }
}

function mUp(evt) {
  if (myGame.mode === "draw") {
    if (evt.button === 0) {  // left-click
      // console.log('MOUSE: left up');
      State.mouseLeftDown = false;
    } else if (evt.button === 2) { // right-click
      // console.log('MOUSE: left up');
      State.mouseRightDown = false;
    }
  } else {
    console.log('game not in draw mode');
  }
}

//////////////////////////////////////////////////////////////////////////////////
// GAME LOOP
//////////////////////////////////////////////////////////////////////////////////
function gameLoop(timestamp) {
  // timestamp is automatically returnd from requestAnimationFrame
  // timestamp uses performance.now() to compute the time
  State.myReq = requestAnimationFrame(gameLoop);

  if ( (State.loopRunning === true) && (State.gameStarted === true) ) { myGame.update(); }

  clearCanvas();
  if (State.gameStarted === false) {
    myGame.drawBG();
  } else {
    myGame.draw();
  }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {

  CANVAS =  $('#canvas')[0];
  ctx =  CANVAS.getContext('2d');
  canH = CANVAS.height;
  canW = CANVAS.width;
  // CANVAS.addEventListener('keydown',keyDown,false);
  canvas.addEventListener("mousedown", mDown, false);
  canvas.addEventListener("mouseup", mUp, false);
  $('body').on('contextmenu', '#canvas', function(e){ return false; }); // prevent right click context menu default action
  canvas.addEventListener('mousemove', function(evt) {
      let rect = CANVAS.getBoundingClientRect();
      State.mouseX = evt.clientX - rect.left;
      State.mouseY = evt.clientY - rect.top;
      $("#coords-x").text(State.mouseX);
      $("#coords-y").text(State.mouseY);
  }, false);

  //INPUT
  var leftMouseDown = false;

  // this is to correct for canvas blurryness on single pixel wide lines etc
  // important when animating to reduce rendering artifacts and other oddities
  // ctx.translate(0.5, 0.5);
  ctx.translate(1, 1);

  // start things up!
  generalLoopReset();
  State.loopRunning = true;
  State.gameStarted = false;
  myGame.mode = 'draw';

  $('#start-btn').click(function() {
    console.log("start button clicked");
    if (myGame.mode === 'draw') {
      myGame.mode = 'sim';
      State.gameStarted = true;
      $('#mode-current-status')[0].innerText = 'simulate';
      let v = $('#speed-slider').val();
      $('#speed-input').prop("value", v);
      myGame.updateDuration = (1000/v);
      myGame.lastUpdate = performance.now();
    } else {
      console.log('must reset before starting again');
    }
  });

  $('#reset-btn').click(function() {
    console.log("reset button clicked");
    generalLoopReset();
    State.loopRunning = true;
    State.gameStarted = false;
    myGame.mode = 'draw';
    $('#pause-btn')[0].innerText = 'PAUSE';
    $('#mode-current-status')[0].innerText = 'draw';
  });

  $('#pause-btn').click(function() {
    console.log("pause button clicked");
    if (myGame.paused === false) {
      myGame.pauseIt();
      $('#pause-btn')[0].innerText = 'UN-PAUSE';
    } else if (myGame.paused === true) {
      myGame.unpauseIt();
      $('#pause-btn')[0].innerText = 'PAUSE';
    }
  });

  //INPUT
  $('#speed-slider').mousedown(function(e1) {
    leftMouseDown = true;
  }).mouseup(function(e2) {
    leftMouseDown = false;
  });
  $('#speed-input').on('change', function(e) {
    let v = this.value;
    $('#speed-slider').prop("value", v);
    if (myGame.mode === 'sim') {
      myGame.updateDuration = (1000/v);
    }
  });

  $('#speed-slider').mousemove(function(e) {
    if (leftMouseDown === true) {
      let v = this.value;
      $('#speed-input').prop("value", v);
      if (myGame.mode === 'sim') {
        myGame.updateDuration = (1000/v);
      }
    }
  });

});
