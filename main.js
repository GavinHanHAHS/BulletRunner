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

let player = {
  x: 90,
  y: 365,
  speed: 0
};

let keydown = false;
let gamestate = 1;

// todo
// ADD DRAWING ANGLE FOR BULLETS (LIKE IN TIMBERWOLF)!!!
// - bullet holes array (bullet holes also move)
// - background connector thingies array + movement
// - extra background elements
// - actual laser sprites (w/ variation and shakiness)
//    -> many different middle sprites, like w/ tree?
//    -> the ends are always the same so any goes with any
// - better player sprite (sorry little guy!)
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
    bullet: document.getElementById("bullet")
  }

  requestAnimationFrame(main);
}

function main() {
  if(gamestate == 0) {
    // put intro cutscene here
    gamestate = 1;
  } else if(gamestate == 1) {
    drawBackground();

    drawBullets();

    playerLogic();
  }


  requestAnimationFrame(main);
}

function drawBackground() {
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

  // draw metal binding thingies (temporary -- eventually put this into an array of objects and loop studs)
  ctx.fillStyle = "rgb(170, 170, 170)";
  ctx.fillRect(225, 45, 3, 380);
  ctx.fillRect(235, 65, 7, 7);
  ctx.fillRect(235, 165, 7, 7);
  ctx.fillRect(235, 265, 7, 7);
  ctx.fillRect(235, 365, 7, 7);
  ctx.fillRect(525, 45, 3, 380);
  ctx.fillRect(535, 65, 7, 7);
  ctx.fillRect(535, 165, 7, 7);
  ctx.fillRect(535, 265, 7, 7);
  ctx.fillRect(535, 365, 7, 7);
  ctx.fillRect(825, 45, 3, 380);
  ctx.fillRect(835, 65, 7, 7);
  ctx.fillRect(835, 165, 7, 7);
  ctx.fillRect(835, 265, 7, 7);
  ctx.fillRect(835, 365, 7, 7);

  // draw any cool things that pass by here.
}

function playerLogic() {
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
  } else if(player.y < 10) {
    player.speed = 0;
    player.y = 10;
  }

  // collision detection


  // add bullets if player is in the air

  if(player.y < 365 && keydown) { // 365 = player loorheight
    addBullet();
    addBullet();
  } else if(player.y < 365 && Date.now() % 5 == 0) {
    addBullet();
  }

  // draw player
  ctx.drawImage(images.player, player.x, player.y, 50, 90);
}

function drawBullets() {
  // loop through every bullet and check if under floor
  for(let i = 0; i < bullets.length; i++) {
    if(bullets[i].y >= 425) {
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
    ctx.drawImage(images.bullet, bullets[i].x, bullets[i].y, 12, 20);
  }
}

function addBullet() {
  // add a bullet to the bullet array, with random angle.
  let angle = 73 + Math.random() * 35;

  bullets.push({
    x: player.x + 8,
    y: player.y + 52,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180)
  });
}

// event listeners
document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

function keyHandler(event) {
  if(event.type == "keydown") {
    if(event.code == "Space") {
      keydown = true
    }
  } else {
    if(event.code == "Space") {
      keydown = false;
    }
  }
}
