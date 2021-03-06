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
let lasers = [];

let run = 0;

let counter = 0;

let player = {
  x: 90,
  y: 365,
  speed: 0
};

let score = 0;

let keydown = false;
let gamestate = 1;

let cutscene = false;

// todo
// - improve laser sprites (w/ variation and shakiness)
//    -> many different middle sprites, like w/ tree?
// - scientists you can high five maybe?
// - more decorations for background elements, not just big grand ones
//   but ones like lights, doors, signs etc.
// - also maybe make a background image for page to spice it up a lil.
// - when you die you should do an animation and then go back in time.
// - difficulty adjustment over time (increased speed, increased size, or increased generation)

// = when die -> take snapshot of screen -> draw sign that bounces down over it -> give restart option
// = seperate draw and logic of things (so i can keep drawing but without logic)


// possible powerups
// - invincibility temporary
// - clear screen
// - turn lasers into score pickups
// - slowdown temporarily


// do "start" function after page loads
window.addEventListener("load", start);

function start() {
  // images object to easily reference images
  images = {
    player: document.getElementById("player"),
    bullet: document.getElementById("bullet"),
    run: document.getElementById("run"),
    fly: document.getElementById("fly"),
    laserball: document.getElementById("laserball"),
    laser: document.getElementById("laser"),
    hit: document.getElementById("hit"),
    hit2: document.getElementById("hit2"),
    death: document.getElementById("death")
  }

  setVars();

  requestAnimationFrame(main);
}

function main() {
  // global counter variable for things that take time.
  counter++;
  if(counter == 1000) counter = 0;

  if(gamestate == 0) {
    // put intro cutscene here
    gamestate = 1;
  } else if(gamestate == 1) {
    if(counter % 2 == 0) {
      score++;
    }

    backgroundFunction();

    bulletsFunction();

    laserLogic();

    playerFunction();
  } else {
    // time travel cutscene + gameover screen
    drawBackground();

    drawLasers();

    drawBullets();

    deathCutscene();
  }


  requestAnimationFrame(main);
}

function backgroundFunction() {
  // draw background objects

  for(let i = 0; i < background.length; i++) {
    background[i].x -= 5;

    if(background[i].type == "metalBinding") {
      if(background[i].x <= -10 && background[i].type == "metalBinding") {
        background[i].x = 910;
      }
    } else if(background[i].type == "bulletHole") {
      if(background[i].x <= -10) {
        background.splice(i, 1);
        i--;
      }
    } else if(background[i].type == "smallExplosion") {
      if(background[i].life >= 4) {
        background.splice(i, 1);
        i--;
      } else {
        background[i].life++;
      }
    }
  }

  drawBackground();
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


  // draw any cool things that pass by here.
  for(let i = 0; i < background.length; i++) {
    if(background[i].type == "metalBinding") {
      ctx.fillStyle = "rgb(170, 170, 170)";
      ctx.fillRect(background[i].x, background[i].y, 3, 380); // big line
      for(let n = 0; n < 4; n++) {
        ctx.fillRect(background[i].x + 10, background[i].y + 20 + (100 * n), 7, 7); // studs
      } 
    } else if(background[i].type == "bulletHole") {
      ctx.fillStyle = "rgba(80, 80, 80, 0.4)";
      ctx.fillRect(background[i].x, background[i].y, 6, 6);
    } else if(background[i].type == "smallExplosion") {
      if(background[i].kind == 1) {
        ctx.drawImage(images.hit, background[i].x, background[i].y, 15, 15);
      } else {
        ctx.drawImage(images.hit2, background[i].x, background[i].y, 15, 15);
      }
    }
  }

  // score
  ctx.fillStyle = "white";
  ctx.font = "22px Orbitron";
  ctx.fillText(score, 5, 495);
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
  } else if(player.y < 10) {
    player.speed = 0;
    player.y = 10;
  }

  // collision detection
  for(let i = 0; i < lasers.length; i++) { // could make a collision detect function w/ inputs for square dimensions.
    if(lasers[i].type == "v") { // vertical laser collision detection
      if(player.y + 15 > lasers[i].y + 15 && 
        player.y + 15 < lasers[i].y + 65 + (75 * lasers[i].length) || 
        player.y + 85 < lasers[i].y + 65 + (75 * lasers[i].length) && 
        player.y + 85 > lasers[i].y + 15) {
        if(player.x + 30 > lasers[i].x + 15 &&
          player.x + 30 < lasers[i].x + 35 ||
          player.x + 50 > lasers[i].x + 15 &&
          player.x + 50 < lasers[i].x + 35) {
          gamestate++; 
        }
      }
    } else if(lasers[i].type == "h") {
      if(player.y + 15 < lasers[i].y + 15 &&
        player.y + 85 > lasers[i].y + 35
        ||
        player.y + 15 > lasers[i].y + 15 &&
        player.y + 15 < lasers[i].y + 35
        ||
        player.y + 85 > lasers[i].y + 15 &&
        player.y + 85 < lasers[i].y + 35) {
          if(player.x + 30 > lasers[i].x + 15 && 
            player.x + 15 < lasers[i].x + 65 + (75 * lasers[i].length)) {
              gamestate++;
            }
        }
    }
  }


  // add bullets if player is in the air
  if(player.y < 365 && keydown) { // 365 = player floorheight
//    for(let i = 0; i < 1; i++) {
      addBullet();
      if(counter % 6 == 0) {
        addBullet();
      }
//    }
  } else if(player.y < 365 && counter % 10 == 0) {
    addBullet();
  }

  //run counter, to slow down the speed of run cycles

  if(counter % 7 == 0) {
    run++;
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
        let yBullet = bullets[i].y + 9 + Math.random() * 9;

        background.push({
          type: "bulletHole",
          x: bullets[i].x + 20,
          y: yBullet
        });
        background.push({
          type: "smallExplosion",
          x: bullets[i].x + 20,
          y: yBullet,
          life: 0,
          kind: Math.floor(Math.random() * 2 + 1)
        })
      }
      bullets.splice(i, 1);
      i--;
    }
  }

  // loop through every bullet again, this time doing logic.
  for(let i = 0; i < bullets.length; i++) {
    // change every bullet depending on it's angle
    bullets[i].x += bullets[i].xAngle * (8 + bullets[i].spd) - 1;
    bullets[i].y += bullets[i].yAngle * (8 + bullets[i].spd);
  }

  drawBullets();
}

function drawBullets() {
  for(let i = 0; i < bullets.length; i++) {
    // draw every bullet, with correct rotation
    ctx.save();
    ctx.translate(bullets[i].x + 9, bullets[i].y + 9);
    ctx.rotate((bullets[i].degrees + 85) * Math.PI / 180);
    ctx.translate(-(bullets[i].x + 9), -(bullets[i].y + 9));
    ctx.drawImage(images.bullet, bullets[i].x, bullets[i].y, 18, 18);
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
    degrees: angle,
    spd: Math.random() * 4
  });
}

function laserLogic() {
  // add new laser periodically
  if(counter % 70 == 0) {
    let d;

    if(Math.random() > 0.5) {
      d = "v";
    } else {
      d = "h";
    }

    lasers.push({
      x: 950,
      y: 30 + (Math.random() * 275),
      length: Math.floor(Math.random() * 2 + 1),
      type: d
    })
  }

  if(lasers[0]) { // if there is a single laser
    // change position of lasers
    for(let i = 0; i < lasers.length; i++) {
      lasers[i].x -= 5.5;
      
      // delete offscreen lasers
      if(lasers[i].x <= -550) {
        lasers.splice(i, 1);
        i--;
      }
    }
  }

  drawLasers();
}

function drawLasers() {
  // draw lasers
  for(let i = 0; i < lasers.length; i++) {
    ctx.save();

    if(lasers[i].type == "v") { // rotate entire thing by 90 degrees if vertical
      ctx.translate(lasers[i].x + 25, lasers[i].y + 25);
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(-(lasers[i].x + 25), -(lasers[i].y + 25));
    }
    ctx.drawImage(images.laserball, lasers[i].x, lasers[i].y, 50, 50); // start of laster

    let temp = 0;
    for(let n = 1; n <= lasers[i].length; n++) {
      ctx.drawImage(images.laser, lasers[i].x + (50 * n), lasers[i].y, 75, 50);
      temp = n;
    }

    ctx.translate(lasers[i].x + 150, lasers[i].y + 25); // rotate end of laser 180 degrees
    ctx.rotate(180 * Math.PI / 180);
    ctx.translate(-(lasers[i].x + 150), -(lasers[i].y + 25));
    ctx.drawImage(images.laserball, lasers[i].x + 175 - (temp * 50), lasers[i].y, 50, 50); // end of laser

    ctx.restore();
  }
}

function setVars() {
  bullets = [];
  // background elements that're always there.
  background = [
    {type: "metalBinding", x: 225, y: 45},
    {type: "metalBinding", x: 525, y: 45},
    {type: "metalBinding", x: 825, y: 45}
  ]
  lasers = [];

  run = 0;

  counter = 0;

  player = {
    x: 90,
    y: 365,
    speed: 0
  };

  score = 0;

  keydown = false;
  gamestate = 1;

  cutscene = false;
}

function deathCutscene() {
  if(cutscene == false) {
    run = 0;
    counter = 0;
    cutscene = true;
  }

  if(counter % 11 == 0) {
    if(run <= 5) {
      run++;
    }
  } else if(run >= 6) {
    run += 0.5;
    run += run / 14;
    if(run > 450) {
      run = 450;
    }
  }

  ctx.drawImage(images.death, 0 + (200 * run), 0, 200, 200, player.x - 20, player.y - 20, 128.2, 108.4);
  ctx.fillStyle = "rgb(129, 129, 129)";
  ctx.fillRect(250, -300 + (run - 6), 400, 250);
  ctx.fillStyle = "rgb(69, 69, 69)";
  ctx.font = "40px Orbitron";
  ctx.fillText("~ Game Over ~", 300, -220 + (run - 6));
  ctx.font = "24px Orbitron";
  ctx.fillText('Press "r" to go back in time.', 275, -150 + (run - 6));
}


// event listeners
document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

function keyHandler(event) {
  if(event.type == "keydown") {
    if(event.code == "Space" || event.code == "KeyF") {
      keydown = true;
    } else if(event.code == "KeyR" && gamestate == 2) {
      setVars();
      gamestate = 1;
    }
  } else {
    if(event.code == "Space") {
      keydown = false;
    }
  }
}