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

let keydown = false;
let gamestate = 1;

// todo
// - extra background elements
// - improve laser sprites (w/ variation and shakiness)
//    -> many different middle sprites, like w/ tree?
// - ok the player sprite is slightly better but still kinda bad
// - scientists you can high five maybe?
// - more decorations for background elements, not just big grand ones
//   but ones like lights, doors, signs etc.
// - m o a r  sprites.
// - also maybe make a background image for page to spice it up a lil.
// - when you die you should do an animation and then go back in time.
// - difficulty adjustment over time (increased speed, increased size, or increased generation)


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
    laser: document.getElementById("laser")
  }

  // background elements that're always there.
  background = [
    {type: "metalBinding", x: 225, y: 45},
    {type: "metalBinding", x: 525, y: 45},
    {type: "metalBinding", x: 825, y: 45}
  ]

  requestAnimationFrame(main);
}

function main() { // =======================================================================
  // global counter variable for things that take time.
  counter++;
  if(counter == 1000) counter = 0;

  if(gamestate == 0) {
    // put intro cutscene here
    gamestate = 1;
  } else if(gamestate == 1) {
    backgroundFunction();

    bulletsFunction();

    laserLogic();

    playerFunction();
  }


  requestAnimationFrame(main);
}

function backgroundFunction() { // =========================================================
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
  ctx.fillStyle = "rgba(80, 80, 80, 0.4)";
  for(let i = 0; i < background.length; i++) {
    if(background[i].type == "bulletHole") {
      ctx.fillRect(background[i].x, background[i].y, 6, 6);
    }
  }

  ctx.fillStyle = "yellow";
  for(let i = 0; i < background.length; i++) {
    if(background[i].type == "smallExplosion") {
      ctx.fillRect(background[i].x, background[i].y, 8, 8);
      if(background[i].life >= 3) {
        background.splice(i, 1);
      } else {
        background[i].life++;
      }
    }
  }

  // draw any cool things that pass by here.
}

function playerFunction() { // ==============================================================
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
  if(player.y < 365 && keydown) { // 365 = player floorheight
//    for(let i = 0; i < 1; i++) {
      addBullet();
      if(counter % 3 == 0) {
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
    //ctx.drawImage(images.run, 0 + (200 * run), 0, 200, 200, player.x - 20, player.y - 20, 128.2, 108.4);
    ctx.drawImage(images.fly, player.x - 20, player.y - 20, 128.2, 108.4);
  }
}

function bulletsFunction() { // =============================================================
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
          life: 0
        })
      }
      bullets.splice(i, 1);
      i--;
    }
  }

  // loop through every bullet again, this time doing logic.
  for(let i = 0; i < bullets.length; i++) {
    // change every bullet depending on it's angle
    bullets[i].x += bullets[i].xAngle * 12 - 2;
    bullets[i].y += bullets[i].yAngle * 12;
  
    // draw every bullet, with correct rotation
    ctx.save();
    ctx.translate(bullets[i].x + 10, bullets[i].y + 10);
    ctx.rotate((bullets[i].degrees + 85) * Math.PI / 180);
    ctx.translate(-(bullets[i].x + 10), -(bullets[i].y + 10));
    ctx.drawImage(images.bullet, bullets[i].x, bullets[i].y, 18, 30);
    ctx.restore();
  }
}

function addBullet() { // ===================================================================
  // add a bullet to the bullet array, with random angle.
  let angle = 73 + Math.random() * 35;

  bullets.push({
    x: player.x + 20,
    y: player.y + 42,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180),
    degrees: angle
  });
  /* joke code
  bullets.push({
    x: player.x + 20,
    y: player.y + 42,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180),
    degrees: angle
  });
  bullets.push({
    x: player.x + 20,
    y: player.y + 42,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180),
    degrees: angle
  });
  
  angle = Math.random() * 360;

  bullets.push({
    x: player.x + 20,
    y: player.y + 42,
    xAngle: Math.cos(angle * Math.PI / 180), // variables for angle in bullet.
    yAngle: Math.sin(angle * Math.PI / 180),
    degrees: angle
  });*/
}

function laserLogic() { // ====================================================================
  // add new laser periodically
  // good value is 40/50
  if(counter % 4 == 0) {
    let d;

    if(Math.random() > 0.5) {
      d = "v";
    } else {
      d = "h";
    }

    lasers.push({
      x: 950,
      y: 30 + (Math.random() * 275),
      length: 2 /*Math.floor(Math.random() * 2 + 1)*/,
      angle: d
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

  ctx.fillStyle = "yellow";
  // draw lasers
  for(let i = 0; i < lasers.length; i++) {
    ctx.save();

    if(lasers[i].angle == "v") { // rotate entire thing by 90 degrees if vertical
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

    //hitbox for vertical
    // if(lasers[i].angle == "v") {
    //   ctx.fillRect(lasers[i].x + 15, lasers[i].y + 15, 20, 50 + 75 * lasers[i].length);
    // } else {
    //   ctx.fillRect(lasers[i].x + 15, lasers[i].y + 15, 50 + 75 * lasers[i].length, 20);
    // }

  }
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
