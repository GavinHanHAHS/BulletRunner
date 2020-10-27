// JAVASCRIPT
"use strict";

//canvas setup
let cnv = document.getElementById("mainCanvas");
let ctx = cnv.getContext("2d");
cnv.width = 900;
cnv.height = 500;

// global variables
let images;

let bullets = [];
let background = [];
let run = 0;

let counter = 0;

let player = {
  x: 90,
  y: 365,
  speed: 0
};

let keydown = false;
let gamestate = 1;

// todo
// - extra background elements
// - actual laser sprites (w/ variation and shakiness)
//    -> many different middle sprites, like w/ tree?
//    -> the ends are always the same so any goes with any
// - ok the player sprite is slightly better but still kinda bad
// - scientists you can high five maybe?
// - more decorations for background elements, not just big grand ones
//   but ones like lights, doors, signs etc.
// - m o a r  sprites.
// - also maybe make a background image for page to spice it up a lil.



// do "start" function after page loads
window.addEventListener("load", start);

function start() {
  // images object to easily reference images
  images = {
    player: document.getElementById("player"),
    bullet: document.getElementById("bullet"),
    run: document.getElementById("run"),
    fly: document.getElementById("fly")
  }

  background = [
    {type: "metalBinding", x: 225, y: 45},
    {type: "metalBinding", x: 525, y: 45},
    {type: "metalBinding", x: 825, y: 45}
  ]

  requestAnimationFrame(main);
}

function main() {
  if(gamestate == 0) {
    // put intro cutscene here
    gamestate = 1;
  } else if(gamestate == 1) {
    backgroundFunction();

    bulletsFunction();

    playerFunction();
  }


  requestAnimationFrame(main);
}

function backgroundFunction() {
  // main back wall
  ctx.fillStyle = "rgb(180, 180, 180)";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  // top and bottom surfaces
  ctx.fillStyle = "rgb(155, 155, 155)";
  ctx.fillRect(0, 0, cnv.width, 45);
  ctx.fillRect(0, cnv.height - 75, cnv.width, 75);

  ctx.fillStyle = "rgb(140, 140, 140)";
  ctx.fillRect(0, cnv.height - 25, cnv.width, 25);
  ctx.fillRect(0, 0, cnv.width, 15);

  // logic for scrolling bg
  for(let i = 0; i < background.length; i++) {
    background[i].x -= 5;
    if(background[i].x <= -10 && background[i].type == "metalBinding") {
      background[i].x = 910;
    } else if(background[i].x <= -10 && background[i].type == "bulletHole") {
      background.splice(i, 1);
      i--;
    }
  }

  // draw metal binding thingies
  ctx.fillStyle = "rgb(170, 170, 170)";
  for(let i = 0; i < background.length; i++) {
    if(background[i].type == "metalBinding") {
      ctx.fillRect(background[i].x, background[i].y, 3, 380); // big line
      for(let n = 0; n < 4; n++) {
        ctx.fillRect(background[i].x + 10, background[i].y + 20 + (100 * n), 7, 7); // studs
      } 
    }
  }

  // bullet holes
  ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
  for(let i = 0; i < background.length; i++) {
    if(background[i].type == "bulletHole") {
      ctx.fillRect(background[i].x, background[i].y, 5, 5);
    }
  }

  // draw any cool things that pass by here.
}

function playerFunction() {
  // change player position
  if(keydown) { // if space is pressed then increased velocity
    player.speed += 0.65;
  } else {
    player.speed -= 0.3;
  }

  player.y -= player.speed;

  if(player.y > 365) { // 365 = floorheight
    player.speed = 0;
    player.y = 365;
  } else if(player.y < 110) {
    player.speed = 0;
    player.y = 110;
  }

  // collision detection
  

  // add bullets if player is in the air
  if(player.y < 365 && keydown) { // 365 = player floorheight
    for(let i = 0; i < 2; i++) {
      addBullet();
    }
  } else if(player.y < 365 && Date.now() % 5 == 0) {
    addBullet();
  }

  //run counter, to slow down the speed of run cycles
  counter++;
  if(counter > 5) {
    run++;
    counter = 0;
    if(run > 7) {
      run = 0;
    }
  }

  if(player.y >= 365) {
    ctx.drawImage(images.run, 0 + (200 * run), 0, 200, 200, player.x - 20, player.y - 20, 128.2, 108.4);
  } else {
    ctx.drawImage(images.fly, player.x - 20, player.y - 20, 128.2, 108.4);
  }

}

function bulletsFunction() {
  // loop through every bullet and check if under floor
  for(let i = 0; i < bullets.length; i++) {
    if(bullets[i].y >= 425 || bullets[i].y <= 30 || bullets[i].x < -10 || bullets[i].x > 900) {
      if(bullets[i].y >= 420) { //add a bullet hole
        background.push({
          type: "bulletHole",
          x: bullets[i].x + 20,
          y: bullets[i].y + 9 + Math.random() * 9
        });
      }
      bullets.splice(i, 1);
      i--;
    }
  }

  // loop through every bullet again, this time doing logic.
  for(let i = 0; i < bullets.length; i++) {
    // change every bullet depending on it's angle
    bullets[i].x += bullets[i].xAngle * 8;
    bullets[i].y += bullets[i].yAngle * 8;
  
    // draw every bullet, with correct rotation
    ctx.save();
    ctx.translate(bullets[i].x + 10, bullets[i].y + 10);
    ctx.rotate((bullets[i].degrees + 85) * Math.PI / 180);
    ctx.translate(-(bullets[i].x + 10), -(bullets[i].y + 10));
    ctx.drawImage(images.bullet, bullets[i].x, bullets[i].y, 12, 20);
    ctx.restore();
  }
}

function addBullet() {
  // add a bullet to the bullet array, with random angle.
  let angle = 73 + Math.random() * 35;

  bullets.push({
    x: player.x + 20,
    y: player.y + 42,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180),
    degrees: angle
  });
}

// event listeners
document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

function keyHandler(event) {
  if(event.type == "keydown") {
    if(event.code == "Space" || event.code == "KeyF") {
      keydown = true;
    }
  } else {
    if(event.code == "Space") {
      keydown = false;
    }
  }
}
